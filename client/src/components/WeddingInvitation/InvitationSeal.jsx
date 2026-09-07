import React from 'react';
import styles from './weddingInvitation.module.css';

export default function InvitationSeal({ monogram = 'H ♡ H' }) {
  return (
    <div className={styles.sealContainer} aria-hidden="true">
      {/* Radiant Golden Glow */}
      <div className={styles.sealAmbientGlow} />

      {/* Sparkling diamond stars around seal */}
      <span className={`${styles.sealSparkle} ${styles.sp1}`}>✦</span>
      <span className={`${styles.sealSparkle} ${styles.sp2}`}>✧</span>
      <span className={`${styles.sealSparkle} ${styles.sp3}`}>✦</span>
      <span className={`${styles.sealSparkle} ${styles.sp4}`}>★</span>

      {/* Wax Seal Medallion */}
      <div className={styles.waxSeal}>
        <div className={styles.waxSealInnerRing}>
          <span className={styles.sealMonogramText}>{monogram}</span>
        </div>
        <div className={styles.waxSealHighlight} />
      </div>
    </div>
  );
}
