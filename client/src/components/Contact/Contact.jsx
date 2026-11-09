import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageCircle, Copy, Check } from 'lucide-react';
import weddingConfig from '../../config/weddingConfig';
import { useLanguage } from '../../context/LanguageContext';
import styles from './Contact.module.css';

export default function Contact() {
  const { groom, bride } = weddingConfig;
  const { t } = useLanguage();
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

        {/* Contacts Grid — Bride First (Lễ Vu Quy), Groom Second */}
        <div className={styles.contactsGrid}>
          {/* 1. Bride Contact Card */}
          <motion.div
            className={styles.contactCard}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.cardCorner} />
            <div className={styles.avatarRing}>
              <img src={bride.avatar} alt={bride.name} className={styles.avatarImg} />
            </div>
            <span className={styles.roleBadge}>{t.contact.brideRole}</span>
            <h3 className={styles.personName}>{bride.name}</h3>
            <div className={styles.phoneNumber}>
              <Phone size={14} color="var(--silver-primary)" />
              <span>{bride.phone || '0912 345 678'}</span>
            </div>
            <p className={styles.noteText}>{t.contact.brideNote}</p>

            <div className={styles.actionRow}>
              <a
                href={`tel:${(bride.phone || '0912345678').replace(/\s+/g, '')}`}
                className={styles.callBtn}
              >
                <Phone size={14} />
                <span>{t.contact.callBtn}</span>
              </a>

              <a
                href={`https://zalo.me/${(bride.phone || '0912345678').replace(/\s+/g, '')}`}
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
                onClick={() => handleCopyPhone(bride.phone || '0912 345 678', t.contact.copiedBrideToast)}
              >
                <Copy size={14} />
              </button>
            </div>
          </motion.div>

          {/* 2. Groom Contact Card */}
          <motion.div
            className={styles.contactCard}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className={styles.cardCorner} />
            <div className={styles.avatarRing}>
              <img src={groom.avatar} alt={groom.name} className={styles.avatarImg} />
            </div>
            <span className={styles.roleBadge}>{t.contact.groomRole}</span>
            <h3 className={styles.personName}>{groom.name}</h3>
            <div className={styles.phoneNumber}>
              <Phone size={14} color="var(--silver-primary)" />
              <span>{groom.phone || '0987 654 321'}</span>
            </div>
            <p className={styles.noteText}>{t.contact.groomNote}</p>

            <div className={styles.actionRow}>
              <a
                href={`tel:${(groom.phone || '0987654321').replace(/\s+/g, '')}`}
                className={styles.callBtn}
              >
                <Phone size={14} />
                <span>{t.contact.callBtn}</span>
              </a>

              <a
                href={`https://zalo.me/${(groom.phone || '0987654321').replace(/\s+/g, '')}`}
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
                onClick={() => handleCopyPhone(groom.phone || '0987 654 321', t.contact.copiedGroomToast)}
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
