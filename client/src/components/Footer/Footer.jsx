import React, { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import styles from './Footer.module.css';

function Divider() {
  return (
    <div className={styles.divider} aria-hidden="true">
      <svg viewBox="0 0 54 20" fill="none" aria-hidden="true" focusable="false">
        <path
          d="M2.5 10c0-4.8 4.6-8.2 10.1-8.2 6.2 0 9.5 3.4 14.4 8.2s8.2 8.2 14.4 8.2c5.5 0 10.1-3.4 10.1-8.2S46.9 1.8 41.4 1.8C35.2 1.8 31.9 5.2 27 10s-8.2 8.2-14.4 8.2C7.1 18.2 2.5 14.8 2.5 10Zm14.1 0c4.6-3.6 7.6-8.2 10.4-8.2 3.1 0 6.1 4.6 10.4 8.2M16.6 10c4.6 3.6 7.6 8.2 10.4 8.2 3.1 0 6.1-4.6 10.4-8.2"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default function Footer() {
  const { t } = useLanguage();
  const prefersReducedMotion = useReducedMotion();
  const footerRef = useRef(null);

  const line1 =
    t.footer?.line1 ||
    'Cảm ơn Quý khách đã hiện diện và cùng chia sẻ niềm vui trong ngày đặc biệt này.';
  const line2 =
    t.footer?.line2 ||
    'Sự hiện diện của Quý khách chính là món quà ý nghĩa nhất dành cho chúng tôi.';
  const thankYou = t.footer?.thankYou || 'Thank you!';

  useEffect(() => {
    const footer = footerRef.current;
    const home = footer?.closest('.wedding-home');
    if (!home || typeof IntersectionObserver === 'undefined') return undefined;

    const visibleRatio = 0.3;
    const observer = new IntersectionObserver(([entry]) => {
      home.toggleAttribute('data-footer-in-view', entry.intersectionRatio >= visibleRatio);
    }, { threshold: visibleRatio });
    observer.observe(footer);

    return () => {
      observer.disconnect();
      home.removeAttribute('data-footer-in-view');
    };
  }, []);

  return (
    <footer ref={footerRef} id="footer" className={styles.footer} role="contentinfo">
      <picture className={styles.artwork} aria-hidden="true">
        <source media="(min-width: 768px)" srcSet="/mauve-theme/footer-velvet-wide.webp" />
        <img
          src="/mauve-theme/footer-velvet-mobile.webp"
          alt=""
          width="960"
          height="1200"
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      </picture>

      <motion.div
        className={styles.contentWrap}
        initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
        whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      >
        <Divider />

        <div className={styles.messageGroup}>
          <p className={styles.messageLine}>{line1}</p>
          <p className={styles.messageLine}>{line2}</p>
        </div>

        <Divider />
        <p className={styles.thankYouScript}>{thankYou}</p>
        <p className={styles.credit}>
          Powered by{' '}
          <a href="https://hoanghuynh-portfolio.netlify.app/" target="_blank" rel="noopener noreferrer">
            Hoàng Huynh
          </a>
        </p>
      </motion.div>
    </footer>
  );
}
