import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { useLanguage } from '../../context/LanguageContext';
import styles from './MusicButton.module.css';

export default function MusicButton() {
  const { isPlaying, toggleAudio, currentTrack } = useAudio();
  const { t } = useLanguage();
  const [showScrollTop, setShowScrollTop] = useState(false);

  const trackTitle = currentTrack?.title || 'Nhạc Cưới';
  const trackArtist = currentTrack?.artist || 'Wedding Melody';

  // Monitor window scroll to show/hide the back to hero button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToHero = () => {
    const heroEl = document.getElementById('hero');
    if (heroEl) {
      heroEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.musicButtonWrapper}>
      {/* 1. Back to Hero button (located to the left of the music button) */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            key="scroll-to-hero-btn"
            id="scroll-to-hero-btn"
            type="button"
            className={styles.scrollTopButton}
            onClick={handleScrollToHero}
            initial={{ opacity: 0, scale: 0.7, x: 12 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.7, x: 12 }}
            whileHover={{ scale: 1.1, translateY: -2 }}
            whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            aria-label={t.quickActions.backToTop}
            title={t.quickActions.backToTop}
          >
            <ChevronUp size={22} className={styles.chevronIcon} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* 2. Floating Music Button */}
      <button
        type="button"
        id="wedding-music-btn"
        className={`${styles.musicButton} ${isPlaying ? styles.isPlaying : ''}`}
        onClick={toggleAudio}
        aria-label={isPlaying ? `${t.quickActions.musicMute}: ${trackTitle}` : `${t.quickActions.musicPlay}: ${trackTitle} - ${trackArtist}`}
        title={isPlaying ? `${t.quickActions.musicMute}: ${trackTitle}` : `${t.quickActions.musicPlay}: ${trackTitle} - ${trackArtist}`}
      >
        {isPlaying && (
          <>
            <div className={styles.pulseRing} />
            <div className={styles.pulseRingSecondary} />
          </>
        )}
        <span className={styles.musicIcon}>{isPlaying ? '♫' : '🔇'}</span>
      </button>
    </div>
  );
}
