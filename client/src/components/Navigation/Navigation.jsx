import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MailOpen } from 'lucide-react';
import weddingConfig from '../../config/weddingConfig';
import { useLanguage } from '../../context/LanguageContext';
import styles from './Navigation.module.css';

export default function Navigation({ onOpenInvitation }) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  const navLinks = [
    { label: t.nav.story, sublabel: t.nav.storySub, href: '#story' },
    { label: t.nav.date, sublabel: t.nav.dateSub, href: '#countdown' },
    // { label: t.nav.video, sublabel: t.nav.videoSub, href: '#video' }, — Ẩn tạm thời
    { label: t.nav.gallery, sublabel: t.nav.gallerySub, href: '#gallery' },
    { label: t.nav.venue, sublabel: t.nav.venueSub, href: '#venue' },
    { label: t.nav.qr, sublabel: t.nav.qrSub, href: '#qrcode' },
    { label: t.nav.rsvp, sublabel: t.nav.rsvpSub, href: '#rsvp' },
  ];

  const handleNavClick = (href) => {
    setIsOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleReopenCard = () => {
    setIsOpen(false);
    if (onOpenInvitation) {
      onOpenInvitation();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* Floating Menu Button */}
      <div className={styles.navFloatingWrapper}>
        <button
          type="button"
          id="floating-menu-trigger"
          className={styles.menuTrigger}
          onClick={() => setIsOpen(true)}
          aria-label="Open Navigation Menu"
        >
          <span className={styles.heartIcon}>♡</span>
          <span>{t.nav.menu || 'MENU'}</span>
        </button>
      </div>

      {/* Fullscreen Navigation Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.overlayBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <button
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
              aria-label="Close Menu"
            >
              <X size={24} />
            </button>

            {/* Reopen Invitation Envelope Button */}
            {onOpenInvitation && (
              <motion.button
                type="button"
                onClick={handleReopenCard}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.4rem',
                  borderRadius: '9999px',
                  border: '1px solid var(--gold-primary)',
                  backgroundColor: 'rgba(197, 168, 128, 0.15)',
                  color: 'var(--gold-light)',
                  fontSize: '0.75rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  marginBottom: '2rem',
                  cursor: 'pointer',
                }}
              >
                <MailOpen size={16} />
                <span>{t.nav.reopen}</span>
              </motion.button>
            )}

            <ul className={styles.navItemsList}>
              {navLinks.map((item, idx) => (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.06 }}
                >
                  <a
                    className={styles.navLink}
                    onClick={() => handleNavClick(item.href)}
                  >
                    {item.label}
                    <span className={styles.navSublabel}>{item.sublabel}</span>
                  </a>
                </motion.li>
              ))}
            </ul>

            <div className={styles.coupleMonogram}>
              {weddingConfig.groom.shortName} &amp; {weddingConfig.bride.shortName}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
