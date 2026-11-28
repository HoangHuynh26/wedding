import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import weddingConfig from '../../config/weddingConfig';
import { useLanguage } from '../../context/LanguageContext';
import styles from './Venue.module.css';

/**
 * Step 6 — Couture Location Section
 * Pale blush-lavender matte paper (#E8E1E8), high-contrast editorial serif title,
 * sweeping calligraphy venue title, balanced full-width address lines,
 * and smooth slide-up lazy-loaded Google Map (defers heavy iframe boot until slide-up begins).
 */
export default function Venue() {
  const { t, venueConfig } = useLanguage();
  const venue = venueConfig || weddingConfig.venue;
  const mapTriggerRef = useRef(null);
  const [shouldMountMap, setShouldMountMap] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Reset loaded state if venue URL changes (e.g. switching between Bride & Groom route)
  useEffect(() => {
    setIsMapLoaded(false);
  }, [venue.embedMapUrl]);

  // Lazy-mount the heavy Google Maps iframe slightly after the map card begins sliding into view
  // so the slide-up animation stays 60–120fps with zero main-thread stutter.
  useEffect(() => {
    if (shouldMountMap) return undefined;
    const el = mapTriggerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setShouldMountMap(true);
      return undefined;
    }

    let timerId = null;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          io.disconnect();
          timerId = window.setTimeout(() => {
            setShouldMountMap(true);
          }, 220);
        }
      },
      { rootMargin: '80px 0px', threshold: 0.05 }
    );

    io.observe(el);
    return () => {
      io.disconnect();
      if (timerId) window.clearTimeout(timerId);
    };
  }, [shouldMountMap]);

  const rawRegion = t.venue.regionCaps || 'PHƯỜNG TRẢNG DÀI, THÀNH PHỐ ĐỒNG NAI';
  const regionLines = String(rawRegion).split('\n');

  return (
    <section
      className={styles.venueSection}
      id="venue"
      aria-label={t.venue.heading || 'Địa Điểm'}
    >
      <div className={styles.locationFolio}>
        <motion.div
          className={styles.headerGroup}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className={styles.locationHeading}>
            {t.venue.heading || 'Địa Điểm'}
          </h2>

          <h3 className={styles.venueScript}>
            {t.venue.hall || venue.hall}
          </h3>

          <p className={styles.regionCaps}>
            {regionLines.map((line, idx) => (
              <span key={idx} className={styles.regionLine}>
                {line}
              </span>
            ))}
          </p>
        </motion.div>

        {/* Smooth Slide-Up Lazy-Loaded Google Map Card */}
        <motion.div
          ref={mapTriggerRef}
          className={styles.mapFrameSection}
          initial={{ opacity: 0, y: 44 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.14 }}
          transition={{ duration: 0.72, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={styles.mapFrameWrap}>
            <div className={styles.mapViewport}>
              {/* Shimmer placeholder kept smoothly visible until Google Maps finishes rendering */}
              <div
                className={`${styles.mapSkeleton} ${isMapLoaded ? styles.mapSkeletonHidden : ''}`}
                aria-hidden="true"
              >
                <span className={styles.mapPinBadge}>
                  <MapPin size={18} strokeWidth={1.6} />
                </span>
                <span className={styles.mapLoadingText}>
                  {t.venue.mapLoading || 'Đang tải bản đồ...'}
                </span>
              </div>

              {shouldMountMap && (
                <iframe
                  title={t.venue.addressTitle || 'Google Maps Venue Location'}
                  src={venue.embedMapUrl}
                  className={`${styles.mapIframe} ${isMapLoaded ? styles.mapIframeReady : ''}`}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  onLoad={() => setIsMapLoaded(true)}
                />
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
