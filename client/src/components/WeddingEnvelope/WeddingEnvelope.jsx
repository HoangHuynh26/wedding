import React, { useId } from 'react';
import { CalendarDays } from 'lucide-react';
import weddingConfig from '../../config/weddingConfig';
import { useLanguage } from '../../context/LanguageContext';
import useInvitationParams from '../../hooks/useInvitationParams';
import { BotanicalSprig, WeddingMonogram } from './WeddingOrnaments';
import Sparkles from '../Sparkles/Sparkles';
import OceanWavesBackground from './OceanWavesBackground';
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
        {/* Nền sóng biển dập dềnh chạy vào bờ cát vàng nhiệt đới */}
        <OceanWavesBackground phase={phase} />
        <FloatingParticles />
      </div>

      {/* Hiệu ứng kim tuyến bay bổng lấp lánh ngoài phong bì & thiệp */}
      <Sparkles count={38} className={styles.envelopeSparkles} />

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

          {/* Nghệ thuật hoa cưới: Cẩm tú cầu trắng, Lan hồ điệp & Dây amaranthus rủ */}
          <div className={styles.floralArrangement} aria-hidden="true">
            <img
              src="/flowers/flower_cluster_left.png"
              alt="Cẩm tú cầu và lan hồ điệp"
              className={`${styles.floralImage} ${styles.floralBottomLeft}`}
              loading="eager"
              decoding="async"
            />
            <img
              src="/flowers/flower_cluster_right.png"
              alt="Cẩm tú cầu, rum trắng và lan hồ điệp"
              className={`${styles.floralImage} ${styles.floralRight}`}
              loading="eager"
              decoding="async"
            />
            <img
              src="/flowers/orchid_bud.png"
              alt="Nhánh lan hồ điệp"
              className={`${styles.floralImage} ${styles.floralTopLeft}`}
              loading="eager"
              decoding="async"
            />
            <img
              src="/flowers/falling_petal.png"
              alt="Cánh hoa rơi"
              className={`${styles.floralImage} ${styles.floralDriftingPetal}`}
              loading="eager"
              decoding="async"
            />
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
