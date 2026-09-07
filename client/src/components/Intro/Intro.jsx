import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Heart, Sparkles, User, Users } from 'lucide-react';
import weddingConfig from '../../config/weddingConfig';
import { useLanguage } from '../../context/LanguageContext';
import styles from './Intro.module.css';

export default function Intro() {
  const { t, language } = useLanguage();
  const { groom, bride, event, venue } = weddingConfig;

  return (
    <section className={`section ${styles.introSection}`} id="intro" aria-label="Welcome Card">
      <div className="container">
        <motion.div
          className={styles.welcomePlaque}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Ornate Corner Accents */}
          <div className={`${styles.cornerFiligree} ${styles.cornerTL}`}>
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 38V12C2 6.47715 6.47715 2 12 2H38" stroke="#d4a857" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="3" fill="#d4a857" />
              <path d="M6 22C6 13.1634 13.1634 6 22 6" stroke="#d4a857" strokeWidth="0.75" strokeDasharray="2 2" />
            </svg>
          </div>
          <div className={`${styles.cornerFiligree} ${styles.cornerTR}`}>
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M38 38V12C38 6.47715 33.5228 2 28 2H2" stroke="#d4a857" strokeWidth="1.5" />
              <circle cx="28" cy="12" r="3" fill="#d4a857" />
              <path d="M34 22C34 13.1634 26.8366 6 18 6" stroke="#d4a857" strokeWidth="0.75" strokeDasharray="2 2" />
            </svg>
          </div>
          <div className={`${styles.cornerFiligree} ${styles.cornerBL}`}>
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 2V28C2 33.5228 6.47715 38 12 38H38" stroke="#d4a857" strokeWidth="1.5" />
              <circle cx="12" cy="28" r="3" fill="#d4a857" />
              <path d="M6 18C6 26.8366 13.1634 34 22 34" stroke="#d4a857" strokeWidth="0.75" strokeDasharray="2 2" />
            </svg>
          </div>
          <div className={`${styles.cornerFiligree} ${styles.cornerBR}`}>
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M38 2V28C38 33.5228 33.5228 38 28 38H2" stroke="#d4a857" strokeWidth="1.5" />
              <circle cx="28" cy="28" r="3" fill="#d4a857" />
              <path d="M34 18C34 26.8366 26.8366 34 18 34" stroke="#d4a857" strokeWidth="0.75" strokeDasharray="2 2" />
            </svg>
          </div>

          {/* Inner Inset Border */}
          <div className={styles.innerBorderLine} />

          {/* Royal Crest / Monogram Header */}
          <div className={styles.crestHeader}>
            <div className={styles.crestSeal}>
              <span className={styles.crestMonogram}>H ♡ H</span>
              <span className={styles.crestDate}>{event.dateDisplay}</span>
            </div>
            <div className={styles.tagBadge}>
              <Sparkles size={13} className={styles.tagIcon} />
              <span>{t.intro.tag}</span>
              <Sparkles size={13} className={styles.tagIcon} />
            </div>
            <h2 className={styles.plaqueTitle}>{t.intro.title}</h2>
            <div className={styles.goldFlourishDivider}>
              <span className={styles.dividerLine} />
              <span className={styles.flourishSymbol}>❦</span>
              <span className={styles.dividerLine} />
            </div>
          </div>

          {/* Invitation Quote Letter */}
          <div className={styles.letterContent}>
            <blockquote className={styles.quoteBlock}>
              <span className={styles.quoteMarkLeft}>“</span>
              {t.intro.quote}
              <span className={styles.quoteMarkRight}>”</span>
            </blockquote>
            <p className={styles.invitationSubtext}>{t.intro.subtext}</p>
          </div>

          {/* Couple Showcase Row */}
          <div className={styles.coupleRow}>
            {/* Groom Profile */}
            <motion.div
              className={styles.personPlaque}
              initial={{ opacity: 0, x: -35 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className={styles.archFrame}>
                <div className={styles.archInner}>
                  <img
                    src={groom.avatar}
                    alt={groom.name}
                    className={styles.archImg}
                    loading="lazy"
                  />
                  <div className={styles.archGleam} />
                </div>
                <div className={styles.archRingGlow} />
              </div>

              <div className={styles.rolePill}>
                <User size={13} />
                <span>{t.intro.groomRole}</span>
              </div>

              <h3 className={styles.personName}>{groom.name}</h3>

              {/* Date of Birth Badge */}
              <div className={styles.infoBadge}>
                <Calendar size={13} className={styles.infoIcon} />
                <span>
                  {t.intro.dobLabel} <strong>{t.intro.groomDob}</strong>
                </span>
              </div>

              {/* Family Lineage Badge */}
              <div className={styles.lineageBadge}>
                <Users size={13} className={styles.infoIcon} />
                <span>
                  {t.intro.sonOf} <strong>{t.intro.groomParents}</strong>
                </span>
              </div>

              <p className={styles.personBio}>{t.intro.groomBio}</p>
            </motion.div>

            {/* Central Monogram Connector */}
            <div className={styles.centerConnector}>
              <div className={styles.connectorLine} />
              <div className={styles.heartEmblem}>
                <Heart size={20} className={styles.heartIcon} fill="#d4a857" />
                <span className={styles.connectorAmps}>&amp;</span>
              </div>
              <div className={styles.dateRibbon}>
                <span>17 · 01 · 2027</span>
              </div>
              <div className={styles.connectorLine} />
            </div>

            {/* Bride Profile */}
            <motion.div
              className={styles.personPlaque}
              initial={{ opacity: 0, x: 35 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className={styles.archFrame}>
                <div className={styles.archInner}>
                  <img
                    src={bride.avatar}
                    alt={bride.name}
                    className={styles.archImg}
                    loading="lazy"
                  />
                  <div className={styles.archGleam} />
                </div>
                <div className={styles.archRingGlow} />
              </div>

              <div className={`${styles.rolePill} ${styles.bridePill}`}>
                <User size={13} />
                <span>{t.intro.brideRole}</span>
              </div>

              <h3 className={styles.personName}>{bride.name}</h3>

              {/* Date of Birth Badge */}
              <div className={styles.infoBadge}>
                <Calendar size={13} className={styles.infoIcon} />
                <span>
                  {t.intro.dobLabel} <strong>{t.intro.brideDob}</strong>
                </span>
              </div>

              {/* Family Lineage Badge */}
              <div className={styles.lineageBadge}>
                <Users size={13} className={styles.infoIcon} />
                <span>
                  {t.intro.daughterOf} <strong>{t.intro.brideParents}</strong>
                </span>
              </div>

              <p className={styles.personBio}>{t.intro.brideBio}</p>
            </motion.div>
          </div>

          {/* Bottom Card Footer Seal */}
          <div className={styles.cardFooter}>
            <div className={styles.venueSeal}>
              <span>{venue.name}</span>
              <span className={styles.dotSeparator}>•</span>
              <span>{venue.addressShort}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
