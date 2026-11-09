import React, { useId } from 'react';
import { CalendarDays } from 'lucide-react';
import weddingConfig from '../../config/weddingConfig';
import { useLanguage } from '../../context/LanguageContext';
import useInvitationParams from '../../hooks/useInvitationParams';
import { BotanicalSprig, WeddingMonogram } from './WeddingOrnaments';
import styles from './WeddingEnvelope.module.css';

const { event, invitation } = weddingConfig;

const dust = [
  [11, 38, 3, 2], [23, 20, 2, 6], [16, 74, 4, 9], [32, 88, 3, 4], [38, 12, 2, 8],
  [69, 19, 4, 3], [76, 82, 2, 7], [89, 30, 3, 5], [87, 68, 4, 1], [96, 49, 2, 8],
];

function FloatingParticles() {
  return (
    <div className={styles.dust} aria-hidden="true">
      {dust.map(([x, y, size, delay]) => (
        <i key={x} style={{ left: `${x}%`, top: `${y}%`, '--size': `${size}px`, '--delay': `${-delay}s` }} />
      ))}
    </div>
  );
}

function FlowerBranch({ className }) {
  const id = useId();

  return (
    <svg className={className} viewBox="0 0 360 340" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-leaf`} x1=".1" y1="0" x2=".9" y2="1" gradientUnits="objectBoundingBox">
          <stop stopColor="#abb39b" />
          <stop offset=".5" stopColor="#68775c" />
          <stop offset="1" stopColor="#47533e" />
        </linearGradient>
        <radialGradient id={`${id}-petal`} cx=".5" cy=".23" r=".9">
          <stop stopColor="#fffef9" />
          <stop offset=".48" stopColor="#fbf7ed" />
          <stop offset=".77" stopColor="#e6dcc9" />
          <stop offset="1" stopColor="#b19b78" />
        </radialGradient>
        <radialGradient id={`${id}-center`} cx=".39" cy=".34" r=".67">
          <stop stopColor="#e9dbad" />
          <stop offset=".55" stopColor="#b6a376" />
          <stop offset="1" stopColor="#8b7759" />
        </radialGradient>
        <g id={`${id}-blade`}>
          <path d="M0 0C6-22 22-39 50-37 45-14 25 3 0 0Z" fill={`url(#${id}-leaf)`} />
          <path d="M1 0c15-12 27-20 41-29" fill="none" stroke="#d2d2ad" strokeWidth=".75" opacity=".6" />
        </g>
        <g id={`${id}-single-petal`}>
          <path d="M0 7C-9 4-27-5-28-26-30-47-12-59 6-56 23-53 31-38 24-21 18-6 7 5 0 7Z" fill={`url(#${id}-petal)`} stroke="#fdf9ef" strokeWidth=".5" />
          <path d="M0 4c-2-19 4-32 12-45M-2 1c-6-16-8-24-6-35" fill="none" stroke="#b5a58e" strokeWidth=".7" opacity=".25" />
        </g>
        <g id={`${id}-flower`}>
          <use href={`#${id}-single-petal`} transform="rotate(8)" />
          <use href={`#${id}-single-petal`} transform="rotate(72)" />
          <use href={`#${id}-single-petal`} transform="rotate(139)" />
          <use href={`#${id}-single-petal`} transform="rotate(205)" />
          <use href={`#${id}-single-petal`} transform="rotate(274)" />
          <use href={`#${id}-single-petal`} transform="rotate(332) scale(.58)" />
          <use href={`#${id}-single-petal`} transform="rotate(94) scale(.63)" />
          <use href={`#${id}-single-petal`} transform="rotate(208) scale(.60)" />
          <circle r="8" fill={`url(#${id}-center)`} />
          <path d="M-5-1h1m4 4h1m2-7h1m-3 4h1m-3-5h1" stroke="#fff0c3" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      </defs>
      <g fill="none" stroke="#717a5f" strokeLinecap="round">
        <path d="M12 328C53 249 111 177 221 110m-176 170C78 206 84 124 79 60m35 120c45-16 94-20 156-9M13 318C22 250 12 184 38 126m87 41C168 116 173 68 167 25" strokeWidth="4" />
        <path d="M76 211c24-6 43-22 52-45m-99 123c39-22 83-37 120-37m-74-77c-27-13-36-36-37-49m81 51c35-2 68 14 99 29" strokeWidth="2.6" />
      </g>
      <use href={`#${id}-blade`} transform="translate(24 306) rotate(-26) scale(1.21)" />
      <use href={`#${id}-blade`} transform="translate(41 274) rotate(-172) scale(.9)" />
      <use href={`#${id}-blade`} transform="translate(64 236) rotate(1)" />
      <use href={`#${id}-blade`} transform="translate(76 199) rotate(-133) scale(.92)" />
      <use href={`#${id}-blade`} transform="translate(136 165) rotate(-33) scale(.93)" />
      <use href={`#${id}-blade`} transform="translate(164 140) rotate(58) scale(.87)" />
      <use href={`#${id}-blade`} transform="translate(190 170) rotate(48) scale(.68)" />
      <use href={`#${id}-blade`} transform="translate(149 108) rotate(-67) scale(.84)" />
      <g className={styles.flowers}>
        <use href={`#${id}-flower`} transform="translate(38 126) rotate(28) scale(.63 .53)" />
        <use href={`#${id}-flower`} transform="translate(80 63) rotate(38) scale(.96)" />
        <use href={`#${id}-flower`} transform="translate(164 35) rotate(20) scale(.57 .71)" />
        <use href={`#${id}-flower`} transform="translate(222 107) rotate(50) scale(1.17)" />
        <use href={`#${id}-flower`} transform="translate(267 172) rotate(11) scale(.69 .86)" />
        <use href={`#${id}-flower`} transform="translate(144 249) rotate(42) scale(.43 .62)" />
        <use href={`#${id}-flower`} transform="translate(218 205) rotate(20) scale(.37 .55)" />
      </g>
    </svg>
  );
}

function WaxSeal() {
  return (
    <div className={styles.sealAssembly} aria-hidden="true">
      <span className={`${styles.ribbon} ${styles.ribbonLeft}`} />
      <span className={`${styles.ribbon} ${styles.ribbonRight}`} />
      <span className={styles.waxGlowHalo} />
      <span className={styles.wax}>
        <span className={styles.waxInnerGlow} />
        <img src="/logo.png" alt="Monogram Logo" className={styles.waxLogoImg} />
      </span>
    </div>
  );
}

function InvitationCard({ ceremonyLabel, hidden }) {
  return (
    <div className={styles.card} aria-hidden={hidden}>
      <BotanicalSprig className={`${styles.cardSprig} ${styles.cardSprigLeft}`} />
      <BotanicalSprig className={`${styles.cardSprig} ${styles.cardSprigRight}`} />
      <div className={styles.cardCopy}>
        <WeddingMonogram className={styles.cardMonogram} />
        <p className={styles.cardLabel}>{ceremonyLabel}</p>
        <time className={styles.cardDate} dateTime={event.isoDate}>
          <CalendarDays aria-hidden="true" size={13} strokeWidth={1.5} />
          {event.dateDisplay} · {event.timeDisplay}
        </time>
      </div>
    </div>
  );
}

export default function WeddingEnvelope({ phase, onOpen }) {
  const headingId = useId();
  const { language, t } = useLanguage();
  const { guestName, inviterName } = useInvitationParams();
  const sealed = phase === 'sealed';
  const words = language === 'vi' ? invitation : {
    title: t.envelope.header,
    subtitle: t.envelope.invitation,
    openLabel: t.envelope.tapToOpen,
    ceremonyLabel: t.envelope.ceremonyHeading,
  };

  return (
    <section
      className={styles.experience}
      data-phase={phase}
      aria-labelledby={headingId}
    >
      <div className={styles.room} aria-hidden="true">
        <div className={styles.fabric} />
        <FlowerBranch className={`${styles.branch} ${styles.branchUpper}`} />
        <FlowerBranch className={`${styles.branch} ${styles.branchLower}`} />
        <span className={`${styles.petal} ${styles.petalLeft}`} />
        <span className={`${styles.petal} ${styles.petalRight}`} />
        <span className={`${styles.petal} ${styles.petalUpper}`} />
        <FloatingParticles />
      </div>

      <header className={styles.heading}>
        <h1 id={headingId}>{words.title}</h1>
        <p>{words.subtitle}</p>
        {(guestName || inviterName) && (
          <p className={styles.personalization}>
            {guestName && <span>{t.envelope.salutation} <strong>{guestName}</strong></span>}
            {inviterName && <span>{inviterName}</span>}
          </p>
        )}
        <span className={styles.headingRule} aria-hidden="true"><i /></span>
      </header>

      <div className={styles.stage}>
        <div className={styles.drift}>
          <div className={styles.envelope}>
            <div className={styles.back} aria-hidden="true" />
            <div className={styles.cardTrack}>
              <InvitationCard ceremonyLabel={words.ceremonyLabel} hidden={sealed} />
            </div>
            <div className={styles.pocket} aria-hidden="true">
              <span className={`${styles.side} ${styles.sideLeft}`} />
              <span className={`${styles.side} ${styles.sideRight}`} />
              <span className={styles.fold} />
              <BotanicalSprig className={`${styles.pocketSprig} ${styles.pocketSprigLeft}`} />
              <BotanicalSprig className={`${styles.pocketSprig} ${styles.pocketSprigRight}`} />
            </div>
            <div className={styles.flap} aria-hidden="true">
              <div className={styles.flapHinge}>
                <span className={`${styles.flapFace} ${styles.flapFront}`} />
                <span className={`${styles.flapFace} ${styles.flapBack}`} />
              </div>
            </div>
            <WaxSeal />
          </div>
        </div>

        <button
          className={styles.opener}
          type="button"
          onClick={onOpen}
          disabled={!sealed}
          aria-label={words.openLabel || 'Mở thiệp cưới'}
        />
      </div>

      <div className={styles.bloom} aria-hidden="true" />
    </section>
  );
}
