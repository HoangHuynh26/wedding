import React, { useEffect, useRef } from 'react';
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
} from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import styles from './WeddingSchedule.module.css';

// Measured silhouette inner-edge profile (fraction of trimmed tieback width) across 17 vertical steps
const TIEBACK_EDGE_PROFILE = [
  0.64, 0.64, 0.628, 0.602, 0.565, 0.515, 0.448, 0.368, 0.33,
  0.388, 0.368, 0.4, 0.428, 0.455, 0.478, 0.502, 0.34,
];

function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

function smoothstep(e0, e1, x) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}

function sampleEdgeRatio(yNorm) {
  const idxF = clamp(yNorm, 0, 1) * (TIEBACK_EDGE_PROFILE.length - 1);
  const i0 = Math.floor(idxF);
  const i1 = Math.min(TIEBACK_EDGE_PROFILE.length - 1, i0 + 1);
  const frac = idxF - i0;
  return TIEBACK_EDGE_PROFILE[i0] * (1 - frac) + TIEBACK_EDGE_PROFILE[i1] * frac;
}

/**
 * Step 7 — "The Day / Lịch Trình" with Scroll-Driven Waist-Cinching Tieback Curtains
 * Layer architecture (guaranteed zero text clipping on every screen size):
 *   z-index 0: Seamless dusty-lilac textured wall
 *   z-index 1: Edge-pinned tied-back curtains with braided cords & tassels (BEHIND text)
 *   z-index 3: Schedule timeline content (ALWAYS 100% unobstructed once opened)
 *   z-index 4: Scroll-driven closing/parting silk pleats canvas (starts 100% shut, parts
 *              from the waist in an hourglass curve and fades cleanly into the tied-back drapes)
 */
