import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import weddingConfig from '../../config/weddingConfig';
import { useLanguage } from '../../context/LanguageContext';
import styles from './Venue.module.css';

/**
 * Step 6 — Couture Location Section (Image 12)
 * Pale blush-lavender matte paper (#E8E1E8), high-contrast editorial serif title,
 * sweeping calligraphy venue title, fine-line monochrome villa etching illustration,
 * and minimalist double-bordered rectangular "GET DIRECTIONS / CHỈ ĐƯỜNG" button.
 */
export default function Venue() {
  const { venue } = weddingConfig;
  const { t } = useLanguage();
  const [showMap, setShowMap] = useState(false);

  return (
    <section
      className={styles.venueSection}
      id="venue"
      aria-label={t.venue.heading || 'Địa Điểm'}
    >
      <motion.div
        className={styles.locationFolio}
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
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

        <div className={styles.editorialCopy}>
          <p>{t.venue.para1}</p>
          <p>{t.venue.para2}</p>
          <p className={styles.addressLine}>
            {t.venue.addressText || venue.address}
          </p>
        </div>

        {/* Fine-line vintage plum-charcoal architectural etching (blends directly into lavender paper) */}
        <div className={styles.etchingFrame}>
          <img
            src="/mauve-theme/venue-etching.webp"
            alt={t.venue.hall || venue.name}
            className={styles.etchingImg}
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* Signature Double-Bordered Minimalist Rectangular Button (Image 12) */}
        <div className={styles.actionsStack}>
          <a
            href={venue.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.doubleBorderBtn}
            id="open-google-maps-btn"
          >
            <span className={styles.doubleBorderInner}>
              {t.venue.mapsBtn || 'CHỈ ĐƯỜNG'}
            </span>
          </a>

          <button
            type="button"
            className={styles.mapToggleLink}
            onClick={() => setShowMap((prev) => !prev)}
            aria-expanded={showMap}
          >
            {showMap
              ? (t.venue.toggleMapHide || 'Thu gọn bản đồ')
              : (t.venue.toggleMapShow || 'Xem bản đồ trực tiếp')}
          </button>
        </div>

        {/* Collapsible Embedded Google Map */}
        <AnimatePresence>
          {showMap && (
            <motion.div
              className={styles.mapDrawer}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
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
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
