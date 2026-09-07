import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import weddingConfig from '../../config/weddingConfig';
import { useLanguage } from '../../context/LanguageContext';
import styles from './Countdown.module.css';

export default function Countdown() {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date(weddingConfig.event.isoDate).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const timeUnits = [
    { label: t.countdown.days, value: String(timeLeft.days).padStart(2, '0') },
    { label: t.countdown.hours, value: String(timeLeft.hours).padStart(2, '0') },
    { label: t.countdown.minutes, value: String(timeLeft.minutes).padStart(2, '0') },
    { label: t.countdown.seconds, value: String(timeLeft.seconds).padStart(2, '0') },
  ];

  return (
    <section className={`section ${styles.countdownSection}`} id="countdown" aria-label="Wedding Countdown">
      <div className={styles.ambientGlow} />

      <div className="container">
        <div className="section-header">
          <span className="section-subtitle" style={{ color: 'var(--gold-light)' }}>
            {t.countdown.tag}
          </span>
          <div className="gold-divider">
          </div>
        </div>

        {/* Countdown Grid */}
        <div className={styles.countdownGrid}>
          {timeUnits.map((unit, index) => (
            <motion.div
              key={unit.label}
              className={styles.timeBox}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.1 }}
            >
              <span className={styles.timeNumber}>{unit.value}</span>
              <span className={styles.timeLabel}>{unit.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
