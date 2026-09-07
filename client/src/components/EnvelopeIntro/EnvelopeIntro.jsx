import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Sparkles } from 'lucide-react';
import weddingConfig from '../../config/weddingConfig';
import { useAudio } from '../../context/AudioContext';
import { useLanguage } from '../../context/LanguageContext';
import useInvitationParams from '../../hooks/useInvitationParams';
import SparklesCanvas from '../Sparkles/Sparkles';
import GlitterWrap from '../GlitterWrap/GlitterWrap';
import styles from './EnvelopeIntro.module.css';

export default function EnvelopeIntro({ isVisible, onOpenComplete }) {
  // State: 'closed' | 'opening' | 'done'
  const [phase, setPhase] = useState('closed');
  const transitionTimers = useRef([]);
  const cardRef = useRef(null);
  const { playAudio } = useAudio();
  const { t } = useLanguage();
  const { guestName, inviterName, hasPersonalization } = useInvitationParams();

  // Desktop 3D Interactive Mouse Tilt
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsDesktop(window.innerWidth >= 992 && window.matchMedia('(hover: hover)').matches);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  useEffect(() => () => {
    transitionTimers.current.forEach((timer) => clearTimeout(timer));
  }, []);

  const handleMouseMove = (e) => {
    if (!isDesktop || phase !== 'closed' || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    // Max 8deg tilt
    setTilt({ x: -y * 8, y: x * 8 });
  };

  const handleMouseLeave = () => {
    if (!isDesktop) return;
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const handleOpenInvitation = async (e) => {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    if (phase !== 'closed') return;

    // Instantly ensure we are positioned directly at Hero from the exact moment the card opens
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    // 1. Play background music
    try {
      await playAudio();
    } catch {
      // Audio policy safe
    }

    // 2. Pre-trigger hero video so it plays instantly
    try {
      const heroVideo = document.querySelector('#hero video');
      if (heroVideo) {
        heroVideo.play().catch(() => {});
      }
    } catch {}

    // 3. Single card-opening effect: Flap folds open in 3D & GlitterWrap starfield warp tunnel plays right on Hero
    setPhase('opening');

    transitionTimers.current.push(
      setTimeout(() => {
        setPhase('done');
        onOpenComplete();
      }, 1000)
    );
  };

  if (!isVisible || phase === 'done') return null;

  return (
    <AnimatePresence>
      <motion.div
        className={styles.envelopeGate}
        initial={{ opacity: 1 }}
        animate={
          phase === 'opening'
            ? {
                opacity: 0,
                transition: { duration: 1.0, ease: 'easeOut' },
              }
            : { opacity: 1 }
        }
        exit={{ opacity: 0 }}
      >
        {/* Ambient floating silver stardust when closed */}
        {phase === 'closed' && <SparklesCanvas count={35} />}

        {/* GlitterWrap starfield warp tunnel as the card-opening effect */}
        {phase === 'opening' && (
          <motion.div
            className={styles.glitterWarpOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.1, times: [0, 0.25, 0.75, 1], ease: 'easeInOut' }}
          >
            <GlitterWrap />
          </motion.div>
        )}

        <div className={styles.envelopePerspectiveWrapper}>
          {/* ═══════════════════════════════════════════════
              TOP INVITATION DETAILS (OUTSIDE THE CARD ITSELF)
             ═══════════════════════════════════════════════ */}
          <motion.div
            className={styles.topInvitationBanner}
            initial={{ opacity: 0, y: -16 }}
            animate={
              phase === 'opening'
                ? { opacity: 0, y: -20, transition: { duration: 0.45, ease: 'easeIn' } }
                : { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
            }
          >

            {hasPersonalization ? (
              <div className={styles.topGuestPlaque}>
                <span className={styles.guestSalutation}>
                  <Sparkles size={11} className={styles.sparkleIcon} />
                  <span>Trân Trọng Kính Mời</span>
                  <Sparkles size={11} className={styles.sparkleIcon} />
                </span>
                <h2 className={styles.guestHonorName}>
                  {guestName || 'Quý Khách Quý'}
                </h2>
              </div>
            ) : (
              <div className={styles.topDefaultPlaque}>
                <span className={styles.topSubProclamation}>{t.envelope.subHeader || 'KÍNH BÁO TIN VUI'}</span>
                <p className={styles.topWarmIntro}>
                  {t.envelope.invitation}
                </p>
              </div>
            )}
          </motion.div>

          <div
            ref={cardRef}
            className={styles.envelopeContainer}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
          >
            {/* The Envelope Body with 3D Tilt */}
            <motion.div
              className={styles.envelopeBody}
              animate={
                phase === 'opening'
                  ? {
                      scale: 1.06,
                      opacity: [1, 1, 0],
                      y: -12,
                      transition: { duration: 1.0, times: [0, 0.5, 1], ease: 'easeOut' },
                    }
                  : isDesktop && isHovered
                    ? {
                        rotateX: tilt.x,
                        rotateY: tilt.y,
                        scale: 1.02,
                        transition: { duration: 0.15, ease: 'easeOut' },
                      }
                    : { scale: 1, opacity: 1, y: 0, rotateX: 0, rotateY: 0, filter: 'blur(0px)' }
              }
            >
              {/* Back Lining of Envelope */}
              <div className={styles.envelopeBackLining} />

              {/* FRONT COVER OF PHYSICAL INVITATION */}
              <div
                className={`${styles.envelopePocketFront} ${phase === 'closed' ? styles.pocketClickable : ''}`}
                onClick={phase === 'closed' ? handleOpenInvitation : undefined}
                role={phase === 'closed' ? 'button' : undefined}
                tabIndex={phase === 'closed' ? 0 : -1}
                aria-label={phase === 'closed' ? t.envelope.tapToOpen : undefined}
              >
                {/* Specular Sheen */}
                <div
                  className={styles.specularSheen}
                  style={{
                    transform: isDesktop && isHovered ? `translate(${tilt.y * 3}px, ${-tilt.x * 3}px)` : 'none',
                  }}
                />

                {/* Cover Content */}
                <div className={styles.frontPocketCover}>
                  {/* Top Section: Revealed when flap opens */}
                  <div className={styles.coverTopSection}>
                    <div className={styles.coverInnerReveal}>

                    </div>
                  </div>

                  {/* Bottom Section (Below Center Wax Seal) */}
                  <div className={styles.coverBottomSection}>
                    {/* Couple Names */}
                    <h2 style={{ marginTop: "40px" }} className={styles.leThanhHonHeading}>LỄ THÀNH HÔN</h2>
                    <h1 className={styles.frontNames}>
                      <span className={styles.nameBlock}>{weddingConfig.groom.name}</span>
                      <span className={styles.heartConnector}>♡</span>
                      <span className={styles.nameBlock}>{weddingConfig.bride.name}</span>
                    </h1>

                    {/* Date Pill */}
                    <div className={styles.frontDatePill}>
                      <Calendar size={13} className={styles.pillIcon} />
                      <span>{weddingConfig.event.dateDisplay} • {weddingConfig.event.timeDisplay}</span>
                    </div>

                  </div>
                </div>
              </div>

              {/* 3D ENVELOPE TOP FLAP */}
              <motion.div
                className={styles.envelopeFlap}
                style={{
                  transformOrigin: 'top center',
                  zIndex: phase === 'closed' ? 25 : 3,
                }}
                initial={{ rotateX: 0 }}
                animate={
                  phase === 'closed'
                    ? { rotateX: 0 }
                    : {
                      rotateX: -180,
                      transition: { duration: 0.55, ease: [0.25, 1, 0.5, 1] },
                    }
                }
              >
                <div className={styles.flapTriangle} />
              </motion.div>

              {/* CAST PLATINUM WAX SEAL MEDALLION (CENTER CTA BUTTON) */}
              {phase === 'closed' && (
                <motion.button
                  type="button"
                  className={styles.waxSealTrigger}
                  onClick={handleOpenInvitation}
                  tabIndex={0}
                  aria-label={t.envelope.tapToOpen || 'Mở Thiệp Cưới'}
                  id="btn-open-wax-seal"
                  initial={{ x: '-50%', y: '-50%', scale: 1 }}
                  whileHover={{ x: '-50%', y: '-50%', scale: 1.08 }}
                  whileTap={{ x: '-50%', y: '-50%', scale: 0.94 }}
                >
                  {/* Center Cast Silver Wax Seal Medallion Image */}
                  <div className={styles.waxSealBody}>
                    <img
                      src="/logo.png"
                      alt="Mở thiệp cưới"
                      className={styles.sealImg}
                    />
                    <div className={styles.sealShine} />
                  </div>
                </motion.button>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
