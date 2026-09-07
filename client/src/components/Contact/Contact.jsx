import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageCircle, Copy, Check, Users, Building2, MapPin } from 'lucide-react';
import weddingConfig from '../../config/weddingConfig';
import { useLanguage } from '../../context/LanguageContext';
import styles from './Contact.module.css';

export default function Contact() {
  const { groom, bride, venue } = weddingConfig;
  const { language } = useLanguage();
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const handleCopyPhone = (phone, label) => {
    try {
      navigator.clipboard.writeText(phone.replace(/\s+/g, ''));
      showToast(`✓ Đã sao chép số điện thoại ${label}: ${phone}`);
    } catch {
      showToast(phone);
    }
  };

  const isEn = language === 'en';

  return (
    <section className={`section ${styles.contactSection}`} id="contact" aria-label="Contact Section">
      <div className={styles.ambientGlow} />

      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-subtitle">
            {isEn ? 'CONTACT & SUPPORT' : 'LIÊN HỆ & HỖ TRỢ'}
          </span>
          <h2 className="section-title">
            {isEn ? 'Get In Touch' : 'Thông Tin Liên Lạc'}
          </h2>
          <div className="silver-divider">
            <span>✦</span>
          </div>
          <p style={{ maxWidth: '580px', margin: '1rem auto 0', color: 'var(--text-dark-secondary)', fontSize: '0.92rem' }}>
            {isEn
              ? 'If you have any questions regarding venue directions, schedule, or wedding details, please feel free to reach out to us.'
              : 'Nếu bạn có bất kỳ câu hỏi nào về đường đi, lịch trình hoặc cần hỗ trợ trong ngày cưới, đừng ngần ngại liên hệ với chúng mình nhé.'}
          </p>
        </div>

        {/* Contacts Grid */}
        <div className={styles.contactsGrid}>
          {/* 1. Groom Contact Card */}
          <motion.div
            className={styles.contactCard}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.cardCorner} />
            <div className={styles.avatarRing}>
              <img src={groom.avatar} alt={groom.name} className={styles.avatarImg} />
            </div>
            <span className={styles.roleBadge}>{isEn ? 'GROOM' : 'CHÚ RỂ'}</span>
            <h3 className={styles.personName}>{groom.name}</h3>
            <div className={styles.phoneNumber}>
              <Phone size={14} color="var(--silver-primary)" />
              <span>{groom.phone || '0987 654 321'}</span>
            </div>
            <p className={styles.noteText}>
              {isEn ? 'Reach out for inquiries from the groom\'s friends & colleagues' : 'Hỗ trợ đón tiếp bạn bè, đồng nghiệp phía Chú Rể'}
            </p>

            <div className={styles.actionRow}>
              <a
                href={`tel:${(groom.phone || '0987654321').replace(/\s+/g, '')}`}
                className={styles.callBtn}
              >
                <Phone size={14} />
                <span>{isEn ? 'Call' : 'Gọi Điện'}</span>
              </a>

              <a
                href={`https://zalo.me/${(groom.phone || '0987654321').replace(/\s+/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.zaloBtn}
              >
                <MessageCircle size={14} />
                <span>Zalo</span>
              </a>

              <button
                type="button"
                className={styles.copyBtn}
                title="Sao chép số điện thoại"
                onClick={() => handleCopyPhone(groom.phone || '0987 654 321', 'Chú rể')}
              >
                <Copy size={14} />
              </button>
            </div>
          </motion.div>

          {/* 2. Bride Contact Card */}
          <motion.div
            className={styles.contactCard}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className={styles.cardCorner} />
            <div className={styles.avatarRing}>
              <img src={bride.avatar} alt={bride.name} className={styles.avatarImg} />
            </div>
            <span className={styles.roleBadge}>{isEn ? 'BRIDE' : 'CÔ DÂU'}</span>
            <h3 className={styles.personName}>{bride.name}</h3>
            <div className={styles.phoneNumber}>
              <Phone size={14} color="var(--silver-primary)" />
              <span>{bride.phone || '0912 345 678'}</span>
            </div>
            <p className={styles.noteText}>
              {isEn ? 'Reach out for inquiries from the bride\'s friends & colleagues' : 'Hỗ trợ đón tiếp bạn bè, đồng nghiệp phía Cô Dâu'}
            </p>

            <div className={styles.actionRow}>
              <a
                href={`tel:${(bride.phone || '0912345678').replace(/\s+/g, '')}`}
                className={styles.callBtn}
              >
                <Phone size={14} />
                <span>{isEn ? 'Call' : 'Gọi Điện'}</span>
              </a>

              <a
                href={`https://zalo.me/${(bride.phone || '0912345678').replace(/\s+/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.zaloBtn}
              >
                <MessageCircle size={14} />
                <span>Zalo</span>
              </a>

              <button
                type="button"
                className={styles.copyBtn}
                title="Sao chép số điện thoại"
                onClick={() => handleCopyPhone(bride.phone || '0912 345 678', 'Cô dâu')}
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
