import React, { useId } from 'react';
import weddingConfig from '../../config/weddingConfig';
import { useLanguage } from '../../context/LanguageContext';
import styles from './WeddingHero.module.css';

// Centers on the 709 × 1271 embossed paper artwork, in image coordinates.
const crystals = [
  { x: 149, y: 111, size: 21, angle: -9 },
  { x: 550, y: 124, size: 23, angle: 8 },
  { x: 354, y: 146, size: 24, angle: 45 },
  { x: 330, y: 166, size: 10, angle: 34 },
  { x: 378, y: 166, size: 10, angle: -34 },
  { x: 103, y: 638, size: 12, angle: 40 },
  { x: 606, y: 638, size: 12, angle: 42 },
  { x: 332, y: 1104, size: 10, angle: -34 },
  { x: 377, y: 1104, size: 10, angle: 34 },
  { x: 354, y: 1123, size: 24, angle: 45 },
  { x: 143, y: 1128, size: 22, angle: -6 },
  { x: 568, y: 1129, size: 21, angle: 7 },
];

function CrystalInlay() {
  const id = useId();
  return (
    <svg className={styles.inlay} viewBox="0 0 709 1271" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={`${id}-cut`}>
          <path d="M -17 -25 Q -8 -29 7 -26 Q 20 -27 24 -17 Q 28 -5 24 11 Q 22 23 13 25 Q -5 29 -18 23 Q -25 19 -26 7 Q -28 -11 -23 -20 Z" />
        </clipPath>
        <g id={`${id}-stone`}>
          <g clipPath={`url(#${id}-cut)`}>
            {/* A single prong-set crystal from the same photographic material as the pearl frame. */}
            <image href="/mauve-theme/mother-of-pearl-jeweled.webp" x="-196" y="-92" width="1024" height="1024" />
          </g>
        </g>
      </defs>
      {crystals.map(({ x, y, size, angle }, index) => (
        <g key={x + '-' + y} transform={`translate(${x} ${y}) scale(${size / 56})`}>
          <ellipse cx="1" cy="6" rx="26" ry="24" fill="#493740" opacity=".32" />
          <use href={`#${id}-stone`} transform={`rotate(${angle})`} />
          <path className={styles.facetFlash} style={{ '--catchlight-delay': `${1340 + index * 42}ms` }} d="M -15 -14 L -5 -17 L -10 -5 Z" fill="#fffcf4" />
        </g>
      ))}
    </svg>
  );
}

/**
 * Step 4 — Embossed Dusty-Mauve Hero Invitation Card (Image 8)
 * Full-bleed blind-embossed antique roses in all four corners framing a vertical
 * scalloped baroque medallion with airy plum-charcoal editorial & calligraphy typography.
 */
export default function WeddingHero({ phase, children }) {
  const { event } = weddingConfig;
  const { language, t, bride, groom } = useLanguage();
  // Reveal text content ONLY after the bow & silk veil curtains have completely finished opening
  const isRevealed = phase === 'open';

  const brideDisplay = language === 'zh' ? bride.shortName : (bride.shortName || bride.name);
  const groomDisplay = language === 'zh' ? groom.shortName : (groom.shortName || groom.name);

  return (
    <section
      className={styles.hero}
      id="hero"
      aria-labelledby="wedding-title"
      data-revealed={isRevealed}
      data-phase={phase}
    >
      {/* Subtle dusty-mauve ambient backdrop on wide desktop monitors */}
      <div className={styles.desktopBackdrop} aria-hidden="true" />

      {/* Full-Viewport Couture Folio — Resizes natively to every device (Phone, Tablet, iPad, Desktop) */}
      <div className={styles.cardFolio}>
        {/* Art-directed blind-embossed roses & baroque scalloped frame texture per device aspect ratio */}
        <picture className={styles.embossedPicture}>
          <source
            media="(min-aspect-ratio: 105/100)"
            srcSet="/mauve-theme/embossed-rose-card-wide.webp?v=6"
          />
          <source
            media="(min-aspect-ratio: 62/100)"
            srcSet="/mauve-theme/embossed-rose-card-tablet.webp?v=6"
          />
          <img
            src="/mauve-theme/embossed-rose-card.webp?v=7"
            alt=""
            className={styles.embossedBg}
            fetchPriority="high"
            decoding="async"
          />
        </picture>

        {/* Editorial Typography cleanly centered inside the scalloped medallion */}
        <div className={styles.medallionContent} inert={phase !== 'open'}>
          <p className={styles.togetherLine}>
            {t.hero.subtitle}
          </p>

          <h1 className={styles.coupleNames} id="wedding-title" tabIndex={-1}>
            <span className={styles.nameScript}>{brideDisplay}</span>
            <span className={styles.ampersand} aria-hidden="true">&amp;</span>
            <span className={styles.nameScript}>{groomDisplay}</span>
          </h1>

          <time className={styles.dateText} dateTime={event.isoDate}>
            {t.hero.date || '17.01.2027'}
          </time>

        </div>
        {children}
      </div>
    </section>
  );
}
