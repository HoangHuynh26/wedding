import React, { useEffect, useRef, useState } from 'react';
import weddingConfig from '../../config/weddingConfig';
import { useLanguage } from '../../context/LanguageContext';
import styles from './Countdown.module.css';

const targetDate = Date.parse(weddingConfig.event.isoDate);
const minute = 60;
const hour = 60 * minute;
const day = 24 * hour;

function getSecondsLeft() {
  const seconds = Math.floor((targetDate - Date.now()) / 1000);
  return seconds > 0 ? seconds : 0;
}

/**
 * Step 5A — Twilight Dusty Slate-Lavender Countdown Band (Images 9, 10, 11)
 * Features an ornate vintage scalloped pale-mauve plaque over a muted slate-plum backdrop,
 * signed off with delicate italic calligraphy ("Hẹn sớm gặp bạn!" / "See you soon!"),
 * plus a harmonious frosted slate-mauve sticky bar when scrolled past.
 */
export default function Countdown() {
  const { t } = useLanguage();
  const [secondsLeft, setSecondsLeft] = useState(getSecondsLeft);
  const [isSticky, setIsSticky] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const seconds = getSecondsLeft();
      setSecondsLeft(seconds);
      if (seconds === 0) window.clearInterval(interval);
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

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
    sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
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
