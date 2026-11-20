import React, { useId } from 'react';
import { formatChineseInviter, formatEnglishInviter } from '../../config/chineseInvitation';
import weddingConfig from '../../config/weddingConfig';
import { useLanguage } from '../../context/LanguageContext';
import useInvitationParams from '../../hooks/useInvitationParams';
import OrganzaBow from './OrganzaBow';
import styles from './WeddingEnvelope.module.css';

// Ethereal rising blink-blink starlight & pearl bokeh motes floating upward from bottom to top
const RISING_SPARKLES = [
  { id: 's1', kind: 'star', left: '12%', size: 15, dur: '6.8s', delay: '-1.2s', blink: '1.6s', drift: '10px' },
  { id: 's2', kind: 'orb', left: '22%', size: 6, dur: '7.4s', delay: '-4.1s', blink: '1.9s', drift: '-12px' },
  { id: 's3', kind: 'star', left: '30%', size: 20, dur: '6.2s', delay: '-2.7s', blink: '1.4s', drift: '14px' },
  { id: 's4', kind: 'orb', left: '38%', size: 7, dur: '8.1s', delay: '-5.8s', blink: '2.1s', drift: '-8px' },
  { id: 's5', kind: 'star', left: '45%', size: 18, dur: '5.8s', delay: '-0.6s', blink: '1.3s', drift: '12px' },
  { id: 's6', kind: 'orb', left: '49%', size: 8, dur: '6.6s', delay: '-3.4s', blink: '1.7s', drift: '-10px' },
  { id: 's7', kind: 'star', left: '53%', size: 22, dur: '6.4s', delay: '-4.9s', blink: '1.5s', drift: '-13px' },
  { id: 's8', kind: 'orb', left: '59%', size: 6, dur: '7.2s', delay: '-1.9s', blink: '1.8s', drift: '11px' },
  { id: 's9', kind: 'star', left: '66%', size: 17, dur: '5.9s', delay: '-3.8s', blink: '1.4s', drift: '-14px' },
  { id: 's10', kind: 'orb', left: '74%', size: 7, dur: '7.8s', delay: '-0.9s', blink: '2.0s', drift: '9px' },
  { id: 's11', kind: 'star', left: '82%', size: 19, dur: '6.5s', delay: '-2.3s', blink: '1.5s', drift: '-11px' },
  { id: 's12', kind: 'orb', left: '90%', size: 5, dur: '7.1s', delay: '-5.1s', blink: '1.7s', drift: '8px' },
  { id: 's13', kind: 'star', left: '18%', size: 13, dur: '7.6s', delay: '-6.2s', blink: '1.8s', drift: '-9px' },
  { id: 's14', kind: 'orb', left: '34%', size: 5, dur: '6.3s', delay: '-1.5s', blink: '1.6s', drift: '10px' },
  { id: 's15', kind: 'star', left: '42%', size: 16, dur: '7.0s', delay: '-4.4s', blink: '1.45s', drift: '-12px' },
  { id: 's16', kind: 'star', left: '57%', size: 15, dur: '5.6s', delay: '-2.9s', blink: '1.35s', drift: '13px' },
  { id: 's17', kind: 'orb', left: '63%', size: 7, dur: '8.3s', delay: '-6.7s', blink: '2.2s', drift: '-9px' },
  { id: 's18', kind: 'star', left: '78%', size: 14, dur: '6.9s', delay: '-5.4s', blink: '1.65s', drift: '12px' },
  { id: 's19', kind: 'orb', left: '47%', size: 5, dur: '5.5s', delay: '-2.1s', blink: '1.3s', drift: '7px' },
  { id: 's20', kind: 'star', left: '51%', size: 14, dur: '7.3s', delay: '-6.0s', blink: '1.55s', drift: '-8px' },
  { id: 's21', kind: 'orb', left: '26%', size: 6, dur: '8.0s', delay: '-3.1s', blink: '1.9s', drift: '11px' },
  { id: 's22', kind: 'star', left: '71%', size: 16, dur: '6.1s', delay: '-0.4s', blink: '1.4s', drift: '-10px' },
];

