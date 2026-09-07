import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles as SparklesIcon, ArrowDown } from 'lucide-react';
import weddingConfig from '../../config/weddingConfig';
import { useLanguage } from '../../context/LanguageContext';
import Sparkles from '../Sparkles/Sparkles';
import styles from './Hero.module.css';

export default function Hero() {
  const videoRef = useRef(null);
  const { t, language } = useLanguage();
  const [showCta, setShowCta] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }

    // Reveal CTA button 5 seconds after component mounts
    const timer = setTimeout(() => {
      setShowCta(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleScrollDown = () => {
    const nextSection = document.getElementById('invitation') || document.getElementById('intro');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToRsvp = () => {
    const rsvpSection = document.getElementById('rsvp');
    if (rsvpSection) {
      rsvpSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className={styles.heroContainer} id="hero" aria-label="Wedding Hero">
      {/* Fullscreen Video Background */}
      <video
        ref={videoRef}
        className={styles.videoBackground}
        autoPlay
        loop
        muted
        playsInline
        poster={weddingConfig.videos.heroPoster}
        preload="auto"
      >
        <source src={weddingConfig.videos.heroVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Luminous Overlay */}
      <div className={styles.overlay} />

      {/* Floating Silver Stardust Particles */}
      <Sparkles count={28} />

      {/* Main Hero Content */}
      <div className={styles.content}>
        {/* Monogram Ring */}
        <motion.div
          className={styles.monogramRing}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <img src="./logo.png" alt="Wedding Monogram Logo" />
        </motion.div>

        {/* Subtitle */}
        <motion.span
          className={styles.subheading}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.2 }}
        >
          {t.hero.subtitle}
        </motion.span>

        {/* Couple Names */}
        <motion.div
          className={styles.coupleNamesWrapper}
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, delay: 0.3 }}
        >
          <span className={styles.name}>{weddingConfig.groom.name}</span>
          <span className={styles.heartSymbol}>♡</span>
          <span className={styles.name}>{weddingConfig.bride.name}</span>
        </motion.div>

        {/* Wedding Date Display */}
        <motion.div
          className={styles.dateBadge}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.4 }}
        >
          <span className={styles.dateText}>{weddingConfig.event.dateDisplay}</span>
        </motion.div>

        {/* 5-Second Delayed "Confirm Participation" CTA Button */}
        <AnimatePresence>
          {showCta && (
            <motion.div
              className={styles.heroCtaWrapper}
              initial={{ opacity: 0, y: 25, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <button
                type="button"
                className={styles.heroCtaButton}
                onClick={handleScrollToRsvp}
                id="btn-hero-confirm-participation"
              >
                <SparklesIcon size={16} className={styles.ctaSparkle} />
                <span>{language === 'en' ? 'Confirm Participation' : 'Xác Nhận Tham Dự'}</span>
                <ArrowDown size={16} className={styles.ctaArrow} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scroll to Discover Animation */}
      <motion.div
        className={styles.scrollIndicator}
        onClick={handleScrollDown}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        role="button"
        tabIndex={0}
        aria-label={t.hero.scroll}
      >
        <div className={styles.mouseIcon}>
          <div className={styles.mouseWheel} />
        </div>
        <span>{t.hero.scroll}</span>
      </motion.div>
    </section>
  );
}
