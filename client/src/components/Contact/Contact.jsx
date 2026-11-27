import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageCircle, Copy, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import styles from './Contact.module.css';

export default function Contact() {
  const { t, bride, groom, isGroomSide } = useLanguage();
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const handleCopyPhone = (phone, toastPrefix) => {
    try {
      navigator.clipboard.writeText(phone.replace(/\s+/g, ''));
      showToast(`${toastPrefix} ${phone}`);
    } catch {
      showToast(phone);
    }
  };

  const activeHost = isGroomSide
    ? {
        person: groom,
        fallbackPhone: '0921 779 799',
        roleBadge: t.contact.groomRole,
        note: t.contact.groomNote,
        copiedToast: t.contact.copiedGroomToast,
      }
    : {
        person: bride,
        fallbackPhone: '0912 345 678',
        roleBadge: t.contact.brideRole,
        note: t.contact.brideNote,
        copiedToast: t.contact.copiedBrideToast,
      };

  const displayPhone = activeHost.person.phone || activeHost.fallbackPhone;
  const cleanPhone = displayPhone.replace(/\s+/g, '');

  return (
    <section className={`section ${styles.contactSection}`} id="contact" aria-label="Contact Section">
      <div className={styles.ambientGlow} />

      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <h2 className="section-title">{t.contact.title}</h2>
          <div className="silver-divider">
            <span>✦</span>
          </div>
          <p style={{ maxWidth: '580px', margin: '1rem auto 0', color: 'var(--text-dark-secondary)', fontSize: '0.92rem' }}>
            {t.contact.subtitle}
          </p>
        </div>

        {/* Single Host Contact Card — Groom only on Groom's invitation, Bride only on Bride's invitation */}
        <div className={styles.contactsGridSingle}>
          <motion.div
            className={styles.contactCard}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.cardCorner} />
            <div className={styles.avatarRing}>
              <img src={activeHost.person.avatar} alt={activeHost.person.name} className={styles.avatarImg} />
            </div>
            <span className={styles.roleBadge}>{activeHost.roleBadge}</span>
            <h3 className={styles.personName}>{activeHost.person.name}</h3>
            <div className={styles.phoneNumber}>
              <Phone size={14} color="var(--silver-primary)" />
              <span>{displayPhone}</span>
            </div>
            <p className={styles.noteText}>{activeHost.note}</p>

            <div className={styles.actionRow}>
              <a
                href={`tel:${cleanPhone}`}
                className={styles.callBtn}
              >
                <Phone size={14} />
                <span>{t.contact.callBtn}</span>
              </a>

              <a
                href={`https://zalo.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.zaloBtn}
              >
                <MessageCircle size={14} />
                <span>{t.contact.zaloBtn}</span>
              </a>

              <button
                type="button"
                className={styles.copyBtn}
                title={t.contact.copyTitle}
                onClick={() => handleCopyPhone(displayPhone, activeHost.copiedToast)}
              >
                <Copy size={14} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className={styles.toast}>
          <Check size={16} />
          <span>{toastMessage}</span>
        </div>
      )}
    </section>
  );
}