export default function WeddingEnvelope({ phase, onOpen, onOpened }) {
  const headingId = useId();
  const { language, t } = useLanguage();
  const { guestName, inviterName } = useInvitationParams();
  const inviterLabel =
    language === 'zh'
      ? formatChineseInviter(inviterName)
      : language === 'en'
        ? formatEnglishInviter(inviterName)
        : inviterName;
  const sealed = phase === 'sealed';
  const tapLabel = t.envelope?.tapToOpen || weddingConfig.invitation.openLabel;

  return (
    <section
      className={styles.experience}
      data-phase={phase}
      aria-labelledby={headingId}
    >
      <div className={styles.folioStage}>
        <div className={styles.silkVeilSystem} aria-hidden="true">
          <div className={`${styles.veilPanel} ${styles.veilPanelLeft}`} />
          <div
            className={`${styles.veilPanel} ${styles.veilPanelRight}`}
            onTransitionEnd={(event) => {
              if (!sealed && event.target === event.currentTarget && event.propertyName === 'transform') onOpened();
            }}
          />
          <OrganzaBow opening={!sealed} />
        </div>

        {/* LAYER 3: Sculpted 3D Veined Ginkgo-Petal Envelope & Organic Oval Mauve-Taupe HH Wax Seal */}
        <div className={styles.envelopeShell} aria-hidden="true">
          {/* Lower envelope pocket (slides smoothly downward on open) */}
          <div className={styles.paperPocket}>
            <picture className={styles.envelopePicture}>
              <source
                media="(min-aspect-ratio: 105/100)"
                srcSet="/mauve-theme/petal-envelope-wide.webp?v=4"
              />
              <img
                src="/mauve-theme/petal-envelope.webp?v=4"
                alt=""
                className={styles.pocketImg}
                fetchPriority="high"
                decoding="async"
                draggable={false}
              />
            </picture>
            <div className={styles.petalSatinSheen} />
          </div>

          {/* Top hinged V-flap — lifts upward carrying the organic oval HH wax seal */}
          <div className={styles.topFlapPivot}>
            <div className={styles.flapTop}>
              <picture className={styles.envelopePicture}>
                <source
                  media="(min-aspect-ratio: 105/100)"
                  srcSet="/mauve-theme/petal-flap-top-wide.webp?v=4"
                />
                <img
                  src="/mauve-theme/petal-flap-top.webp?v=4"
                  alt=""
                  className={styles.topFlapImg}
                  fetchPriority="high"
                  decoding="async"
                  draggable={false}
                />
              </picture>
              <div className={styles.flapTopShade} />
            </div>

            {/* Organic Vertical-Oval Satin Mauve-Taupe Wax Seal HH at the V-flap tip */}
            <div className={styles.waxSealAnchor}>
              <div className={styles.waxSealWrap}>
                <img
                  src="/mauve-theme/wax-seal-hh.webp?v=4"
                  alt=""
                  className={styles.waxSealImg}
                  draggable={false}
                />
              </div>
            </div>
          </div>

          {/* Ethereal twinkling "blink blink" light particles rising smoothly from bottom to top */}
          <div className={styles.envelopeSparkles} aria-hidden="true">
            {RISING_SPARKLES.map((p) => (
              <span
                key={p.id}
                className={styles.risingParticle}
                style={{
                  '--p-left': p.left,
                  '--p-size': `${p.size}px`,
                  '--p-dur': p.dur,
                  '--p-delay': p.delay,
                  '--p-blink': p.blink,
                  '--p-drift': p.drift,
                }}
              >
                <span className={p.kind === 'star' ? styles.risingStarCore : styles.risingOrbCore} />
              </span>
            ))}
          </div>
        </div>

        {/* Screen-reader title + optional subtle personalization badge when ?to=... is provided */}
        <h1 id={headingId} className={styles.srOnly}>
          {t.envelope?.header || weddingConfig.invitation.title}
        </h1>

        {(guestName || inviterLabel) && (
          <div className={styles.guestBadge}>
            {guestName && (
              <span className={styles.guestLine}>
                {t.envelope.salutation} <strong>{guestName}</strong>
              </span>
            )}
            {inviterLabel && <span className={styles.inviterLine}>{inviterLabel}</span>}
          </div>
        )}

        {/* Full accessible tap trigger over the sealed envelope & wax seal */}
        <button
          type="button"
          className={styles.openerBtn}
          onClick={onOpen}
          disabled={!sealed}
          aria-label={tapLabel}
        />
      </div>
    </section>
  );
}
