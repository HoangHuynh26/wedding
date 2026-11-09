import React, { useState, useEffect } from 'react';
import { CalendarDays, ChevronDown, Heart } from 'lucide-react';
import weddingConfig from '../../config/weddingConfig';
import { useLanguage } from '../../context/LanguageContext';
import { BotanicalSprig, WeddingMonogram } from '../WeddingEnvelope/WeddingOrnaments';
import Sparkles from '../Sparkles/Sparkles';
import styles from './WeddingHero.module.css';

export default function WeddingHero({ phase }) {
  const { groom, bride, event, hero, invitation } = weddingConfig;
  const { language, t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState(null);
  const [photoReady, setPhotoReady] = useState(false);
  const isVietnamese = language === 'vi';
  const isRevealed = phase === 'reveal' || phase === 'open';

  // Slides from weddingConfig (curated single full-frame photos of the couple together)
  const slides = (hero.slides && hero.slides.length > 0) ? hero.slides : [
    {
      src: hero.photo || '/photos/tuan-1514.jpg',
      desktopPosition: hero.desktopPosition || '35% 45%',
      mobilePosition: hero.mobilePosition || '35% 42%',
      alt: `Ảnh cưới của ${bride.name} và ${groom.name}`,
    },
  ];

  // Auto-play slideshow continuously every 4.5 seconds with seamless cross-dissolve
  useEffect(() => {
    if (!isRevealed || slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        setPrevSlide(prev);
        return (prev + 1) % slides.length;
      });
    }, 4500);

    return () => clearInterval(timer);
  }, [isRevealed, slides.length]);

  // Preload slides for smooth seamless playback
  useEffect(() => {
    if (phase === 'sealed') return;
    let loaded = 0;
    slides.forEach((s) => {
      const img = new Image();
      img.src = s.src;
      img.onload = () => {
        loaded += 1;
        if (loaded >= 1) setPhotoReady(true);
      };
      img.onerror = () => {
        loaded += 1;
        if (loaded >= 1) setPhotoReady(true);
      };
    });
  }, [phase, slides]);

  const showPhoto = isRevealed && photoReady;
  const showCopy = isRevealed;

  return (
    <section
      className={styles.hero}
      id="hero"
      aria-labelledby="wedding-title"
      data-photo-visible={showPhoto}
      data-copy-visible={showCopy}
    >
      <div className={styles.media}>
        <div className={styles.photoFrame}>
          {phase !== 'sealed' && slides.map((slide, idx) => {
            const isActive = idx === currentSlide;
            const isPrev = idx === prevSlide;
            const slideStyle = {
              '--photo-desktop-pos': slide.desktopPosition || '35% 45%',
              '--photo-mobile-pos': slide.mobilePosition || '35% 42%',
            };
            return (
              <img
                key={slide.src}
                className={`${styles.photo} ${isActive ? styles.photoActive : ''} ${isPrev ? styles.photoPrev : ''}`}
                src={slide.src}
                style={slideStyle}
                alt={slide.alt || `Ảnh cưới của ${bride.name} và ${groom.name}`}
                fetchPriority={idx === 0 ? 'high' : 'auto'}
                decoding="async"
              />
            );
          })}
        </div>
      </div>

      {/* Hiệu ứng kim tuyến bay bổng (Sparkles) */}
      <Sparkles count={42} className={styles.heroSparkles} />

      <BotanicalSprig className={styles.botanical} />

      <div className={styles.copy}>
        <WeddingMonogram className={styles.monogram} />
        <p className={styles.eyebrow}>
          {isVietnamese ? invitation.heroLabel : t.hero.subtitle}
        </p>
        <h1 className={styles.names} id="wedding-title" tabIndex={-1}>
          <span className={styles.bride}>{bride.name}</span>
          <span className={styles.heart} aria-hidden="true">
            <Heart size={15} strokeWidth={1.5} />
          </span>
          <span className={styles.groom}>{groom.name}</span>
        </h1>
        <div className={styles.actions}>
          <time className={styles.date} dateTime={event.isoDate}>
            <CalendarDays size={15} strokeWidth={1.5} aria-hidden="true" />
            {event.dateDisplay} · {event.timeDisplay}
          </time>
        </div>
      </div>

      <a className={styles.scrollCue} href="#invitation">
        <span className={styles.scrollIcon} aria-hidden="true">
          <ChevronDown size={19} strokeWidth={1.35} />
        </span>
        {isVietnamese ? invitation.scrollLabel : t.hero.scroll}
      </a>
    </section>
  );
}
