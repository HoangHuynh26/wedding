import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Maximize2, ZoomIn } from 'lucide-react';
import weddingConfig from '../../config/weddingConfig';
import { useLanguage } from '../../context/LanguageContext';
import styles from './Gallery.module.css';

export default function Gallery() {
  const { t, language } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const thumbnailTrackRef = useRef(null);
  const thumbRefs = useRef([]);

  // Touch swipe support for main photo
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Assemble photo collection for the Album
  const galleryItems = useMemo(() => {
    const groomTitle = language === 'en' ? 'Groom — Đình Huy' : 'Chú Rể — Đình Huy';
    const groomCaption = language === 'en' ? 'Trần Lê Đình Huy · 14/10/1997' : 'Trần Lê Đình Huy · 14/10/1997';
    const brideTitle = language === 'en' ? 'Bride — Thu Hiền' : 'Cô Dâu — Thu Hiền';
    const brideCaption = language === 'en' ? 'Nguyễn Thị Thu Hiền · 23/11/1999' : 'Nguyễn Thị Thu Hiền · 23/11/1999';

    const basePhotos = [
      {
        image: '/groom.jpg',
        thumbnail: '/groom.jpg',
        title: groomTitle,
        caption: groomCaption,
      },
      {
        image: '/bride.jpg',
        thumbnail: '/bride.jpg',
        title: brideTitle,
        caption: brideCaption,
      },
    ];

    const albumPhotos = weddingConfig.gallery.map((photo, idx) => ({
      image: photo.src,
      thumbnail: photo.thumbnail || photo.src,
      title: t.gallery.photos?.[idx]?.title || photo.title,
      caption: t.gallery.photos?.[idx]?.caption || photo.caption,
    }));

    return [...basePhotos, ...albumPhotos];
  }, [t, language]);

  const activePhoto = galleryItems[activeIndex] || galleryItems[0];

  const handleNext = useCallback(
    (e) => {
      e?.stopPropagation();
      setActiveIndex((prev) => (prev + 1) % galleryItems.length);
    },
    [galleryItems.length]
  );

  const handlePrev = useCallback(
    (e) => {
      e?.stopPropagation();
      setActiveIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
    },
    [galleryItems.length]
  );

  // Auto-scroll thumbnail into view when activeIndex changes
  useEffect(() => {
    const targetThumb = thumbRefs.current[activeIndex];
    if (targetThumb && thumbnailTrackRef.current) {
      targetThumb.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [activeIndex]);

  const scrollThumbnails = (direction) => {
    if (thumbnailTrackRef.current) {
      const scrollAmount = thumbnailTrackRef.current.clientWidth * 0.65;
      thumbnailTrackRef.current.scrollBy({
        left: direction === 'next' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Touch swipe gesture handlers for main photo
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 45;
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // Cinematic Lightbox Handlers
  const openLightbox = useCallback((index) => {
    setLightboxIndex(index);
    setIsZoomed(false);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
    setIsZoomed(false);
    document.body.style.overflow = '';
  }, []);

  const showNextLightbox = useCallback(
    (e) => {
      e?.stopPropagation();
      setIsZoomed(false);
      setLightboxIndex((prev) => (prev !== null ? (prev + 1) % galleryItems.length : null));
    },
    [galleryItems.length]
  );

  const showPrevLightbox = useCallback(
    (e) => {
      e?.stopPropagation();
      setIsZoomed(false);
      setLightboxIndex((prev) => (prev !== null ? (prev - 1 + galleryItems.length) % galleryItems.length : null));
    },
    [galleryItems.length]
  );

  const toggleZoom = (e) => {
    e?.stopPropagation();
    setIsZoomed((prev) => !prev);
  };

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNextLightbox();
      if (e.key === 'ArrowLeft') showPrevLightbox();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, closeLightbox, showNextLightbox, showPrevLightbox]);

  const currentLightboxPhoto = lightboxIndex !== null ? galleryItems[lightboxIndex] : null;

  return (
    <section className={`section ${styles.gallerySection}`} id="gallery" aria-label="Photo Gallery">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-subtitle">{t.gallery.tag}</span>
          <h2 className="section-title">{t.gallery.title}</h2>
          <div className="gold-divider">
            <span>❦</span>
          </div>
          <p className={styles.galleryIntroText}>
            {t.gallery.intro}
          </p>
        </div>

        {/* ═══════════════════════════════════════════════
            CLASSIC EDITORIAL WEDDING ALBUM VIEWER
            (Unified Layout for Desktop, Tablet, and Mobile)
           ═══════════════════════════════════════════════ */}
        <div className={styles.albumContainer}>
          {/* Main Featured Photo Frame */}
          <div
            className={styles.mainPhotoFrame}
            onClick={() => openLightbox(activeIndex)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            role="button"
            tabIndex={0}
            aria-label={`View photo ${activeIndex + 1} in fullscreen`}
          >
            {/* Top Counter & Expand Button */}
            <div className={styles.frameBadgeOverlay}>
              <span className={styles.counterBadge}>
                {String(activeIndex + 1).padStart(2, '0')} / {String(galleryItems.length).padStart(2, '0')}
              </span>
              <button
                type="button"
                className={styles.expandIconBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  openLightbox(activeIndex);
                }}
                aria-label="Expand image"
              >
                <Maximize2 size={15} />
              </button>
            </div>

            {/* Featured Image with Fade Animation */}
            <AnimatePresence mode="wait">
              <motion.img
                key={activeIndex}
                src={activePhoto.image}
                alt={activePhoto.title}
                className={styles.featuredImg}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                loading="eager"
              />
            </AnimatePresence>

            {/* Main Navigation Left Arrow */}
            <button
              type="button"
              className={`${styles.mainNavBtn} ${styles.mainNavPrev}`}
              onClick={handlePrev}
              aria-label="Previous photo"
            >
              <ChevronLeft size={28} />
            </button>

            {/* Main Navigation Right Arrow */}
            <button
              type="button"
              className={`${styles.mainNavBtn} ${styles.mainNavNext}`}
              onClick={handleNext}
              aria-label="Next photo"
            >
              <ChevronRight size={28} />
            </button>
          </div>

          {/* Active Photo Caption & Meta */}
          <motion.div
            key={`meta-${activeIndex}`}
            className={styles.photoMetaBar}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <h3 className={styles.photoTitle}>{activePhoto.title}</h3>
            {activePhoto.caption && <p className={styles.photoCaption}>{activePhoto.caption}</p>}
          </motion.div>

          {/* Thumbnail Strip with Navigation Arrows */}
          <div className={styles.thumbnailSection}>
            <button
              type="button"
              className={`${styles.thumbNavBtn} ${styles.thumbNavPrev}`}
              onClick={() => scrollThumbnails('prev')}
              aria-label="Scroll thumbnails left"
            >
              <ChevronLeft size={20} />
            </button>

            <div className={styles.thumbnailTrack} ref={thumbnailTrackRef}>
              {galleryItems.map((item, idx) => (
                <button
                  key={idx}
                  ref={(el) => (thumbRefs.current[idx] = el)}
                  type="button"
                  className={`${styles.thumbnailCard} ${idx === activeIndex ? styles.thumbnailActive : ''}`}
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Select photo ${idx + 1}`}
                  aria-pressed={idx === activeIndex}
                >
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className={styles.thumbImg}
                    loading="lazy"
                  />
                  {idx === activeIndex && <div className={styles.activeBorderGlow} />}
                </button>
              ))}
            </div>

            <button
              type="button"
              className={`${styles.thumbNavBtn} ${styles.thumbNavNext}`}
              onClick={() => scrollThumbnails('next')}
              aria-label="Scroll thumbnails right"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Cinematic Full-Screen Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && currentLightboxPhoto && (
          <motion.div
            className={styles.lightboxBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              className={styles.closeButton}
              onClick={closeLightbox}
              aria-label="Close photo viewer"
            >
              <X size={24} />
            </button>

            {/* Lightbox Navigation Buttons */}
            <button
              className={`${styles.navButton} ${styles.prevButton}`}
              onClick={showPrevLightbox}
              aria-label="Previous photo"
            >
              <ChevronLeft size={30} />
            </button>

            <button
              className={`${styles.navButton} ${styles.nextButton}`}
              onClick={showNextLightbox}
              aria-label="Next photo"
            >
              <ChevronRight size={30} />
            </button>

            {/* Main Lightbox Content */}
            <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
              <div
                className={`${styles.lightboxImageWrapper} ${isZoomed ? styles.isZoomed : ''}`}
                onClick={toggleZoom}
                title={isZoomed ? 'Click to zoom out' : 'Click to zoom in'}
              >
                <img
                  src={currentLightboxPhoto.image}
                  alt={currentLightboxPhoto.title}
                  className={`${styles.lightboxImg} ${isZoomed ? styles.zoomed : ''}`}
                />
              </div>

              {/* Lightbox Info Bar */}
              <div className={styles.lightboxInfo}>
                <div className={styles.lightboxCounter}>
                  {String(lightboxIndex + 1).padStart(2, '0')} / {String(galleryItems.length).padStart(2, '0')}
                </div>
                <h4 className={styles.lightboxTitle}>{currentLightboxPhoto.title}</h4>
                {currentLightboxPhoto.caption && (
                  <p className={styles.lightboxCaption}>{currentLightboxPhoto.caption}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
