import React from 'react';
import weddingConfig from '../../config/weddingConfig';
import { useLanguage } from '../../context/LanguageContext';
import styles from './weddingInvitation.module.css';

export default function InvitationInside() {
  const { groom, bride, event, venue } = weddingConfig;
  const { t, language } = useLanguage();

  const togetherHeading = language === 'en' ? 'Together with our families' : 'Trân trọng kính báo tin vui cùng gia đình';
  const celebrateSubtext = language === 'en'
    ? 'invite you to celebrate our sacred wedding union'
    : 'kính mời quý khách đến chung vui ngày thành hôn của chúng mình';

  return (
    <div className={styles.invitationInside}>
      <div className={styles.insideFrame}>
        {/* Subtle Watermark Monogram */}
        <div className={styles.insideWatermark}>H ♡ H</div>

        <span className={styles.insideSubHeader}>{togetherHeading}</span>

        <div className={styles.insideCoupleNames}>
          <h2>{groom.name}</h2>
          <span className={styles.insideAmps}>&amp;</span>
          <h2>{bride.name}</h2>
        </div>

        <p className={styles.insideInviteText}>{celebrateSubtext}</p>

        {/* Date & Venue Preview */}
        <div className={styles.insideEventPill}>
          <span>{event.fullDateDisplay}</span>
        </div>

        <div className={styles.insideVenueLocation}>
          <strong>{venue.name}</strong>
          <span>{venue.address}</span>
        </div>

        {/* Pocket Edge from which the Hero physically rises */}
        <div className={styles.insidePocketLip}>
          <div className={styles.pocketGoldTrim} />
        </div>
      </div>
    </div>
  );
}
