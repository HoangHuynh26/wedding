import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import styles from './Footer.module.css';

export default function Footer() {
  const { t } = useLanguage();
  const prefersReducedMotion = useReducedMotion();

  const line1 =
    t.footer?.line1 ||
    'Cảm ơn quý khách đã hiện diện và cùng chia sẻ niềm vui trong ngày đặc biệt này.';
  const line2 =
    t.footer?.line2 ||
    'Sự hiện diện của quý khách chính là món quà ý nghĩa nhất dành cho chúng tôi.';
  const thankYou = t.footer?.thankYou || 'Thank you!';

  return (
    <footer className={styles.footer} role="contentinfo">
      <img
        src="/mauve-theme/footer-curtain.webp"
        alt=""
        className={styles.curtainBg}
        loading="lazy"
        decoding="async"
        draggable={false}
        aria-hidden="true"
      />
      <div className={styles.curtainVeil} aria-hidden="true" />

      <motion.div
        className={styles.contentWrap}
        initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
        whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={styles.messageGroup}>
          <p className={styles.messageLine}>{line1}</p>
          <p className={styles.messageLine}>{line2}</p>
        </div>

        <p className={styles.thankYouScript}>{thankYou}</p>
      </motion.div>
    </footer>
  );
}
