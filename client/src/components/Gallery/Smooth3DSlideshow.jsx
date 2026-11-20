/* eslint-disable */
// Coverflow Gallery — Originkit
// Smooth 3D Slideshow adapted for Wedding Photo Album (Touch-first on Mobile)

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import styles from './Gallery.module.css';

const PERSPECTIVE = 1600;
const SCALE_STEP = 0.16;
const MAX_VISIBLE = 2;

// Derive a CSS transition (duration + easing) from a transition config
function cssTransition(t) {
  const dur = t && typeof t.duration === 'number' ? t.duration : 0.55;
  let ease = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const e = t?.ease;
  if (Array.isArray(e) && e.length === 4) {
    ease = `cubic-bezier(${e[0]}, ${e[1]}, ${e[2]}, ${e[3]})`;
  } else if (typeof e === 'string') {
    const map = {
      linear: 'linear',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    };
    ease = map[e] || 'ease';
  }
  return { dur, ease };
}

export default function Smooth3DSlideshow({
  slides = [],
  activeIndex: externalActiveIndex,
  onActiveIndexChange,
  onOpenLightbox,
  cardWidth: propCardWidth,
  cardHeight: propCardHeight,
  tilt = 12,
  sideTilt = 7,
  gap,
  opacity = 60,
  transition = { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 3.5 },
  autoplay = false,
  autoplayDirection = 'rightToLeft',
  showControls = true,
  labels = {},
  style = {},
}) {
  const list = slides && slides.length > 0 ? slides : [];
  const n = list.length;

  const [internalActive, setInternalActive] = useState(0);
  const active = typeof externalActiveIndex === 'number' ? externalActiveIndex : internalActive;

  const setActive = useCallback(
    (updater) => {
      if (typeof updater === 'function') {
        const next = updater(active);
        setInternalActive(next);
        if (onActiveIndexChange) onActiveIndexChange(next);
      } else {
        setInternalActive(updater);
        if (onActiveIndexChange) onActiveIndexChange(updater);
      }
    },
    [active, onActiveIndexChange]
  );

  // Responsive sizing & mobile / tablet swipe-only detection
  const getLayoutMetrics = () => {
    if (typeof window === 'undefined') {
      return { width: 320, height: 428, gap: 5.4, depth: 185, isMobile: true, isTouch: true };
    }
    const w = window.innerWidth;
    const h = window.innerHeight || 800;
    const isCoarseTouch =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(hover: none) and (pointer: coarse)').matches
        : ('ontouchstart' in window) && (navigator.maxTouchPoints > 0);

    if (w < 480) {
      // Mobile screen: card takes comfortable width, clean 3:4 aspect ratio
      const rawW = Math.min(w - 44, 340);
      const cw = Math.floor(rawW / 2) * 2;
      const ch = Math.round(cw * 1.34);
      return { width: cw, height: ch, gap: 4.8, depth: 150, isMobile: true, isTouch: true };
    } else if (w <= 768) {
      const rawW = Math.min(w - 80, 380);
      const cw = Math.floor(rawW / 2) * 2;
      const ch = Math.round(cw * 1.34);
      return { width: cw, height: ch, gap: 5.6, depth: 180, isMobile: true, isTouch: true };
    } else if (w < 1024) {
      // Tablet portrait
      const ch = Math.min(440, Math.max(360, Math.round(h * 0.54)));
      const cw = Math.floor(ch / 1.34 / 2) * 2;
      return { width: cw, height: ch, gap: 5.4, depth: 185, isMobile: true, isTouch: true };
    } else {
      // Balanced desktop & laptop coverflow — slightly larger presence while fitting comfortably in one viewport
      const ch = Math.min(490, Math.max(380, Math.round(h * 0.64)));
      const cw = Math.floor(ch / 1.34 / 2) * 2;
      const desktopGap = Number((cw / 58).toFixed(2));
      return {
        width: cw,
        height: ch,
        gap: desktopGap,
        depth: 195,
        isMobile: isCoarseTouch,
        isTouch: isCoarseTouch,
      };
    }
  };

  const [dimensions, setDimensions] = useState(getLayoutMetrics);

  useEffect(() => {
    const handleResize = () => {
      setDimensions(getLayoutMetrics());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = dimensions.isMobile;
  const isTouch = dimensions.isTouch;
  const cardWidth = propCardWidth || dimensions.width;
  const cardHeight = propCardHeight || dimensions.height;
  const effectiveGap = gap || dimensions.gap;
  const depth = dimensions.depth || 240;

  // Keep active valid if the slide list changes
  useEffect(() => {
    if (n > 0 && active >= n) {
      setActive(0);
    }
  }, [n, active, setActive]);

  // Preload adjacent images in memory for instant crisp display upon swiping
  useEffect(() => {
    if (n === 0) return;
    for (let offset = -4; offset <= 4; offset++) {
      const idx = (((active + offset) % n) + n) % n;
      const s = list[idx];
      const imgSrc = s?.image?.src || s?.src || s?.image;
      if (imgSrc) {
        const img = new Image();
        img.src = imgSrc;
      }
    }
  }, [active, list, n]);

  // Short debounce lock so rapid touch swipes remain smooth & responsive
  const lockRef = useRef(false);
  const lock = useCallback((ms = 140) => {
    lockRef.current = true;
    window.setTimeout(() => {
      lockRef.current = false;
    }, ms);
  }, []);

  const step = useCallback(
    (dir, lockMs = 140) => {
      if (lockRef.current || n === 0) return;
      lock(lockMs);
      setActive((a) => (((a + dir) % n) + n) % n);
    },
    [n, lock, setActive]
  );

  // Track whether user just swiped or is actively touching so autoplay & click behave cleanly
  const didSwipeRef = useRef(false);
  const isTouchingRef = useRef(false);

  const handleCardClick = useCallback(
    (i) => {
      if (didSwipeRef.current) {
        didSwipeRef.current = false;
        return;
      }
      if (lockRef.current) return;
      if (i === active) {
        if (onOpenLightbox) {
          onOpenLightbox(i);
        }
        return;
      }
      lock(220);
      setActive(i);
    },
    [active, lock, setActive, onOpenLightbox]
  );

  // Autoplay every 4s (resets cleanly whenever active slide changes via swipe/click)
  const delay = transition && typeof transition.delay === 'number' ? transition.delay : 4.0;
  useEffect(() => {
    if (!autoplay || n < 2) return;
    const ms = Math.max(0.5, delay) * 1000;
    const dir = autoplayDirection === 'leftToRight' ? -1 : 1;
    const id = window.setInterval(() => {
      if (!isTouchingRef.current) {
        step(dir, 260);
      }
    }, ms);
    return () => window.clearInterval(id);
  }, [autoplay, autoplayDirection, delay, n, active, step]);

  // Keyboard navigation
  const onKeyDown = useCallback(
    (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        step(1, 220);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        step(-1, 220);
      }
    },
    [step]
  );

  // Enhanced Touch Swipe Support (Left / Right)
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchDeltaX = useRef(0);
  const touchDeltaY = useRef(0);

  const handleTouchStart = (e) => {
    isTouchingRef.current = true;
    if (!e.touches || e.touches.length === 0) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchDeltaX.current = 0;
    touchDeltaY.current = 0;
    didSwipeRef.current = false;
  };

  const handleTouchMove = (e) => {
    if (!e.touches || e.touches.length === 0) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
    touchDeltaY.current = e.touches[0].clientY - touchStartY.current;
  };

  const handleTouchEnd = () => {
    isTouchingRef.current = false;
    const dx = touchDeltaX.current;
    const dy = touchDeltaY.current;
    // Trigger horizontal swipe when horizontal gesture exceeds 26px and dominates vertical scroll
    if (Math.abs(dx) > 26 && Math.abs(dx) > Math.abs(dy) * 0.85) {
      didSwipeRef.current = true;
      if (dx > 0) {
        step(-1, 110);
      } else {
        step(1, 110);
      }
      window.setTimeout(() => {
        didSwipeRef.current = false;
      }, 250);
    }
    touchStartX.current = 0;
    touchStartY.current = 0;
    touchDeltaX.current = 0;
    touchDeltaY.current = 0;
  };

  const { dur, ease } = cssTransition(transition);
  const transitionCss = `transform ${dur}s ${ease}, opacity ${dur}s ${ease}`;

  // Inactive opacity & border-radius
  const effectiveRadius = 16;
  const dim = 1 - Math.max(0, Math.min(100, opacity)) / 100;

  const rootStyle = {
    position: 'relative',
    width: '100%',
    minHeight: cardHeight + 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    perspective: isTouch ? 'none' : `${PERSPECTIVE}px`,
    WebkitPerspective: isTouch ? 'none' : `${PERSPECTIVE}px`,
    overflow: 'hidden',
    outline: 'none',
    padding: '10px 0',
    touchAction: 'pan-y',
    ...(style || {}),
  };

  if (n === 0) return null;

  return (
    <div
      style={rootStyle}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label={labels.carousel || '3D Wedding Photo Slideshow'}
      onKeyDown={onKeyDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={styles.coverflowRoot}
    >
      <div
        style={{
          position: 'relative',
          width: cardWidth,
          height: cardHeight,
          transformStyle: isTouch ? 'flat' : 'preserve-3d',
          WebkitTransformStyle: isTouch ? 'flat' : 'preserve-3d',
        }}
        className={styles.coverflowStage}
      >
        {list.map((slide, i) => {
          let rel = i - active;
          if (n > 1) {
            if (rel > n / 2) rel -= n;
            if (rel < -n / 2) rel += n;
          }
          const ax = Math.abs(rel);
          const visible = ax <= MAX_VISIBLE;
          const isActive = rel === 0;
          const sc = Math.max(0.4, 1 - ax * SCALE_STEP);
          const tx = rel * (effectiveGap * 30);
          const tz = -ax * depth;
          const ry = -rel * tilt;
          const rz = rel * sideTilt;
          const src = slide.image?.src || slide.src || slide.image || '';

          const cardStyle = {
            position: 'absolute',
            left: 0,
            top: 0,
            width: cardWidth,
            height: cardHeight,
            borderRadius: effectiveRadius,
            overflow: 'hidden',
            transformOrigin: 'center center',
            transformStyle: isTouch ? 'flat' : (isActive ? 'flat' : 'preserve-3d'),
            WebkitTransformStyle: isTouch ? 'flat' : (isActive ? 'flat' : 'preserve-3d'),
            transform: isActive
              ? 'translateX(0px) scale(1)'
              : (isTouch
                ? `translateX(${tx}px) scale(${sc})`
                : `translateX(${tx}px) translateZ(${tz}px) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${sc})`),
            WebkitTransform: isActive
              ? 'translateX(0px) scale(1)'
              : (isTouch
                ? `translateX(${tx}px) scale(${sc})`
                : `translateX(${tx}px) translateZ(${tz}px) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${sc})`),
            transition: transitionCss,
            opacity: visible ? 1 : 0,
            cursor: isActive ? 'zoom-in' : 'pointer',
            pointerEvents: visible ? 'auto' : 'none',
            backgroundColor: '#e2dae3',
            zIndex: 10 - ax,
            boxShadow: 'none',
            border: 'none',
          };

          return (
            <div
              key={i}
              style={cardStyle}
              onClick={() => handleCardClick(i)}
              aria-label={slide.title || `Photo ${i + 1}`}
              aria-hidden={!visible}
              className={styles.coverflowCard}
            >
              {/* Photo Image — Razor sharp native rendering on Mobile, iPad & Desktop */}
              {src ? (
                <img
                  src={src}
                  alt={slide.image?.alt || slide.title || ''}
                  draggable={false}
                  decoding="async"
                  loading={ax <= 1 ? 'eager' : 'lazy'}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: slide.position || '50% 28%',
                    display: 'block',
                    userSelect: 'none',
                    pointerEvents: 'none',
                  }}
                />
              ) : null}

              {/* Inactive Card Dim Overlay — Only mounted for inactive cards to prevent composite blur */}
              {!isActive && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: '#000000',
                    opacity: dim,
                    transition: `opacity ${dur}s ${ease}`,
                    pointerEvents: 'none',
                  }}
                />
              )}

              {/* Active Card Controls: Expand icon kept, photo counter removed */}
              {isActive && (
                <div
                  className={styles.frameBadgeOverlay}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className={styles.expandIconBtn}
                    onClick={() => onOpenLightbox && onOpenLightbox(active)}
                    aria-label={labels.expand || 'Expand image'}
                  >
                    <Maximize2 size={15} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Left & Right Navigation Arrows placed cleanly OUTSIDE the photos on Desktop */}
      {!isMobile && showControls && n > 1 && (
        <>
          <button
            type="button"
            className={`${styles.mainNavBtn} ${styles.mainNavPrev}`}
            onClick={(e) => {
              e.stopPropagation();
              step(-1, 220);
            }}
            aria-label={labels.prev || 'Previous photo'}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            type="button"
            className={`${styles.mainNavBtn} ${styles.mainNavNext}`}
            onClick={(e) => {
              e.stopPropagation();
              step(1, 220);
            }}
            aria-label={labels.next || 'Next photo'}
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}
    </div>
  );
}
