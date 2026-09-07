import React from 'react';
import weddingConfig from '../../config/weddingConfig';
import { useLanguage } from '../../context/LanguageContext';
import styles from './Footer.module.css';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className="container">

        <h3 className={styles.coupleFullName}>
          {weddingConfig.groom.name} &bull; {weddingConfig.bride.name}
        </h3>

        <p className={styles.footerQuote}>
          {t.footer.quote}
        </p>

        <div className={styles.detailsBadge}>
          {weddingConfig.event.dateDisplay}
        </div>

        <div className={styles.copyright}>
          {t.footer.tagline}
        </div>
      </div>
    </footer>
  );
}
