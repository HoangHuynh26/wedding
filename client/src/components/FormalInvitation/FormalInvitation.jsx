import React from 'react';
import { MapPin, Sparkles } from 'lucide-react';
import weddingConfig from '../../config/weddingConfig';
import { useLanguage } from '../../context/LanguageContext';
import useInvitationParams from '../../hooks/useInvitationParams';
import { BotanicalSprig } from '../WeddingEnvelope/WeddingOrnaments';
import styles from './FormalInvitation.module.css';

// Curated gentle winter-couture snowflakes for the left & right wings on iPad / Desktop (never overlapping the center card)
const LEFT_SNOWFLAKES = [
  { id: 'l1', x: '10%', size: 12, kind: 'crystal', dur: '13.5s', delay: '-2.1s', sway: '14px', opacity: 0.88 },
  { id: 'l2', x: '24%', size: 6, kind: 'orb', dur: '10.2s', delay: '-6.8s', sway: '-12px', opacity: 0.78 },
  { id: 'l3', x: '38%', size: 14, kind: 'crystal', dur: '15.8s', delay: '-9.4s', sway: '16px', opacity: 0.84 },
  { id: 'l4', x: '52%', size: 8, kind: 'orb', dur: '11.6s', delay: '-1.3s', sway: '-14px', opacity: 0.72 },
  { id: 'l5', x: '68%', size: 11, kind: 'crystal', dur: '14.2s', delay: '-11.2s', sway: '11px', opacity: 0.85 },
  { id: 'l6', x: '82%', size: 5, kind: 'orb', dur: '9.8s', delay: '-4.5s', sway: '-10px', opacity: 0.68 },
  { id: 'l7', x: '16%', size: 7, kind: 'orb', dur: '12.4s', delay: '-8.2s', sway: '13px', opacity: 0.76 },
  { id: 'l8', x: '44%', size: 10, kind: 'crystal', dur: '16.5s', delay: '-5.7s', sway: '-15px', opacity: 0.8 },
  { id: 'l9', x: '74%', size: 7, kind: 'orb', dur: '10.9s', delay: '-12.6s', sway: '12px', opacity: 0.74 },
  { id: 'l10', x: '30%', size: 13, kind: 'crystal', dur: '14.9s', delay: '-3.6s', sway: '-13px', opacity: 0.86 },
  { id: 'l11', x: '60%', size: 6, kind: 'orb', dur: '11.1s', delay: '-7.9s', sway: '10px', opacity: 0.7 },
  { id: 'l12', x: '88%', size: 10, kind: 'crystal', dur: '13.8s', delay: '-10.1s', sway: '-9px', opacity: 0.82 },
  { id: 'l13', x: '8%', size: 6, kind: 'orb', dur: '12.9s', delay: '-14.0s', sway: '11px', opacity: 0.66 },
  { id: 'l14', x: '48%', size: 7, kind: 'orb', dur: '9.6s', delay: '-2.8s', sway: '12px', opacity: 0.78 },
  { id: 'l15', x: '22%', size: 11, kind: 'crystal', dur: '17.2s', delay: '-13.4s', sway: '-14px', opacity: 0.82 },
  { id: 'l16', x: '78%', size: 8, kind: 'orb', dur: '13.1s', delay: '-6.0s', sway: '11px', opacity: 0.75 },
  { id: 'l17', x: '34%', size: 5, kind: 'orb', dur: '10.5s', delay: '-9.0s', sway: '-10px', opacity: 0.65 },
  { id: 'l18', x: '64%', size: 13, kind: 'crystal', dur: '15.2s', delay: '-4.2s', sway: '14px', opacity: 0.86 },
];

