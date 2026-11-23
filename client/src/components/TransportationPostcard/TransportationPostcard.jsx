import React from 'react';
import { motion } from 'framer-motion';
import weddingConfig from '../../config/weddingConfig';
import { useLanguage } from '../../context/LanguageContext';
import styles from './TransportationPostcard.module.css';

/**
 * Step 8 — Iridescent Mother-of-Pearl Postcard Section (Image 15)
 * Floating pale blush-lavender paper postcard with monochrome vintage postal stamps
 * & wavy postmark emblem, sweeping calligraphy heading, and double-bordered rectangular CTA.
 */
export default function TransportationPostcard() {
  const { t, language, venueConfig } = useLanguage();
  const venue = venueConfig || weddingConfig.venue;
  const tr = t.transportation || {};
  const stampSansFont = language === 'zh' ? '"Noto Sans SC", Montserrat, sans-serif' : 'Montserrat, sans-serif';
  const stampSerifFont = language === 'zh' ? '"Noto Serif SC", "Cormorant Garamond", serif' : 'Cormorant Garamond, serif';

  return (
    <section
      className={styles.postcardSection}
      id="transportation"
      aria-label={tr.heading || 'Đón Tiếp & Di Chuyển'}
    >
      {/* Full-bleed iridescent Mother-of-Pearl silk backdrop (Image 15) */}
      <img
        src="/mauve-theme/mother-of-pearl.webp"
        alt=""
        className={styles.nacreBg}
        loading="lazy"
        decoding="async"
      />
      <div className={styles.nacreVeil} aria-hidden="true" />

      {/* Centered Floating Pale Lavender-Blush Paper Postcard */}
      <motion.article
        className={styles.postcardSheet}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Vintage Monochrome Postal Stamps & Wavy Postmark Cancellation Emblem (Image 15) */}
        <div className={styles.postalHeader} aria-hidden="true">
          <svg
            viewBox="0 0 260 116"
            className={styles.postalSvg}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Left postage stamp */}
            <g transform="translate(34, 6) rotate(-4)">
              <rect
                x="0" y="0" width="76" height="58"
                stroke="#5A5063" strokeWidth="1.2" strokeDasharray="3 2.5"
              />
              <rect x="4" y="4" width="68" height="50" stroke="#5A5063" strokeWidth="0.9" />
              {/* Sunburst botanical motif */}
              <circle cx="38" cy="24" r="9" stroke="#5A5063" strokeWidth="0.9" />
              <path d="M38 11V15M38 33V37M25 24H29M47 24H51M29 15L32 18M44 30L47 33M47 15L44 18M32 30L29 33" stroke="#5A5063" strokeWidth="0.85" />
              <text x="38" y="47" textAnchor="middle" fill="#5A5063" fontSize="6.4" fontFamily={stampSansFont} letterSpacing={language === 'zh' ? '0.6' : '1.3'}>
                {tr.stamp1 || 'LỄ VU QUY'}
              </text>
            </g>

            {/* Right diamond postage stamp */}
            <g transform="translate(152, 10) rotate(6)">
              <polygon
                points="32,2 62,32 32,62 2,32"
                stroke="#5A5063" strokeWidth="1.15" strokeDasharray="3 2"
              />
              <polygon
                points="32,7 57,32 32,57 7,32"
                stroke="#5A5063" strokeWidth="0.85"
              />
              <text x="32" y="29" textAnchor="middle" fill="#5A5063" fontSize="6.2" fontFamily="Montserrat, sans-serif" letterSpacing="1">
                {tr.stamp2 || '17·01·27'}
              </text>
              <text x="32" y="39" textAnchor="middle" fill="#5A5063" fontSize={language === 'zh' ? '5.4' : '5.6'} fontFamily={stampSerifFont} fontStyle={language === 'zh' ? 'normal' : 'italic'}>
                {tr.stampNames || 'Hiền & Huy'}
              </text>
            </g>

            {/* Wavy cancellation lines */}
            <g stroke="#5A5063" strokeWidth="0.95" opacity="0.8">
              <path d="M40 82 Q52 76 64 82 T88 82 T112 82" />
              <path d="M40 89 Q52 83 64 89 T88 89 T112 89" />
              <path d="M40 96 Q52 90 64 96 T88 96 T112 96" />
              <path d="M40 103 Q52 97 64 103 T88 103 T112 103" />
            </g>

            {/* Circular postmark seal */}
            <g transform="translate(136, 91)">
              <circle cx="0" cy="0" r="20" stroke="#5A5063" strokeWidth="1.1" />
              <circle cx="0" cy="0" r="15.5" stroke="#5A5063" strokeWidth="0.7" />
              <text x="0" y="-3" textAnchor="middle" fill="#5A5063" fontSize="5.4" fontFamily={stampSansFont} letterSpacing={language === 'zh' ? '0.6' : '1'}>
                {tr.stamp3 || 'ĐỒNG NAI'}
              </text>
              <line x1="-11" y1="1.5" x2="11" y2="1.5" stroke="#5A5063" strokeWidth="0.6" />
              <text x="0" y="9" textAnchor="middle" fill="#5A5063" fontSize="5.4" fontFamily="Cormorant Garamond, serif">
                2027
              </text>
            </g>
          </svg>
        </div>

        <h2 className={styles.postcardHeading}>
          {tr.heading || 'Đón Tiếp & Di Chuyển'}
        </h2>

        <div className={styles.postcardCopy}>
          <p>{tr.para1}</p>
          <p>{tr.para2}</p>
          <p>{tr.para3}</p>
        </div>

        <a
          href={venue.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.doubleBorderBtn}
        >
          <span className={styles.doubleBorderInner}>
            {tr.pickupBtn || 'XEM VỊ TRÍ ĐÓN TIẾP'}
          </span>
        </a>
      </motion.article>
    </section>
  );
}
