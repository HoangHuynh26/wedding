import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import weddingConfig from '../../config/weddingConfig';
import { useLanguage } from '../../context/LanguageContext';
import Sparkles from '../Sparkles/Sparkles';
import styles from './Hero.module.css';

const HERO_SLIDE_INTERVAL_MS = 4000; // Exact 4 seconds per photo continuously

export default function Hero() {
  const videoRef = useRef(null);
  const { t } = useLanguage();

  const mobileSlides = weddingConfig.videos.mobileHeroPhotos || [
    '/photos/tuan-1157.jpg',
    '/photos/tuan-0974.jpg',
    '/photos/tuan-1196.jpg',
    '/photos/tuan-9792.jpg',
  ];

  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );
  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // Desktop fullscreen video continuous autoplay & source reload
  useEffect(() => {
    if (!isMobile && videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, [isMobile, weddingConfig.videos.heroVideo]);

  // Preload next mobile fullscreen portrait photo for seamless 4s transitions
  useEffect(() => {
    if (!isMobile || mobileSlides.length <= 1) return;
    const nextSrc = mobileSlides[(slideIdx + 1) % mobileSlides.length];
    const preloadImg = new window.Image();
    preloadImg.src = nextSrc;
  }, [isMobile, slideIdx, mobileSlides]);

  // Mobile vertical portrait fullscreen slideshow: 4 seconds per photo continuously
  useEffect(() => {
    if (!isMobile || mobileSlides.length <= 1) return;
    const interval = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % mobileSlides.length);
    }, HERO_SLIDE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isMobile, mobileSlides.length]);

  const handleScrollDown = () => {
    const nextSection = document.getElementById('invitation') || document.getElementById('story');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className={styles.heroContainer} id="hero" aria-label="Wedding Hero">
      {/* Background Media: Fullscreen 4s/photo Portrait Loop on Mobile, Fullscreen 4s/photo Video Loop on Desktop */}
      {isMobile ? (
        <div className={styles.mobilePortraitStage} aria-hidden="true">
          <AnimatePresence initial={false}>
            <motion.img
              key={mobileSlides[slideIdx]}
              src={mobileSlides[slideIdx]}
              alt=""
              className={styles.mobileSlideImg}
              initial={{ opacity: 0, scale: 1.01 }}
              animate={{ opacity: 1, scale: 1.06 }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: 0.85, ease: 'easeInOut' },
                scale: { duration: 4.1, ease: 'linear' },
              }}
            />
          </AnimatePresence>
        </div>
      ) : (
        <video
          key={weddingConfig.videos.heroVideo}
          ref={videoRef}
          src={weddingConfig.videos.heroVideo}
          className={styles.videoBackground}
          autoPlay
          loop
          muted
          playsInline
          poster={weddingConfig.videos.heroPoster}
          preload="auto"
          onEnded={(e) => {
            e.currentTarget.currentTime = 0;
            e.currentTarget.play().catch(() => {});
          }}
        >
          <source src={weddingConfig.videos.heroVideo} type="video/mp4" />
        </video>
      )}

      {/* Luminous Overlay */}
      <div className={styles.overlay} />

      {/* Floating Silver Stardust Particles */}
      <Sparkles count={isMobile ? 16 : 28} />

      {/* Main Hero Content — Bride ♡ Groom (Lễ Vu Quy) */}
      <div className={styles.content}>
        {/* Monogram Ring */}
        <motion.div
          className={styles.monogramRing}
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          <img src="/logo.png" alt="Wedding Monogram Logo" />
        </motion.div>

        {/* Subtitle */}
        <motion.span
          className={styles.subheading}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, delay: 0.15 }}
        >
          {t.hero.subtitle}
        </motion.span>

        {/* Couple Names: Cô Dâu ♡ Chú Rể */}
        <motion.div
          className={styles.coupleNamesWrapper}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0, delay: 0.25 }}
        >
          <span className={styles.name}>{weddingConfig.bride.name}</span>
          <span className={styles.heartRow} aria-hidden="true">
            <span className={styles.heartLine} />
            <span className={styles.heartSymbol}>♡</span>
            <span className={styles.heartLine} />
          </span>
          <span className={styles.name}>{weddingConfig.groom.name}</span>
        </motion.div>

        {/* Wedding Date Display */}
        <motion.div
          className={styles.dateBadge}
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, delay: 0.35 }}
        >
          <span className={styles.dateText}>{weddingConfig.event.dateDisplay}</span>
        </motion.div>
      </div>

      {/* Scroll to Discover Animation */}
      <motion.div
        className={styles.scrollIndicator}
        onClick={handleScrollDown}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.55 }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleScrollDown()}
        aria-label={t.hero.scroll}
      >
        <div className={styles.mouseIcon}>
          <div className={styles.mouseWheel} />
        </div>
        <ChevronDown size={16} className={styles.mobileChevron} />
        <span className={styles.scrollLabel}>{t.hero.scroll}</span>
      </motion.div>
    </section>
  );
}
