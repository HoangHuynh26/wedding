import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Sparkles } from 'lucide-react';
import weddingConfig from '../../config/weddingConfig';
import { useLanguage } from '../../context/LanguageContext';
import useInvitationParams from '../../hooks/useInvitationParams';
import styles from './FormalInvitation.module.css';

// Helper function to render text while giving numbers a bold, prominent, big font
function renderWithNumHighlight(text) {
  if (!text) return text;
  const parts = String(text).split(/(\d+(?::\d+)?(?:th|st|nd|rd)?)/g);
  return parts.map((part, i) => {
    if (/^\d+(?::\d+)?(?:th|st|nd|rd)?$/.test(part)) {
      return (
        <span key={i} className={styles.numSpan}>
          {part}
        </span>
      );
    }
    return part;
  });
}

export default function FormalInvitation() {
  const { groom, bride, venue } = weddingConfig;
  const { t } = useLanguage();
  const { guestName, hasPersonalization } = useInvitationParams();

  return (
    <section className={styles.formalSection} id="invitation" aria-label="Formal Wedding Invitation">
      <div className={`container ${styles.formalContainer}`}>
        {/* KOREAN MINIMALIST EDITORIAL WEDDING CARD */}
        <motion.div
          className={styles.invitationCard}
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* 1. TOP COUPLE HERO PHOTO (Image #3 — Staircase Loving Gaze) */}
          <div className={styles.topPhotoFrame}>
            <img
              src="/photos/tuan-0974.jpg"
              alt={`${bride.name} & ${groom.name}`}
              className={styles.topHeroImg}
            />
          </div>

          {/* 2. CARD CONTENT BODY */}
          <div className={styles.cardContentBody}>
            {/* PARENTS' TWO-COLUMN PILLARS — Bride's Family First (Lễ Vu Quy) */}
            <div className={styles.familyPillarsRow}>
              {/* Bride's Family */}
              <div className={styles.familyColumn}>
                <span className={styles.pillarTitle}>{t.formal.brideSideTitle}</span>
                <div className={styles.parentsNames}>
                  <div>{t.formal.brideFather}</div>
                  <div>{t.formal.brideMother}</div>
                </div>
              </div>

              {/* Groom's Family */}
              <div className={styles.familyColumn}>
                <span className={styles.pillarTitle}>{t.formal.groomSideTitle}</span>
                <div className={styles.parentsNames}>
                  <div>{t.formal.groomFather}</div>
                  <div>{t.formal.groomMother}</div>
                </div>
              </div>
            </div>

            {/* INVITATION PROCLAMATION & LOVING QUOTE */}
            <div className={styles.invitationAnnouncement}>
              <h3 className={styles.announcementTitle}>
                {t.formal.announcementLine1}
                <br />
                {t.formal.announcementLine2}
              </h3>
              <p className={styles.vietnameseQuote}>
                {t.formal.quoteLine1}
                <br />
                {t.formal.quoteLine2}
              </p>

              {/* Personalized Guest Salutation if ?to=... */}
              {hasPersonalization && (
                <div className={styles.recipientFormalPlaque}>
                  <span className={styles.recipientHonorTag}>
                    <Sparkles size={11} />
                    <span>{t.formal.honorTag}</span>
                    <Sparkles size={11} />
                  </span>
                  <h4 className={styles.recipientGuestName}>
                    {guestName || t.formal.defaultGuest}
                  </h4>
                </div>
              )}
            </div>

            {/* BOTANICAL ORCHID ACCENT (TOP RIGHT) */}
            <div className={styles.orchidCornerTop}>
              <img src="/orchid.jpg" alt="" className={styles.orchidImg} />
            </div>

            {/* COUPLE NAMES — Bride ♡ Groom (Lễ Bên Nhà Gái) */}
            <div className={styles.coupleNamesSection}>
              <h2 className={styles.brideName}>
                <span>{bride.name}</span>
              </h2>
              <div className={styles.ampersandBlock}>
                <span className={styles.heartGlyph}>♡</span>
              </div>
              <h2 className={styles.groomName}>
                <span>{groom.name}</span>
              </h2>
            </div>

            {/* 3-BOX CALENDAR DATE */}
            <div className={styles.calendarBoxSection}>
              <div className={styles.timeHeader}>
                <span>{renderWithNumHighlight(t.formal.timeDayHeader)}</span>
              </div>

              <div className={styles.threeBoxDateRow}>
                <div className={styles.dateSideBox}>
                  <span>{renderWithNumHighlight(t.formal.monthBox)}</span>
                </div>
                <div className={styles.dateCenterNumber}>
                  <span>{t.formal.dayNumber}</span>
                </div>
                <div className={styles.dateSideBox}>
                  <span>{renderWithNumHighlight(t.formal.yearBox)}</span>
                </div>
              </div>

              <div className={styles.lunarDateText}>
                <span>{renderWithNumHighlight(t.formal.lunarDate)}</span>
              </div>
            </div>

            {/* VENUE & DIRECTIONS SECTION */}
            <div className={styles.venueSection}>
              <span className={styles.venueIntroLabel}>{t.formal.venueIntro}</span>
              <h4 className={styles.venueNameText}>{t.formal.venueHostName}</h4>
              <p className={styles.venueAddressViet}>{t.formal.venueAddress || venue.address}</p>
              {/* Prominent Google Maps Direction Button */}
              <a
                href={venue.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.directionsBtn}
                id="formal-invitation-maps-btn"
              >
                <MapPin size={17} className={styles.pinIcon} />
                <span>{t.formal.directionsBtn}</span>
              </a>
            </div>

            {/* BOTANICAL ORCHID ACCENT (BOTTOM LEFT) */}
            <div className={styles.orchidCornerBottom}>
              <img src="/orchid.jpg" alt="" className={styles.orchidImg} />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
