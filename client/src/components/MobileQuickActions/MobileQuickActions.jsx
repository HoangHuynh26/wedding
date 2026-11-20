import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MapPin, X } from 'lucide-react';
import weddingConfig from '../../config/weddingConfig';
import { useLanguage } from '../../context/LanguageContext';
import styles from './MobileQuickActions.module.css';

export default function MobileQuickActions() {
  const { t, bride, groom, isGroomSide, venueConfig } = useLanguage();
  const venue = venueConfig || weddingConfig.venue;
  const [isVisible, setIsVisible] = useState(false);
  const [isCallOpen, setIsCallOpen] = useState(false);

  const contactItems = isGroomSide
    ? [
        { person: groom, roleLabel: t.quickActions.groomLabel, fallbackPhone: '0987654321', fallbackAvatar: '/groom.jpg' },
        { person: bride, roleLabel: t.quickActions.brideLabel, fallbackPhone: '0912345678', fallbackAvatar: '/bride.jpg' },
      ]
    : [
        { person: bride, roleLabel: t.quickActions.brideLabel, fallbackPhone: '0912345678', fallbackAvatar: '/bride.jpg' },
        { person: groom, roleLabel: t.quickActions.groomLabel, fallbackPhone: '0987654321', fallbackAvatar: '/groom.jpg' },
      ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setIsCallOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={styles.mobileActionsContainer}>
      {/* 1. Floating Action Pill Frame */}
      <AnimatePresence>
        {isVisible && (
          <motion.aside
            key="mobile-quick-actions-bar"
            className={styles.actionPillFrame}
            initial={{ opacity: 0, y: 18, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.92 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            aria-label={t.quickActions.frameAria}
          >
            {/* Call Button */}
            <button
              type="button"
              id="mobile-call-action-btn"
              className={`${styles.actionButton} ${isCallOpen ? styles.actionButtonActive : ''}`}
              onClick={() => setIsCallOpen((prev) => !prev)}
              aria-expanded={isCallOpen}
              aria-label={t.quickActions.callBtn}
            >
              <div className={styles.iconCircle}>
                <Phone size={13} className={styles.btnIcon} />
              </div>
              <span className={styles.btnText}>{t.quickActions.callBtn}</span>
            </button>

            <div className={styles.divider} />

            {/* Directions Button */}
            <a
              id="mobile-directions-action-btn"
              href={venue.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.actionButton}
              aria-label={t.quickActions.directionsBtn}
            >
              <div className={styles.iconCircle}>
                <MapPin size={13} className={styles.btnIcon} />
              </div>
              <span className={styles.btnText}>{t.quickActions.directionsBtn}</span>
            </a>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 2. Popover Contacts — Bride First, Groom Second */}
      <AnimatePresence>
        {isVisible && isCallOpen && (
          <>
            <motion.div
              className={styles.backdrop}
              onClick={() => setIsCallOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              className={styles.callPopover}
              initial={{ opacity: 0, y: 12, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.94 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <div className={styles.popoverHeader}>
                <span className={styles.popoverTitle}>{t.quickActions.header}</span>
                <button
                  type="button"
                  className={styles.closeBtn}
                  onClick={() => setIsCallOpen(false)}
                  aria-label={t.quickActions.closeAria}
                >
                  <X size={15} />
                </button>
              </div>

              <div className={styles.contactList}>
                {contactItems.map(({ person, roleLabel, fallbackPhone, fallbackAvatar }) => (
                  <a
                    key={roleLabel}
                    href={`tel:${person.phone?.replace(/\s+/g, '') || fallbackPhone}`}
                    className={styles.contactItem}
                    onClick={() => setIsCallOpen(false)}
                  >
                    <div className={styles.contactAvatarCol}>
                      <img
                        src={person.avatar || fallbackAvatar}
                        alt={person.name}
                        className={styles.avatarImg}
                      />
                    </div>
                    <div className={styles.contactDetails}>
                      <span className={styles.contactRole}>
                        {roleLabel} · {person.shortName || person.name}
                      </span>
                      <span className={styles.contactNumber}>{person.phone}</span>
                    </div>
                    <div className={styles.callBadge}>
                      <Phone size={12} />
                      <span>{t.quickActions.callBadge}</span>
                    </div>
                  </a>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
