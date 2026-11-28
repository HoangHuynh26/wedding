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

  const scrollRafRef = React.useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
    };
  }, []);

  const handleScrollToHero = () => {
    if (scrollRafRef.current) {
      cancelAnimationFrame(scrollRafRef.current);
      scrollRafRef.current = null;
    }

    const startY = window.scrollY || window.pageYOffset;
    if (startY <= 0) return;

    // Gentle, unhurried duration (1.25s – 2.15s) scaled smoothly with scroll distance
    const duration = Math.min(2150, Math.max(1250, startY * 0.45));
    const startTime = performance.now();
    const htmlEl = document.documentElement;
    const prevScrollBehavior = htmlEl.style.scrollBehavior;
    htmlEl.style.scrollBehavior = 'auto';

    let cancelled = false;
    const cancelOnUserInput = () => {
      cancelled = true;
      if (scrollRafRef.current) {
        cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
      htmlEl.style.scrollBehavior = prevScrollBehavior;
      cleanupListeners();
    };

    const cleanupListeners = () => {
      window.removeEventListener('wheel', cancelOnUserInput);
      window.removeEventListener('touchstart', cancelOnUserInput);
    };

    window.addEventListener('wheel', cancelOnUserInput, { passive: true });
    window.addEventListener('touchstart', cancelOnUserInput, { passive: true });

    // Silky cubic-bezier-like easeInOutCubic curve: soft takeoff, smooth glide, feather-soft landing
    const easeInOutCubic = (t) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const step = (now) => {
      if (cancelled) return;
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = easeInOutCubic(progress);
      const nextY = Math.round(startY * (1 - eased));

      window.scrollTo(0, nextY);

      if (progress < 1) {
        scrollRafRef.current = requestAnimationFrame(step);
      } else {
        scrollRafRef.current = null;
        htmlEl.style.scrollBehavior = prevScrollBehavior;
        cleanupListeners();
      }
    };

    scrollRafRef.current = requestAnimationFrame(step);
  };

  return (
    <div className={styles.musicButtonWrapper} data-footer-actions="music">
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            key="scroll-to-hero-btn"
            id="scroll-to-hero-btn"
            type="button"
            className={styles.scrollTopButton}
            onClick={handleScrollToHero}
            initial={{ opacity: 0, scale: 0.78 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.78 }}
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
