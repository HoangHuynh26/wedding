import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, Volume2, VolumeX } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { useLanguage } from '../../context/LanguageContext';
import styles from './MusicButton.module.css';

/**
 * Minimalist Circular Outlined Sound Button (exact signature bottom-right speaker button
 * visible in Images 8, 10, 11, 12, 13, 15) + matching Back-to-Top button.
 */
export default function MusicButton() {
  const { isPlaying, toggleAudio, currentTrack } = useAudio();
  const { t } = useLanguage();
  const [showScrollTop, setShowScrollTop] = useState(false);

  const trackTitle = currentTrack?.title || t.quickActions.defaultTrack || 'Wedding Melody';
  const trackArtist = currentTrack?.artist || t.quickActions.defaultTrack || 'Wedding Melody';

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 220);
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
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            key="scroll-to-hero-btn"
            id="scroll-to-hero-btn"
            type="button"
            className={styles.scrollTopButton}
            onClick={handleScrollToHero}
            initial={{ opacity: 0, scale: 0.75, x: 10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.75, x: 10 }}
            whileHover={{ scale: 1.08, translateY: -2 }}
            whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            aria-label={t.quickActions.backToTop}
            title={t.quickActions.backToTop}
          >
            <ChevronUp size={18} strokeWidth={1.6} className={styles.chevronIcon} />
          </motion.button>
        )}
      </AnimatePresence>

      <button
        type="button"
        id="wedding-music-btn"
        className={`${styles.musicButton} ${isPlaying ? styles.isPlaying : ''}`}
        onClick={toggleAudio}
        aria-label={isPlaying ? `${t.quickActions.musicMute}: ${trackTitle}` : `${t.quickActions.musicPlay}: ${trackTitle} - ${trackArtist}`}
        title={isPlaying ? `${t.quickActions.musicMute}: ${trackTitle}` : `${t.quickActions.musicPlay}: ${trackTitle} - ${trackArtist}`}
      >
        {isPlaying && <span className={styles.pulseRing} aria-hidden="true" />}
        <span className={styles.musicIcon}>
          {isPlaying ? <Volume2 size={18} strokeWidth={1.55} /> : <VolumeX size={18} strokeWidth={1.55} />}
        </span>
      </button>
    </div>
  );
}
