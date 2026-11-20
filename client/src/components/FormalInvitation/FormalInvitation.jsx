import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Sparkles } from 'lucide-react';
import weddingConfig from '../../config/weddingConfig';
import { useLanguage } from '../../context/LanguageContext';
import useInvitationParams from '../../hooks/useInvitationParams';
import { BotanicalSprig } from '../WeddingEnvelope/WeddingOrnaments';
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
  const { t, bride, groom, isGroomSide, venueConfig } = useLanguage();
  const venue = venueConfig || weddingConfig.venue;
  const { guestName, hasPersonalization } = useInvitationParams();

  const firstPersonName = isGroomSide ? groom.name : bride.name;
  const secondPersonName = isGroomSide ? bride.name : groom.name;

  const brideFamilyCol = (
    <div className={styles.familyColumn} key="bride-family">
      <span className={styles.pillarTitle}>{t.formal.brideSideTitle}</span>
      <div className={styles.parentsNames}>
        <div>{t.formal.brideFather}</div>
        <div>{t.formal.brideMother}</div>
      </div>
    </div>
  );

  const groomFamilyCol = (
    <div className={styles.familyColumn} key="groom-family">
      <span className={styles.pillarTitle}>{t.formal.groomSideTitle}</span>
      <div className={styles.parentsNames}>
        <div>{t.formal.groomFather}</div>
        <div>{t.formal.groomMother}</div>
      </div>
    </div>
  );

  return (
    <section className={styles.formalSection} id="invitation" aria-label={t.formal.title}>
      <div className={`container ${styles.formalContainer}`}>
        {/* KOREAN MINIMALIST EDITORIAL WEDDING CARD */}
        <motion.div
          className={styles.invitationCard}
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* 1. TOP COUPLE HERO PHOTO (Landscape Grand Staircase with Floating Veil) */}
          <div className={styles.topPhotoFrame}>
            <img
              src={weddingConfig.formalPhoto || '/photos/tuan-0992.jpg'}
              alt={`${firstPersonName} & ${secondPersonName}`}
              className={styles.topHeroImg}
              style={{ objectPosition: weddingConfig.formalPhotoPosition || '48% 42%' }}
            />
          </div>

          {/* 2. CARD CONTENT BODY */}
          <div className={styles.cardContentBody}>
            {/* PARENTS' TWO-COLUMN PILLARS — Groom's Family First on Groom's page, Bride's Family First on Bride's page */}
            <div className={styles.familyPillarsRow}>
              {isGroomSide ? [groomFamilyCol, brideFamilyCol] : [brideFamilyCol, groomFamilyCol]}
            </div>

            {/* INVITATION PROCLAMATION & LOVING QUOTE */}
            <div className={styles.invitationAnnouncement}>
              <h3 className={styles.announcementTitle}>
                <span className={styles.announcementLine}>{t.formal.announcementLine1}</span>
                <span className={styles.announcementLine}>{t.formal.announcementLine2}</span>
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

            {/* SUBTLE MAUVE BOTANICAL LINE-ART ACCENT (TOP RIGHT — NO WHITE BOX) */}
            <div className={styles.orchidCornerTop} aria-hidden="true">
              <BotanicalSprig className={styles.botanicalAccentSvg} />
            </div>

            {/* COUPLE NAMES — Groom ♡ Bride on Groom's page, Bride ♡ Groom on Bride's page */}
            <div className={styles.coupleNamesSection}>
              <h2 className={styles.brideName}>
                <span>{firstPersonName}</span>
              </h2>
              <div className={styles.ampersandBlock}>
                <span className={styles.heartGlyph}>♡</span>
              </div>
              <h2 className={styles.groomName}>
                <span>{secondPersonName}</span>
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
              {/* Prominent Google Maps Direction Button */}
              <a
                style={{ marginTop: '20px' }}
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

            {/* SUBTLE MAUVE BOTANICAL LINE-ART ACCENT (BOTTOM LEFT — NO WHITE BOX) */}
            <div className={styles.orchidCornerBottom} aria-hidden="true">
              <BotanicalSprig className={styles.botanicalAccentSvg} />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
