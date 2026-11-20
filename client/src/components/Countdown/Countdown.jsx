import React, { useEffect, useRef, useState } from 'react';
import weddingConfig from '../../config/weddingConfig';
import { useLanguage } from '../../context/LanguageContext';
import styles from './Countdown.module.css';

const minute = 60;
const hour = 60 * minute;
const day = 24 * hour;

function getSecondsLeft(isoDateStr) {
  const targetMs = Date.parse(isoDateStr || weddingConfig.event.isoDate);
  const seconds = Math.floor((targetMs - Date.now()) / 1000);
  return seconds > 0 ? seconds : 0;
}

/**
 * Step 5A — Twilight Dusty Slate-Lavender Countdown Band (Images 9, 10, 11)
 * Features an ornate vintage scalloped pale-mauve plaque over a muted slate-plum backdrop,
 * signed off with delicate italic calligraphy ("Hẹn sớm gặp bạn!" / "See you soon!"),
 * plus a harmonious frosted slate-mauve sticky bar when scrolled past.
 */
export default function Countdown() {
  const { t, eventConfig } = useLanguage();
  const targetIsoDate = eventConfig?.isoDate || weddingConfig.event.isoDate;
  const [secondsLeft, setSecondsLeft] = useState(() => getSecondsLeft(targetIsoDate));
  const [isSticky, setIsSticky] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    setSecondsLeft(getSecondsLeft(targetIsoDate));
    const interval = window.setInterval(() => {
      const seconds = getSecondsLeft(targetIsoDate);
      setSecondsLeft(seconds);
      if (seconds === 0) window.clearInterval(interval);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [targetIsoDate]);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      setIsSticky(rect.bottom <= 48);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToCountdown = () => {
    if (!sectionRef.current) return;
    const startY = window.scrollY || window.pageYOffset;
    const targetY = Math.max(0, sectionRef.current.getBoundingClientRect().top + startY);
    const distance = Math.abs(targetY - startY);
    if (distance < 4) return;

    const duration = Math.min(1900, Math.max(1150, distance * 0.42));
    const startTime = performance.now();
    const htmlEl = document.documentElement;
    const prevScrollBehavior = htmlEl.style.scrollBehavior;
    htmlEl.style.scrollBehavior = 'auto';

    const easeInOutCubic = (t) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    let rafId = null;
    const cancel = () => {
      if (rafId) cancelAnimationFrame(rafId);
      htmlEl.style.scrollBehavior = prevScrollBehavior;
      window.removeEventListener('wheel', cancel);
      window.removeEventListener('touchstart', cancel);
    };
    window.addEventListener('wheel', cancel, { passive: true });
    window.addEventListener('touchstart', cancel, { passive: true });

    const step = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = easeInOutCubic(progress);
      window.scrollTo(0, Math.round(startY + (targetY - startY) * eased));
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        cancel();
      }
    };
    rafId = requestAnimationFrame(step);
  };

  const timeUnits = [
    { key: 'days', value: Math.floor(secondsLeft / day) },
    { key: 'hours', value: Math.floor((secondsLeft % day) / hour) },
    { key: 'minutes', value: Math.floor((secondsLeft % hour) / minute) },
    { key: 'seconds', value: secondsLeft % minute },
  ];

  return (
    <>
      <section
        ref={sectionRef}
        className={styles.countdownSection}
        id="countdown"
        aria-label={t.countdown.heading || t.countdown.tag}
      >
        <div className={styles.innerContainer}>

          <div className={styles.plaqueWrapper}>
            <div className={styles.timerTrack} role="timer">
              {timeUnits.map(({ key, value }) => (
                <div key={key} className={styles.unitColumn}>
                  <span className={styles.digitValue}>
                    {key === 'days' ? value : String(value).padStart(2, '0')}
                  </span>
                  <span className={styles.unitLabel}>{t.countdown[key]}</span>
                </div>
              ))}
            </div>
          </div>

          <p className={styles.seeYouScript}>
            {t.countdown.seeYouSoon || 'Hẹn sớm gặp bạn!'}
          </p>
        </div>
      </section>

      {/* Sticky Mini Countdown Bar in matching Twilight Slate-Mauve Glass */}
      <div
        className={`${styles.stickyCountdown} ${isSticky ? styles.stickyVisible : ''}`}
        onClick={scrollToCountdown}
        role="timer"
        aria-live="polite"
        aria-label={t.countdown.heading || 'Đếm ngược đến ngày cưới'}
      >
        <div className={styles.stickyTrack}>
          {timeUnits.map(({ key, value }) => (
            <div key={key} className={styles.stickyColumn}>
              <span className={styles.stickyValue}>
                {key === 'days' ? value : String(value).padStart(2, '0')}
              </span>
              <span className={styles.stickyLabel}>{t.countdown[key]}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
