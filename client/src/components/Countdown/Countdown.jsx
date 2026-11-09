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

  // Monitor scroll to stick countdown bar to top once user scrolls past countdown section
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      // Stick when top of countdown section reaches or passes top of viewport
      setIsSticky(rect.top <= 0);
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
        className={`section ${styles.countdownSection}`}
        id="countdown"
        aria-label={t.countdown.tag}
      >
        <div className={styles.countdownHeader}>
          <h3 className={styles.countdownTitle}>{t.countdown.tag}</h3>
        </div>
        <div className={styles.timerTrack} role="timer">
          {timeUnits.map(({ key, value }) => (
            <div key={key} className={styles.unitColumn}>
              <span className={styles.digitValue}>{String(value).padStart(2, '0')}</span>
              <span className={styles.unitLabel}>{t.countdown[key]}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Khung ngày giờ phút giây dính theo khi cuộn xuống dưới cùng */}
      <div
        className={`${styles.stickyCountdown} ${isSticky ? styles.stickyVisible : ''}`}
        onClick={scrollToCountdown}
        role="timer"
        aria-live="polite"
        aria-label="Đếm ngược đến ngày cưới"
        title="Chạm để cuộn về phần đếm ngược"
      >
        <div className={styles.stickyTrack}>
          {timeUnits.map(({ key, value }) => (
            <div key={key} className={styles.stickyColumn}>
              <span className={styles.stickyValue}>{String(value).padStart(2, '0')}</span>
              <span className={styles.stickyLabel}>{t.countdown[key]}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
