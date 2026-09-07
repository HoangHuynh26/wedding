import React, { useState, useEffect } from 'react';
import { useAudio } from '../../context/AudioContext';
import styles from './MusicButton.module.css';

export default function MusicButton() {
  const { isPlaying, toggleAudio, currentTrack } = useAudio();
  const [showTooltip, setShowTooltip] = useState(false);

  const trackTitle = currentTrack?.title || 'Nhạc Cưới';
  const trackArtist = currentTrack?.artist || 'Wedding Melody';

  // Show a gentle hint after 4 seconds if not yet playing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isPlaying) setShowTooltip(true);
    }, 4000);

    const hideTimer = setTimeout(() => {
      setShowTooltip(false);
    }, 9000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, [isPlaying]);

  return (
    <div className={styles.musicButtonWrapper}>

      <button
        type="button"
        id="wedding-music-btn"
        className={`${styles.musicButton} ${isPlaying ? styles.isPlaying : ''}`}
        onClick={toggleAudio}
        aria-label={isPlaying ? `Tắt nhạc nền: ${trackTitle}` : `Phát nhạc nền: ${trackTitle} - ${trackArtist}`}
        title={isPlaying ? `Tắt nhạc: ${trackTitle}` : `Bật nhạc: ${trackTitle} - ${trackArtist}`}
      >
        {isPlaying && (
          <>
            <div className={styles.pulseRing} />
            <div className={styles.pulseRingSecondary} />
          </>
        )}
        <span className={styles.musicIcon}>{isPlaying ? '♫' : '🔇'}</span>
      </button>
    </div>
  );
}
