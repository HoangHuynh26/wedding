import React from 'react';
import { Heart } from 'lucide-react';
import weddingConfig from '../../config/weddingConfig';
import { useLanguage } from '../../context/LanguageContext';
import styles from './ThankYou.module.css';

export default function ThankYou() {
  const { t } = useLanguage();
  const { bride, groom, event } = weddingConfig;
  const content = t.thankYouSection;

  return (
    <section className={`section ${styles.thankYouSection}`} id="thank-you" aria-label="Lời cảm ơn">
      <div className="container">
        <div className={styles.thankYouCard}>
          {/* Subtle Corner Accents */}
          <span className={`${styles.cornerAccent} ${styles.cornerTopLeft}`} aria-hidden="true" />
          <span className={`${styles.cornerAccent} ${styles.cornerTopRight}`} aria-hidden="true" />
          <span className={`${styles.cornerAccent} ${styles.cornerBottomLeft}`} aria-hidden="true" />
          <span className={`${styles.cornerAccent} ${styles.cornerBottomRight}`} aria-hidden="true" />

          {/* Monogram Crest */}
          <div className={styles.monogramCrest}>
            <img src="/logo.png" alt="Monogram" className={styles.logoImg} />
          </div>

          {/* Calligraphic Script Accent */}
          <h2 className={styles.scriptTitle}>{content.scriptTitle}</h2>

          {/* Golden / Silver Heart Divider */}
          <div className={styles.heartDivider} aria-hidden="true">
            <span className={styles.dividerLine} />
            <Heart size={20} className={styles.heartIcon} fill="currentColor" />
            <span className={styles.dividerLine} />
          </div>

          {/* Main Thank You Heading */}
          <h3 className={styles.mainHeading}>{content.heading}</h3>

          {/* Emotional Message */}
          <p className={styles.messageText}>{content.message}</p>

          {/* Couple Sign-off */}
          <div className={styles.signOff}>
            <p className={styles.closingNote}>{content.closing}</p>
            <p className={styles.coupleNames}>
              {bride.name} <span className={styles.ampersand}>&amp;</span> {groom.name}
            </p>
            <p className={styles.weddingDateBadge}>{event.fullDateDisplay}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