const RIGHT_SNOWFLAKES = [
  { id: 'r1', x: '12%', size: 13, kind: 'crystal', dur: '14.6s', delay: '-3.4s', sway: '-14px', opacity: 0.86 },
  { id: 'r2', x: '26%', size: 6, kind: 'orb', dur: '10.4s', delay: '-7.5s', sway: '12px', opacity: 0.76 },
  { id: 'r3', x: '42%', size: 11, kind: 'crystal', dur: '16.1s', delay: '-1.9s', sway: '-15px', opacity: 0.82 },
  { id: 'r4', x: '56%', size: 8, kind: 'orb', dur: '11.9s', delay: '-10.4s', sway: '13px', opacity: 0.74 },
  { id: 'r5', x: '72%', size: 14, kind: 'crystal', dur: '15.4s', delay: '-6.2s', sway: '-12px', opacity: 0.88 },
  { id: 'r6', x: '86%', size: 6, kind: 'orb', dur: '9.9s', delay: '-12.1s', sway: '10px', opacity: 0.7 },
  { id: 'r7', x: '18%', size: 7, kind: 'orb', dur: '12.2s', delay: '-8.7s', sway: '-12px', opacity: 0.76 },
  { id: 'r8', x: '48%', size: 10, kind: 'crystal', dur: '13.9s', delay: '-5.1s', sway: '14px', opacity: 0.82 },
  { id: 'r9', x: '78%', size: 7, kind: 'orb', dur: '11.3s', delay: '-2.6s', sway: '-11px', opacity: 0.72 },
  { id: 'r10', x: '34%', size: 12, kind: 'crystal', dur: '16.8s', delay: '-11.5s', sway: '15px', opacity: 0.85 },
  { id: 'r11', x: '64%', size: 5, kind: 'orb', dur: '10.7s', delay: '-4.8s', sway: '-10px', opacity: 0.68 },
  { id: 'r12', x: '90%', size: 11, kind: 'crystal', dur: '14.1s', delay: '-9.6s', sway: '9px', opacity: 0.82 },
  { id: 'r13', x: '8%', size: 6, kind: 'orb', dur: '12.6s', delay: '-13.2s', sway: '-11px', opacity: 0.68 },
  { id: 'r14', x: '50%', size: 7, kind: 'orb', dur: '9.7s', delay: '-6.9s', sway: '-13px', opacity: 0.78 },
  { id: 'r15', x: '22%', size: 12, kind: 'crystal', dur: '17.0s', delay: '-14.3s', sway: '13px', opacity: 0.84 },
  { id: 'r16', x: '80%', size: 8, kind: 'orb', dur: '13.4s', delay: '-1.5s', sway: '-12px', opacity: 0.74 },
  { id: 'r17', x: '36%', size: 5, kind: 'orb', dur: '10.8s', delay: '-8.0s', sway: '11px', opacity: 0.66 },
  { id: 'r18', x: '66%', size: 13, kind: 'crystal', dur: '15.0s', delay: '-12.8s', sway: '-14px', opacity: 0.86 },
];

function SnowCrystal() {
  return (
    <svg viewBox="0 0 24 24" className={styles.snowCrystalSvg} fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <line x1="12" y1="2" x2="12" y2="22" />
        <line x1="3.34" y1="7" x2="20.66" y2="17" />
        <line x1="20.66" y1="7" x2="3.34" y2="17" />
        <polyline points="9.5,4.8 12,7 14.5,4.8" />
        <polyline points="9.5,19.2 12,17 14.5,19.2" />
        <polyline points="5.2,10.5 7.7,9.5 6.8,6.8" />
        <polyline points="18.8,13.5 16.3,14.5 17.2,17.2" />
        <polyline points="17.2,6.8 16.3,9.5 18.8,10.5" />
        <polyline points="6.8,17.2 7.7,14.5 5.2,13.5" />
      </g>
    </svg>
  );
}

function SnowWing({ sideClass, flakes }) {
  return (
    <div className={`${styles.snowWing} ${sideClass}`} aria-hidden="true">
      {flakes.map((f) => (
        <span
          key={f.id}
          className={styles.snowFlake}
          style={{
            '--snow-x': f.x,
            '--snow-size': `${f.size}px`,
            '--snow-dur': f.dur,
            '--snow-delay': f.delay,
            '--snow-sway': f.sway,
            '--snow-opacity': f.opacity,
          }}
        >
          {f.kind === 'crystal' ? <SnowCrystal /> : <span className={styles.snowOrb} />}
        </span>
      ))}
    </div>
  );
}

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
      {/* Gentle Winter Snowfall strictly in the Left & Right Wings on iPad & Desktop (never over the center card) */}
      <SnowWing sideClass={styles.snowWingLeft} flakes={LEFT_SNOWFLAKES} />
      <SnowWing sideClass={styles.snowWingRight} flakes={RIGHT_SNOWFLAKES} />

      <div className={`container ${styles.formalContainer}`}>
        {/* KOREAN MINIMALIST EDITORIAL WEDDING CARD — Rendered immediately for zero scroll-reveal lag */}
        <div className={styles.invitationCard}>
          {/* 1. TOP COUPLE HERO PHOTO (Landscape Grand Staircase with Floating Veil) */}
          <div className={styles.topPhotoFrame}>
            <img
              src={weddingConfig.formalPhoto || '/photos/tuan-0992.jpg'}
              alt={`${firstPersonName} & ${secondPersonName}`}
              className={styles.topHeroImg}
              style={{ objectPosition: weddingConfig.formalPhotoPosition || '48% 42%' }}
              loading="eager"
              decoding="async"
              fetchPriority="high"
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
        </div>
      </div>
    </section>
  );
}
