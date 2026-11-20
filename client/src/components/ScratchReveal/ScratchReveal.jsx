import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Pointer } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import styles from './ScratchReveal.module.css';

// All 29 couple portraits individually calibrated for the 3:4 oval cameo locket
// so BOTH the groom's and bride's faces are always centered inside the oval frame
const CAMEO_COUPLE_SLIDES = [
  { src: '/photos/tuan-1515.jpg', pos: '48% 8%', zoom: 1.0 },
  { src: '/photos/tuan-0389.jpg', pos: '50% 18%', zoom: 1.04 },
  { src: '/photos/tuan-9751.jpg', pos: '50% 14%', zoom: 1.0 },
  { src: '/photos/tuan-1196.jpg', pos: '48% 54%', zoom: 1.22 },
  { src: '/photos/tuan-0269.jpg', pos: '50% 34%', zoom: 1.18 },
  { src: '/photos/tuan-2031.jpg', pos: '50% 36%', zoom: 1.2 },
  { src: '/photos/tuan-2135.jpg', pos: '50% 16%', zoom: 1.02 },
  { src: '/photos/tuan-1157.jpg', pos: '50% 34%', zoom: 1.18 },
  { src: '/photos/tuan-0992.jpg', pos: '49% 40%', zoom: 1.16 },
  { src: '/photos/tuan-0923.jpg', pos: '50% 36%', zoom: 1.18 },
  { src: '/photos/tuan-0974.jpg', pos: '50% 36%', zoom: 1.18 },
  { src: '/photos/tuan-0876.jpg', pos: '50% 18%', zoom: 1.14 },
  { src: '/photos/tuan-1202.jpg', pos: '46% 52%', zoom: 1.22 },
  { src: '/photos/tuan-1235.jpg', pos: '50% 38%', zoom: 1.22 },
  { src: '/photos/tuan-1341.jpg', pos: '50% 38%', zoom: 1.16 },
  { src: '/photos/tuan-1369.jpg', pos: '51% 38%', zoom: 1.22 },
  { src: '/photos/tuan-1423.jpg', pos: '50% 14%', zoom: 1.02 },
  { src: '/photos/tuan-0998.jpg', pos: '50% 34%', zoom: 1.22 },
  { src: '/photos/tuan-0150.jpg', pos: '51% 46%', zoom: 1.24 },
  { src: '/photos/tuan-0229.jpg', pos: '48% 52%', zoom: 1.2 },
  { src: '/photos/tuan-0058.jpg', pos: '48% 36%', zoom: 1.14 },
  { src: '/photos/tuan-0375.jpg', pos: '48% 46%', zoom: 1.24 },
  { src: '/photos/tuan-0558.jpg', pos: '50% 38%', zoom: 1.18 },
  { src: '/photos/tuan-0620.jpg', pos: '46% 50%', zoom: 1.2 },
  { src: '/photos/tuan-0654.jpg', pos: '50% 38%', zoom: 1.2 },
  { src: '/photos/tuan-2015.jpg', pos: '50% 36%', zoom: 1.2 },
  { src: '/photos/tuan-2109.jpg', pos: '49% 34%', zoom: 1.18 },
  { src: '/photos/tuan-2171.jpg', pos: '51% 42%', zoom: 1.22 },
  { src: '/photos/tuan-9792.jpg', pos: '50% 28%', zoom: 1.14 },
];

function shuffleOrder(total, avoidFirst) {
  const arr = Array.from({ length: total }, (_, i) => i).filter((i) => i !== avoidFirst);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return avoidFirst !== undefined ? [avoidFirst, ...arr] : arr;
}

/**
 * Step 5B — Photorealistic Jeweled Mother-of-Pearl Interactive Scratch-to-Reveal (Images 9, 10, 11)
 * Real 3D faceted crystal rhinestones & luminous pearls inlaid in iridescent mother-of-pearl,
 * framing a royal diamond-and-pearl oval cameo locket that plays a 4-second randomized couple video-slideshow once revealed.
 */
