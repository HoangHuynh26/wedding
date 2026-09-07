import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Clock, Heart, Music, ArrowDown } from 'lucide-react';
import weddingConfig from '../../config/weddingConfig';
import { useAudio } from '../../context/AudioContext';
import styles from './InvitationModal.module.css';

export default function InvitationModal({ isOpen, onClose }) {
  const [isOpened, setIsOpened] = useState(false);
  const { playAudio } = useAudio();

  const handleOpenEnvelope = async () => {
    // 1. Play background music upon explicit user touch/click
    await playAudio();
    // 2. Unfold envelope and reveal wedding invitation card
    setIsOpened(true);
  };

  const handleExploreStory = () => {
    onClose();
    const heroElement = document.getElementById('hero');
    if (heroElement) {
      heroElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGoToRSVP = () => {
    onClose();
    const rsvpElement = document.getElementById('rsvp');
    if (rsvpElement) {
      setTimeout(() => {
        rsvpElement.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={styles.modalOverlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.envelopeContainer}>
          <AnimatePresence mode="wait">
            {!isOpened ? (
              /* ============================================================ */
              /* 1. Unopened Sealed Envelope Cover                            */
              /* ============================================================ */
              <motion.div
                key="envelope-sealed"
                className={styles.envelopeCover}
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, rotateX: 20 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Decorative Corners */}
                <div className={`${styles.envelopeCornerDecor} ${styles.topLeft}`} />
                <div className={`${styles.envelopeCornerDecor} ${styles.topRight}`} />
                <div className={`${styles.envelopeCornerDecor} ${styles.bottomLeft}`} />
                <div className={`${styles.envelopeCornerDecor} ${styles.bottomRight}`} />

                <img src="./logo.png" />
                <span className={styles.invitationHeaderTitle}>
                  THIỆP MỜI THÀNH HÔN &bull; WEDDING INVITATION
                </span>

                <h1 className={styles.invitationCoupleNames}>
                  {weddingConfig.groom.shortName}
                  <span className={styles.invitationHeart}>♡</span>
                  {weddingConfig.bride.shortName}
                </h1>

                <p className={styles.cordiallyInvitedText}>
                  Trân trọng kính mời quý khách đến dự buổi tiệc chung vui cùng hai gia đình chúng mình.
                </p>

                {/* Wax Seal Interactive Button */}
                <div
                  className={styles.waxSealWrapper}
                  onClick={handleOpenEnvelope}
                  role="button"
                  tabIndex={0}
                  aria-label="Mở Thiệp Cưới"
                  id="open-wedding-invitation-seal"
                >


                  <span className={styles.openPromptText}>
                    <Music size={14} /> 
                  </span>
                  <span className={styles.musicHintText}>
                    (Âm nhạc đám cưới sẽ tự động cất lên)
                  </span>
                </div>
              </motion.div>
            ) : (
              /* ============================================================ */
              /* 2. Revealed Formal Wedding Invitation Card                   */
              /* ============================================================ */
              <motion.div
                key="envelope-opened"
                className={styles.openedCard}
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Close Button */}
                <button
                  type="button"
                  className={styles.closeButton}
                  onClick={onClose}
                  aria-label="Đóng Thiệp Mời"
                >
                  <X size={18} />
                </button>

                <span className={styles.revealedSubtitle}>SAVE OUR SPECIAL DAY</span>
                <h2 className={styles.revealedTitle}>Thư Mời Thành Hôn</h2>

                {/* Couple Wedding Portrait */}
                <div className={styles.couplePhotoWrapper}>
                  <img
                    src={weddingConfig.couplePhoto}
                    alt={`${weddingConfig.groom.name} & ${weddingConfig.bride.name}`}
                    className={styles.couplePhoto}
                  />
                </div>

                {/* Bride & Groom Details with Dates of Birth */}
                <div className={styles.coupleInfoGrid}>
                  {/* Groom */}
                  <div className={styles.coupleCol}>
                    <img
                      src={weddingConfig.groom.avatar}
                      alt={weddingConfig.groom.name}
                      className={styles.avatarSmall}
                    />
                    <span className={styles.personRoleBadge}>{weddingConfig.groom.role}</span>
                    <h3 className={styles.personFullName}>{weddingConfig.groom.name}</h3>
                    <div className={styles.personDob}>
                      <Calendar size={13} color="var(--gold-dark)" />
                      <span><strong>{weddingConfig.groom.dob}</strong></span>
                    </div>
                  </div>

                  {/* Bride */}
                  <div className={styles.coupleCol}>
                    <img
                      src={weddingConfig.bride.avatar}
                      alt={weddingConfig.bride.name}
                      className={styles.avatarSmall}
                    />
                    <span className={styles.personRoleBadge}>{weddingConfig.bride.role}</span>
                    <h3 className={styles.personFullName}>{weddingConfig.bride.name}</h3>
                    <div className={styles.personDob}>
                      <span><strong>{weddingConfig.bride.dob}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Wedding Reception Details */}
                <div className={styles.receptionBox}>
                  <span className={styles.receptionHeader}>THÔNG TIN TIỆC CƯỚI / RECEPTION</span>
                  <h4 className={styles.receptionVenueName}>{weddingConfig.venue.name}</h4>
                  <span className={styles.receptionHall}>{weddingConfig.venue.hall}</span>

                  <div className={styles.timePill}>
                    <Clock size={16} color="var(--gold-dark)" />
                    <span>{weddingConfig.event.timeDisplay} &bull; {weddingConfig.event.fullDateDisplay}</span>
                  </div>

                  <p className={styles.receptionAddress}>
                    <MapPin size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                    {weddingConfig.venue.address}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className={styles.cardActionsRow}>
                  <button
                    type="button"
                    className={styles.primaryActionButton}
                    onClick={handleGoToRSVP}
                    id="invitation-confirm-rsvp-btn"
                  >
                    <span>Xác Nhận Tham Dự (RSVP)</span>
                    <Heart size={15} fill="currentColor" />
                  </button>

                  <button
                    type="button"
                    className={styles.secondaryActionButton}
                    onClick={handleExploreStory}
                    id="invitation-explore-story-btn"
                  >
                    <span>Khám Phá Câu Chuyện</span>
                    <ArrowDown size={15} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
