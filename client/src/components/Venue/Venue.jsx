import React from 'react';
import { motion } from 'framer-motion';
import weddingConfig from '../../config/weddingConfig';
import { useLanguage } from '../../context/LanguageContext';
import styles from './Venue.module.css';

/**
 * Step 6 — Couture Location Section
 * Pale blush-lavender matte paper (#E8E1E8), high-contrast editorial serif title,
 * sweeping calligraphy venue title, framed embedded Google Map,
 * and minimalist double-bordered rectangular "GET DIRECTIONS / CHỈ ĐƯỜNG" button.
 */
export default function Venue() {
  const { t, venueConfig } = useLanguage();
  const venue = venueConfig || weddingConfig.venue;

  return (
    <section
      className={styles.venueSection}
      id="venue"
      aria-label={t.venue.heading || 'Địa Điểm'}
    >
      <motion.div
        className={styles.locationFolio}
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.05 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2 className={styles.locationHeading}>
          {t.venue.heading || 'Địa Điểm'}
        </h2>

        <h3 className={styles.venueScript}>
          {t.venue.hall || venue.hall}
        </h3>

        <p className={styles.regionCaps}>
          {t.venue.regionCaps || 'PHƯỜNG TRẢNG DÀI, ĐỒNG NAI'}
        </p>

        {/* Framed Interactive Embedded Google Map */}
        <div className={styles.mapFrameSection}>
          <div className={styles.mapFrameWrap}>
            <iframe
              title={t.venue.addressTitle || 'Google Maps Venue Location'}
              src={venue.embedMapUrl}
              className={styles.mapIframe}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