export default function ScratchReveal() {
  const { t, bride, groom } = useLanguage();
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const strokeCountRef = useRef(0);
  const [hasScratched, setHasScratched] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  // Double-buffered cross-fade slides for smooth 4-second video-like playback after reveal
  const queueRef = useRef([]);
  const [activeSlide, setActiveSlide] = useState(() => ({ ...CAMEO_COUPLE_SLIDES[0], key: 0 }));
  const [prevSlide, setPrevSlide] = useState(null);

  useEffect(() => {
    if (!isRevealed) return undefined;

    queueRef.current = shuffleOrder(CAMEO_COUPLE_SLIDES.length, 0).slice(1);
    let stepCounter = 1;

    // Preload first upcoming slide immediately
    if (queueRef.current.length > 0) {
      const preloadImg = new Image();
      preloadImg.src = CAMEO_COUPLE_SLIDES[queueRef.current[0]].src;
    }

    const timer = window.setInterval(() => {
      if (queueRef.current.length === 0) {
        queueRef.current = shuffleOrder(CAMEO_COUPLE_SLIDES.length);
      }
      const nextIdx = queueRef.current.shift();
      const nextItem = CAMEO_COUPLE_SLIDES[nextIdx];
      stepCounter += 1;

      setActiveSlide((current) => {
        setPrevSlide(current);
        return { ...nextItem, key: stepCounter };
      });

      // Preload the following random photo ahead of time
      if (queueRef.current.length > 0) {
        const upcoming = CAMEO_COUPLE_SLIDES[queueRef.current[0]];
        const img = new Image();
        img.src = upcoming.src;
      }
    }, 4000);

    return () => window.clearInterval(timer);
  }, [isRevealed]);

  const paintFoil = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(180, Math.round(rect.width));
    const h = Math.max(230, Math.round(rect.height));

    canvas.width = w * dpr;
    canvas.height = h * dpr;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-over';

    // Metallic dusty-mauve pearlescent scratch-off foil base
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#DACDD7');
    grad.addColorStop(0.28, '#E9E0E7');
    grad.addColorStop(0.54, '#CBBCC8');
    grad.addColorStop(0.82, '#DDD1DA');
    grad.addColorStop(1, '#BEB0BC');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Soft pearl sheen highlight across center-top
    const sheen = ctx.createRadialGradient(w * 0.36, h * 0.28, 6, w * 0.5, h * 0.5, Math.max(w, h) * 0.72);
    sheen.addColorStop(0, 'rgba(255, 250, 254, 0.54)');
    sheen.addColorStop(0.5, 'rgba(235, 224, 232, 0.12)');
    sheen.addColorStop(1, 'rgba(126, 110, 126, 0.22)');
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, w, h);

    // Subtle fine metallic foil micro-grain
    for (let i = 0; i < 420; i++) {
      const gx = (i * 73) % w;
      const gy = (i * 137) % h;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.16)' : 'rgba(90,76,92,0.08)';
      ctx.fillRect(gx, gy, 1.5, 1.5);
    }
  }, []);

  useEffect(() => {
    if (!isRevealed) {
      paintFoil();
    }
  }, [paintFoil, isRevealed]);

  const checkRevealProgress = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const { width, height } = canvas;
    if (!width || !height) return;

    const imageData = ctx.getImageData(0, 0, width, height).data;
    const rx = width / 2;
    const ry = height / 2;
    const step = 6;
    let cleared = 0;
    let totalInsideOval = 0;

    // Sample strictly inside the visible oval so the 4 clipped rectangle corners never skew progress
    for (let y = 0; y < height; y += step) {
      const ny = (y - ry) / ry;
      const ny2 = ny * ny;
      for (let x = 0; x < width; x += step) {
        const nx = (x - rx) / rx;
        if (nx * nx + ny2 <= 0.94) {
          totalInsideOval += 1;
          const alphaIdx = (y * width + x) * 4 + 3;
          if (imageData[alphaIdx] < 90) {
            cleared += 1;
          }
        }
      }
    }

    // Require scratching almost the entire oval (~82%) before smoothly clearing the final edge slivers
    if (totalInsideOval > 0 && cleared / totalInsideOval >= 0.82) {
      setIsRevealed(true);
    }
  }, []);

  const getLocalPoint = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const scratchAt = (pt) => {
    const canvas = canvasRef.current;
    if (!canvas || !pt) return;
    const ctx = canvas.getContext('2d');
    const radius = Math.max(17, canvas.getBoundingClientRect().width * 0.11);

    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = radius * 2;
    ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';

    if (lastPointRef.current) {
      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    lastPointRef.current = pt;
    strokeCountRef.current += 1;
    if (strokeCountRef.current % 10 === 0) {
      checkRevealProgress();
    }
  };

  const handlePointerDown = (e) => {
    if (isRevealed) return;
    if (!hasScratched) setHasScratched(true);
    isDrawingRef.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const pt = getLocalPoint(e);
    lastPointRef.current = null;
    scratchAt(pt);
  };

  const handlePointerMove = (e) => {
    if (!isDrawingRef.current || isRevealed) return;
    const pt = getLocalPoint(e);
    scratchAt(pt);
  };

  const handlePointerUp = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    lastPointRef.current = null;
    checkRevealProgress();
  };

  return (
    <section
      className={styles.scratchSection}
      id="scratch-photo"
      aria-label={t.scratch?.revealedCaption || 'Scratch to reveal couple photo'}
    >
      {/* Full-bleed seamless iridescent Mother-of-Pearl backdrop */}
      <img
        src="/mauve-theme/mother-of-pearl.webp"
        alt=""
        className={styles.nacreBg}
        loading="lazy"
        decoding="async"
      />
      <div className={styles.nacreOverlay} aria-hidden="true" />

      {/* Photorealistic 3D Hand-Set Crystal Rhinestone & Pearl Frame directly on the main Mother-of-Pearl background */}
      <div className={styles.jeweledStage}>
        <img
          src="/mauve-theme/jeweled-frame-cutout.webp?v=3"
          alt=""
          className={styles.jeweledFrameImg}
          loading="lazy"
          decoding="async"
        />

        {/* Delicate subtle starlight diamond glints over select crystal facets */}
        <span className={`${styles.crystalGlint} ${styles.glint1}`} aria-hidden="true" />
        <span className={`${styles.crystalGlint} ${styles.glint2}`} aria-hidden="true" />
        <span className={`${styles.crystalGlint} ${styles.glint3}`} aria-hidden="true" />
        <span className={`${styles.crystalGlint} ${styles.glint4}`} aria-hidden="true" />

        {/* Sculpted 3D Royal Diamond & Seed-Pearl Tiara Oval Cameo Medallion */}
        <div className={`${styles.ovalOuterRing} ${isRevealed ? styles.ovalRevealed : ''}`}>
          <img
            src="/mauve-theme/oval-cameo-frame.webp?v=1"
            alt=""
            className={styles.ovalCameoFrameImg}
            loading="lazy"
            decoding="async"
          />

          {/* Subtle diamond glints on the royal oval tiara & side clasps */}
          <span className={`${styles.crystalGlint} ${styles.ovalGlintTop}`} aria-hidden="true" />
          <span className={`${styles.crystalGlint} ${styles.ovalGlintBot}`} aria-hidden="true" />
          <span className={`${styles.crystalGlint} ${styles.ovalGlintLeft}`} aria-hidden="true" />
          <span className={`${styles.crystalGlint} ${styles.ovalGlintRight}`} aria-hidden="true" />

          <div className={styles.ovalInnerFrame}>
            {/* Outgoing slide for seamless 1.15s cross-fade */}
            {isRevealed && prevSlide && (
              <img
                key={`prev-${prevSlide.key}`}
                src={prevSlide.src}
                alt=""
                aria-hidden="true"
                className={`${styles.couplePortrait} ${styles.couplePortraitPrev}`}
                style={{
                  objectPosition: prevSlide.pos,
                  '--cameo-zoom': prevSlide.zoom,
                }}
                draggable={false}
              />
            )}

            {/* Active couple portrait with calibrated face-centering & video-like breathing motion */}
            <img
              key={`active-${activeSlide.key}`}
              src={activeSlide.src}
              alt={`${bride.name} & ${groom.name}`}
              className={`${styles.couplePortrait} ${
                isRevealed ? styles.couplePortraitActive : styles.couplePortraitStatic
              }`}
              style={{
                objectPosition: activeSlide.pos,
                '--cameo-zoom': activeSlide.zoom,
              }}
              draggable={false}
            />

            {/* Recessed cameo glass edge shadow for authentic physical depth */}
            <div className={styles.cameoInnerShadow} aria-hidden="true" />

            {/* Interactive Scratch-Off Mauve Foil Canvas */}
            <canvas
              ref={canvasRef}
              className={`${styles.scratchCanvas} ${isRevealed ? styles.canvasCleared : ''}`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            />

            {/* Minimalist Animated Back-and-Forth Swipe Gesture Icon (Zero Text) */}
            <div
              className={`${styles.swipeHintOverlay} ${(hasScratched || isRevealed) ? styles.swipeHintHidden : ''}`}
              aria-hidden="true"
            >
              <svg
                className={styles.swipeArrowsSvg}
                viewBox="0 0 88 26"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14 16 Q44 6 74 16"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeDasharray="2.5 3.5"
                />
                <path
                  d="M21 10.5 L12.5 16.2 L22 19.8"
                  stroke="currentColor"
                  strokeWidth="1.45"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M67 10.5 L75.5 16.2 L66 19.8"
                  stroke="currentColor"
                  strokeWidth="1.45"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className={styles.swipeHandTrack}>
                <span className={styles.swipeTouchHalo} />
                <Pointer size={32} strokeWidth={1.35} className={styles.swipeHandIcon} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
