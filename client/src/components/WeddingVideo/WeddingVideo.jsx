import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import weddingConfig from '../../config/weddingConfig';
import { useLanguage } from '../../context/LanguageContext';
import styles from './WeddingVideo.module.css';

export default function WeddingVideo() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { t } = useLanguage();

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <section className={`section ${styles.videoSection}`} id="video" aria-label="Our Memories Video">
      <div className="container">
        <div className="section-header">
          <span className="section-subtitle">{t.video.tag}</span>
          <h2 className="section-title">{t.video.title}</h2>
          <div className="gold-divider">
            <span>❦</span>
          </div>
        </div>

        <motion.div
          className={styles.videoCard}
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className={styles.videoWrapper}>
            <video
              ref={videoRef}
              className={styles.videoElement}
              poster={weddingConfig.videos.memoriesPoster}
              playsInline
              controls={isPlaying}
              onEnded={() => setIsPlaying(false)}
            >
              <source src={weddingConfig.videos.memoriesVideo} type="video/mp4" />
              Trình duyệt không hỗ trợ phát video.
            </video>

            {!isPlaying && (
              <div
                className={styles.playOverlay}
                onClick={togglePlay}
                role="button"
                tabIndex={0}
                aria-label="Play Video"
              >
                <div className={styles.playButton}>
                  <Play size={36} style={{ marginLeft: '4px' }} />
                </div>
              </div>
            )}
          </div>

          <div className={styles.videoCaption}>
            <h3 className={styles.captionTitle}>{t.video.captionTitle}</h3>
            <p className={styles.captionText}>
              {t.video.captionText}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