export default function WeddingSchedule() {
  const { t } = useLanguage();
  const schedule = t.theDay || {};
  const items = schedule.items || [];

  const sectionRef = useRef(null);
  const folioRef = useRef(null);
  const canvasRef = useRef(null);
  const pleatImgRef = useRef(null);
  const tiledRef = useRef({ w: 0, h: 0, left: null, right: null });
  const latestProgressRef = useRef(0);
  const prefersReducedMotion = useReducedMotion();

  // Start parting gently as #schedule enters from bottom (88%) and reach 100% fully opened
  // the moment its top edge arrives just below the sticky bar (8%) — long 80vh slow travel
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 88%', 'start 8%'],
  });

  // Heavy, silky overdamped spring so curtains glide open slowly and gracefully (no abrupt snap)
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 28,
    damping: 18,
    mass: 1.35,
  });

  // Tied-back edge drapes appear smoothly and settle to 100% before start reaches 8%
  const tiebackOpacity = useTransform(smoothProgress, [0.45, 0.92], [0, 1]);
  const tiebackLeftX = useTransform(smoothProgress, [0.45, 0.96], ['12px', '0px']);
  const tiebackRightX = useTransform(smoothProgress, [0.45, 0.96], ['-12px', '0px']);

  // Schedule typography unveils smoothly to 100% opacity as curtains finish parting
  const contentOpacity = useTransform(smoothProgress, [0.3, 0.85], [0, 1]);
  const contentScale = useTransform(smoothProgress, [0.3, 0.9], [0.96, 1]);
  const contentY = useTransform(smoothProgress, [0.3, 0.9], [20, 0]);

  const drawCurtains = (rawP) => {
    const canvas = canvasRef.current;
    const pleats = pleatImgRef.current;
    if (!canvas || !pleats) return;

    const p = prefersReducedMotion ? 1 : clamp(rawP, 0, 1);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = canvas.width / dpr;
    const H = canvas.height / dpr;
    if (W < 2 || H < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // Keep the parting silk pleats gliding slowly until near full reveal before fading into tiebacks
    const pleatAlpha = 1 - smoothstep(0.68, 0.98, p);
    if (pleatAlpha <= 0.004) {
      ctx.restore();
      return;
    }

    // Match the exact rendered width of the edge-pinned CSS tieback drapes on mobile & desktop
    const scaleY = H / 1376;
    const maxTiebackW = W < 680 ? Math.round(W * 0.27) : Math.round(W * 0.3);
    const tbLeftW = Math.min(Math.round(277 * scaleY), maxTiebackW);
    const halfClosedW = Math.ceil(W * 0.503);

    const cache = tiledRef.current;
    if (!cache.left || cache.w !== halfClosedW || cache.h !== Math.round(H)) {
      const unitW = Math.max(40, Math.round(pleats.naturalWidth * scaleY * 1.18));
      const ch = Math.max(1, Math.round(H));

      const leftOff = document.createElement('canvas');
      leftOff.width = halfClosedW;
      leftOff.height = ch;
      const lctx = leftOff.getContext('2d');
      for (let x = 0; x < halfClosedW; x += unitW) {
        lctx.drawImage(pleats, x, 0, unitW, ch);
      }

      const rightOff = document.createElement('canvas');
      rightOff.width = halfClosedW;
      rightOff.height = ch;
      const rctx = rightOff.getContext('2d');
      rctx.translate(halfClosedW, 0);
      rctx.scale(-1, 1);
      rctx.drawImage(leftOff, 0, 0);

      cache.w = halfClosedW;
      cache.h = ch;
      cache.left = leftOff;
      cache.right = rightOff;
    }

    const sliceH = 1.5;
    const srcH = cache.h;
    const srcW = cache.w;

    const edgeAt = (yn) => {
      const waistBias = Math.exp(-Math.pow((yn - 0.49) / 0.3, 2));
      const localP = smoothstep(0, 1, p * 1.16 - (1 - waistBias) * 0.24);
      const target = sampleEdgeRatio(yn) * tbLeftW;
      return Math.max(2, halfClosedW * (1 - localP) + target * localP);
    };

    ctx.globalAlpha = pleatAlpha;

    // Smooth continuous curved shadow along the moving inner curtain hem (zero stair-step jaggies!)
    if (p > 0.02) {
      const shadowW = 10 + 8 * (1 - p);
      ctx.save();
      ctx.lineWidth = shadowW;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = `rgba(64, 52, 72, ${(0.14 * pleatAlpha).toFixed(3)})`;
      ctx.filter = 'blur(4px)';

      ctx.beginPath();
      for (let y = 0; y <= H; y += 6) {
        const cur = edgeAt(y / Math.max(1, H - 1));
        if (y === 0) ctx.moveTo(cur + shadowW * 0.25, y);
        else ctx.lineTo(cur + shadowW * 0.25, y);
      }
      ctx.stroke();

      ctx.beginPath();
      for (let y = 0; y <= H; y += 6) {
        const cur = edgeAt(y / Math.max(1, H - 1));
        if (y === 0) ctx.moveTo(W - cur - shadowW * 0.25, y);
        else ctx.lineTo(W - cur - shadowW * 0.25, y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // Fine 1.5px sculpted lilac pleats parting slowly from the waist in a silky curved silhouette
    for (let y = 0; y < H; y += sliceH) {
      const yn = y / Math.max(1, H - 1);
      const cur = edgeAt(yn);
      const sy = Math.min(srcH - 1, Math.round(yn * (srcH - 1)));
      const sh = Math.max(1, Math.min(Math.ceil(sliceH) + 1, srcH - sy));

      ctx.drawImage(cache.left, 0, sy, srcW, sh, 0, y, cur, sliceH + 0.7);
      ctx.drawImage(cache.right, 0, sy, srcW, sh, W - cur, y, cur, sliceH + 0.7);
    }

    // Delicate vertical center seam crease while curtains are closed
    const seamAlpha = (1 - smoothstep(0.02, 0.16, p)) * 0.42;
    if (seamAlpha > 0.005) {
      const seamGrad = ctx.createLinearGradient(W / 2 - 14, 0, W / 2 + 14, 0);
      seamGrad.addColorStop(0, 'rgba(64, 52, 72, 0)');
      seamGrad.addColorStop(0.46, `rgba(64, 52, 72, ${(seamAlpha * 0.65).toFixed(3)})`);
      seamGrad.addColorStop(0.5, `rgba(54, 42, 62, ${seamAlpha.toFixed(3)})`);
      seamGrad.addColorStop(0.54, `rgba(64, 52, 72, ${(seamAlpha * 0.65).toFixed(3)})`);
      seamGrad.addColorStop(1, 'rgba(64, 52, 72, 0)');
      ctx.fillStyle = seamGrad;
      ctx.fillRect(W / 2 - 14, 0, 28, H);
    }

    ctx.restore();
  };

  useEffect(() => {
    let cancelled = false;

    const syncCanvasSize = () => {
      const folio = folioRef.current;
      const canvas = canvasRef.current;
      if (!folio || !canvas) return;
      const rect = folio.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = Math.max(1, Math.round(rect.width * dpr));
      const ch = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }
      drawCurtains(latestProgressRef.current);
    };

    const img = new Image();
    img.decoding = 'async';
    img.src = '/mauve-theme/curtain-pleats-matched.webp';
    img.onload = () => {
      if (cancelled) return;
      pleatImgRef.current = img;
      latestProgressRef.current = prefersReducedMotion ? 1 : smoothProgress.get();
      syncCanvasSize();
    };

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(syncCanvasSize) : null;
    if (ro && folioRef.current) ro.observe(folioRef.current);
    window.addEventListener('resize', syncCanvasSize);

    return () => {
      cancelled = true;
      if (ro) ro.disconnect();
      window.removeEventListener('resize', syncCanvasSize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReducedMotion]);

  useMotionValueEvent(smoothProgress, 'change', (latest) => {
    latestProgressRef.current = latest;
    drawCurtains(latest);
  });

  return (
    <section
      ref={sectionRef}
      className={styles.scheduleSection}
      id="schedule"
      aria-label={schedule.headingTop ? `${schedule.headingTop} ${schedule.headingBottom}` : 'Lịch Trình'}
    >
      <div ref={folioRef} className={styles.curtainFolio}>
        {/* Layer 0: Seamless Dusty-Lilac Textured Wall spanning 100% width */}
        <div className={styles.curtainWallTile} aria-hidden="true" />

        {/* Layer 1: Edge-Pinned Tied-Back Curtains with Braided Cords & Tassels (BEHIND text -> zero clipping!) */}
        <motion.img
          src="/mauve-theme/curtain-tieback-left.webp"
          alt=""
          className={`${styles.tiebackDrape} ${styles.tiebackLeft}`}
          style={prefersReducedMotion ? undefined : { opacity: tiebackOpacity, x: tiebackLeftX }}
          draggable={false}
          aria-hidden="true"
        />
        <motion.img
          src="/mauve-theme/curtain-tieback-right.webp"
          alt=""
          className={`${styles.tiebackDrape} ${styles.tiebackRight}`}
          style={prefersReducedMotion ? undefined : { opacity: tiebackOpacity, x: tiebackRightX }}
          draggable={false}
          aria-hidden="true"
        />

        {/* Layer 2 (z-index 3): Schedule Content — ALWAYS unobstructed above tied-back curtains */}
        <motion.div
          className={styles.scheduleContent}
          style={
            prefersReducedMotion
              ? undefined
              : {
                  opacity: contentOpacity,
                  scale: contentScale,
                  y: contentY,
                }
          }
        >
          <header className={styles.headerBlock}>
            <h2 className={styles.scriptHeading}>
              <span>{schedule.headingTop || 'Lịch'}</span>
              <span>{schedule.headingBottom || 'Trình'}</span>
            </h2>
          </header>

          {/* Minimalist Vertical Hairline Timeline */}
          <ol className={styles.timelineList}>
            {items.map((item, idx) => (
              <li key={item.time + idx} className={styles.timelineRow}>
                <span className={styles.nodeGem} aria-hidden="true" />
                <div className={styles.rowBody}>
                  <span className={styles.rowTime}>{item.time}</span>
                  <h3 className={styles.rowTitle}>{item.title}</h3>
                  <p className={styles.rowDetail}>{item.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </motion.div>

        {/* Layer 3 (z-index 4): Scroll-Driven Closing/Parting Silk Pleats Canvas */}
        <canvas
          ref={canvasRef}
          className={styles.curtainCanvas}
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
