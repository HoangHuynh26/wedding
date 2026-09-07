import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import weddingConfig from '../../config/weddingConfig';
import { useLanguage } from '../../context/LanguageContext';
import InvitationSeal from './InvitationSeal';
import styles from './weddingInvitation.module.css';

export default function InvitationCover({ onOpen, isOpening }) {
  const { groom, bride, event } = weddingConfig;
  const { t, language } = useLanguage();
  const cardRef = useRef(null);

  // Desktop subtle 3D tilt
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsDesktop(window.innerWidth >= 1024 && window.matchMedia('(hover: hover)').matches);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const handleMouseMove = (e) => {
    if (!isDesktop || isOpening || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    // Subtle tilt: max 6deg
    setTilt({ x: -y * 8, y: x * 8 });
  };

  const handleMouseLeave = () => {
    if (!isDesktop) return;
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const openButtonLabel = language === 'en' ? 'OPEN INVITATION' : 'MỞ THIỆP MỜI';

  return (
    <motion.div
      ref={cardRef}
      className={styles.invitationCover}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      animate={
        isOpening
          ? {
              rotateX: -180,
              transition: { duration: 1.2, ease: [0.33, 1, 0.68, 1] },
            }
          : isDesktop && isHovered
          ? {
              rotateX: tilt.x,
              rotateY: tilt.y,
              scale: 1.02,
              transition: { duration: 0.15, ease: 'easeOut' },
            }
          : {
              rotateX: 0,
              rotateY: 0,
              scale: 1,
              transition: { duration: 0.6, ease: 'easeOut' },
            }
      }
      style={{
        transformOrigin: 'top center',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Front Face of the Physical Card Flap */}
      <div className={styles.coverFrontFace}>
        {/* Ornate Gold Foil Borders & Corner Filigrees */}
        <div className={styles.cardGoldBorder}>
          <div className={`${styles.cornerFiligree} ${styles.cTopLeft}`} />
          <div className={`${styles.cornerFiligree} ${styles.cTopRight}`} />
          <div className={`${styles.cornerFiligree} ${styles.cBottomLeft}`} />
          <div className={`${styles.cornerFiligree} ${styles.cBottomRight}`} />

          {/* Invitation Title & Header Ornament */}
          <div className={styles.coverHeader}>
            <span className={styles.invitationSuperTitle}>
              {language === 'en' ? 'THE WEDDING OF' : 'THIỆP MỜI THÀNH HÔN'}
            </span>
          </div>

          {/* Couple Names */}
          <div className={styles.coverCoupleWrapper}>
            <h1 className={styles.coverGroomName}>{groom.name}</h1>
            <span className={styles.coverHeartOrnament}>♡</span>
            <h1 className={styles.coverBrideName}>{bride.name}</h1>
          </div>

          {/* Wedding Date Display */}
          <div className={styles.coverDateBadge}>
            <span className={styles.coverDateText}>{event.dateDisplay}</span>
          </div>

          {/* Decorative Wax Seal */}
          <div className={styles.sealWrapper}>
            <InvitationSeal monogram="H ♡ H" />
          </div>

          {/* Subtitle Message */}
          <p className={styles.coverWelcomeText}>
            {t.envelope.invitation}
          </p>

          {/* "OPEN INVITATION" Physical Button */}
          <motion.div
            className={styles.openButtonContainer}
            animate={isOpening ? { opacity: 0, scale: 0.85, transition: { duration: 0.3 } } : { opacity: 1, scale: 1 }}
          >
            <button
              type="button"
              className={styles.openInvitationBtn}
              onClick={onOpen}
              disabled={isOpening}
              id="btn-open-physical-invitation"
              aria-label={openButtonLabel}
            >
              <span className={styles.btnShimmer} />
              <span className={styles.btnText}>{openButtonLabel}</span>
              <span className={styles.btnIcon}>♡</span>
            </button>
            <span className={styles.btnHint}>
              {t.envelope.audioNote}
            </span>
          </motion.div>
        </div>
      </div>

    </motion.div>
  );
}
