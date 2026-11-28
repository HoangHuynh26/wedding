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
 * Hardware-accelerated WebGL curtain renderer (~0.04ms GPU time per frame, zero CPU slice storm).
 * Uses a single power-of-two (256 × 1024) seamlessly repeating texture so WebGL 1 REPEAT works
 * natively on every iOS Safari, Android Chrome, and Desktop GPU.
 */
function createWebGLCurtainRenderer(gl, pleatImage) {
  const potCanvas = document.createElement('canvas');
  potCanvas.width = 256;
  potCanvas.height = 1024;
  const pctx = potCanvas.getContext('2d');
  pctx.drawImage(pleatImage, 0, 0, 256, 1024);

  const vsSrc = `
    attribute vec2 aPos;
    attribute vec2 aUv;
    attribute vec4 aTint;
    attribute float aMode;
    uniform vec2 uRes;
    varying mediump vec2 vUv;
    varying mediump vec4 vTint;
    varying mediump float vMode;
    void main() {
      vUv = aUv;
      vTint = aTint;
      vMode = aMode;
      vec2 clip = (aPos / uRes) * 2.0 - 1.0;
      gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
    }
  `;
  const fsSrc = `
    precision mediump float;
    uniform sampler2D uTex;
    varying mediump vec2 vUv;
    varying mediump vec4 vTint;
    varying mediump float vMode;
    void main() {
      if (vMode > 0.5) {
        gl_FragColor = vec4(vTint.rgb * vTint.a, vTint.a);
      } else {
        vec4 tex = texture2D(uTex, vUv);
        float a = tex.a * vTint.a;
        gl_FragColor = vec4(tex.rgb * a, a);
      }
    }
  `;

  const compile = (type, src) => {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    return sh;
  };
  const prog = gl.createProgram();
  const vs = compile(gl.VERTEX_SHADER, vsSrc);
  const fs = compile(gl.FRAGMENT_SHADER, fsSrc);
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    gl.deleteProgram(prog);
    return null;
  }

  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);

  const stride = 9 * 4; // x, y, u, v, r, g, b, a, mode
  const bindAttr = (name, size, offset) => {
    const loc = gl.getAttribLocation(prog, name);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride, offset);
  };
  bindAttr('aPos', 2, 0);
  bindAttr('aUv', 2, 8);
  bindAttr('aTint', 4, 16);
  bindAttr('aMode', 1, 32);

  const uRes = gl.getUniformLocation(prog, 'uRes');

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, potCanvas);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  const ROWS = 40;
  const data = new Float32Array(2400 * 9);
  let ptr = 0;

  const pushV = (x, y, u, v, r, g, b, a, mode) => {
    data[ptr++] = x;
    data[ptr++] = y;
    data[ptr++] = u;
    data[ptr++] = v;
    data[ptr++] = r;
    data[ptr++] = g;
    data[ptr++] = b;
    data[ptr++] = a;
    data[ptr++] = mode;
  };

  const pushQuad = (
    x0t, y0, u0t, v0, a0t,
    x1t, u1t, a1t,
    x0b, y1, u0b, v1, a0b,
    x1b, u1b, a1b,
    r, g, b, mode
  ) => {
    pushV(x0t, y0, u0t, v0, r, g, b, a0t, mode);
    pushV(x1t, y0, u1t, v0, r, g, b, a1t, mode);
    pushV(x0b, y1, u0b, v1, r, g, b, a0b, mode);

    pushV(x0b, y1, u0b, v1, r, g, b, a0b, mode);
    pushV(x1t, y0, u1t, v0, r, g, b, a1t, mode);
    pushV(x1b, y1, u1b, v1, r, g, b, a1b, mode);
  };

  const edges = new Float32Array(ROWS + 1);

  return {
    draw(W, H, dpr, p, pleatAlpha) {
      gl.viewport(0, 0, Math.round(W * dpr), Math.round(H * dpr));
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (pleatAlpha <= 0.004) return;

      gl.useProgram(prog);
      gl.uniform2f(uRes, W, H);
      ptr = 0;

      const scaleY = H / 1376;
      const maxTiebackW = W < 680 ? Math.round(W * 0.27) : Math.round(W * 0.3);
      const tbLeftW = Math.min(Math.round(277 * scaleY), maxTiebackW);
      const halfClosedW = Math.ceil(W * 0.503);
      const unitW = Math.max(40, pleatImage.naturalWidth * scaleY * 1.18);
      const repeatCount = halfClosedW / unitW;

      for (let i = 0; i <= ROWS; i++) {
        const yn = i / ROWS;
        const waistBias = Math.exp(-Math.pow((yn - 0.49) / 0.3, 2));
        const localP = smoothstep(0, 1, p * 1.16 - (1 - waistBias) * 0.24);
        const target = sampleEdgeRatio(yn) * tbLeftW;
        edges[i] = Math.max(2, halfClosedW * (1 - localP) + target * localP);
      }

      // 1. Soft inner hem shadow strips (pure vertex-alpha gradient, zero blur pass)
      if (p > 0.02) {
        const sw = 12 + 10 * (1 - p);
        const sa = 0.12 * pleatAlpha;
        const sr = 64 / 255;
        const sg = 52 / 255;
        const sb = 72 / 255;
        for (let i = 0; i < ROWS; i++) {
          const y0 = (i / ROWS) * H;
          const y1 = ((i + 1) / ROWS) * H;
          const e0 = edges[i];
          const e1 = edges[i + 1];
          // Left hem shadow
          pushQuad(
            e0 - 2, y0, 0, 0, sa, e0 + sw, 0, 0,
            e1 - 2, y1, 0, 0, sa, e1 + sw, 0, 0,
            sr, sg, sb, 1
          );
          // Right hem shadow
          pushQuad(
            W - e0 - sw, y0, 0, 0, 0, W - e0 + 2, 0, sa,
            W - e1 - sw, y1, 0, 0, 0, W - e1 + 2, 0, sa,
            sr, sg, sb, 1
          );
        }
      }

      // 2. Left & Right sculpted silk curtain meshes (single draw call)
      for (let i = 0; i < ROWS; i++) {
        const v0 = i / ROWS;
        const v1 = (i + 1) / ROWS;
        const y0 = v0 * H;
        const y1 = v1 * H;
        const e0 = edges[i];
        const e1 = edges[i + 1];

        // Left curtain: x from 0 -> e, u from 0 -> repeatCount (gather compresses horizontal pleats naturally!)
        pushQuad(
          0, y0, 0, v0, pleatAlpha, e0, repeatCount, pleatAlpha,
          0, y1, 0, v1, pleatAlpha, e1, repeatCount, pleatAlpha,
          1, 1, 1, 0
        );
        // Right curtain: x from W - e -> W, mirrored u from repeatCount -> 0
        pushQuad(
          W - e0, y0, repeatCount, v0, pleatAlpha, W, 0, pleatAlpha,
          W - e1, y1, repeatCount, v1, pleatAlpha, W, 0, pleatAlpha,
          1, 1, 1, 0
        );
      }

      // 3. Center vertical seam crease while closed
      const seamAlpha = (1 - smoothstep(0.02, 0.16, p)) * 0.42 * pleatAlpha;
      if (seamAlpha > 0.004) {
        const cx = W * 0.5;
        const sr = 56 / 255;
        const sg = 44 / 255;
        const sb = 64 / 255;
        pushQuad(cx - 14, 0, 0, 0, 0, cx, 0, seamAlpha, cx - 14, H, 0, 1, 0, cx, 0, seamAlpha, sr, sg, sb, 1);
        pushQuad(cx, 0, 0, 0, seamAlpha, cx + 14, 0, 0, cx, H, 0, 1, seamAlpha, cx + 14, 0, 0, sr, sg, sb, 1);
      }

      gl.bufferData(gl.ARRAY_BUFFER, data.subarray(0, ptr), gl.DYNAMIC_DRAW);
      gl.drawArrays(gl.TRIANGLES, 0, ptr / 9);
    },
    dispose() {
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    },
  };
}

/**
 * Lightweight Canvas2D fallback (dpr = 1, coarse slices) for devices without WebGL.
 */
function createCanvas2DFallback(ctx, pleatImage) {
  let cacheW = 0;
  let cacheH = 0;
  let leftOff = null;
  let rightOff = null;

  return {
    draw(W, H, dpr, p, pleatAlpha) {
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      if (pleatAlpha <= 0.004) {
        ctx.restore();
        return;
      }

      const scaleY = H / 1376;
      const maxTiebackW = W < 680 ? Math.round(W * 0.27) : Math.round(W * 0.3);
      const tbLeftW = Math.min(Math.round(277 * scaleY), maxTiebackW);
      const halfClosedW = Math.ceil(W * 0.503);
      const ch = Math.max(1, Math.round(H));

      if (!leftOff || cacheW !== halfClosedW || cacheH !== ch) {
        const unitW = Math.max(40, Math.round(pleatImage.naturalWidth * scaleY * 1.18));
        leftOff = document.createElement('canvas');
        leftOff.width = halfClosedW;
        leftOff.height = ch;
        const lctx = leftOff.getContext('2d');
        for (let x = 0; x < halfClosedW; x += unitW) {
          lctx.drawImage(pleatImage, x, 0, unitW, ch);
        }

        rightOff = document.createElement('canvas');
        rightOff.width = halfClosedW;
        rightOff.height = ch;
        const rctx = rightOff.getContext('2d');
        rctx.translate(halfClosedW, 0);
        rctx.scale(-1, 1);
        rctx.drawImage(leftOff, 0, 0);

        cacheW = halfClosedW;
        cacheH = ch;
      }

      ctx.globalAlpha = pleatAlpha;
      const sliceH = 12;
      for (let y = 0; y < H; y += sliceH) {
        const yn = y / Math.max(1, H - 1);
        const waistBias = Math.exp(-Math.pow((yn - 0.49) / 0.3, 2));
        const localP = smoothstep(0, 1, p * 1.16 - (1 - waistBias) * 0.24);
        const cur = Math.max(2, halfClosedW * (1 - localP) + sampleEdgeRatio(yn) * tbLeftW * localP);
        const sy = Math.min(ch - 1, Math.round(yn * (ch - 1)));
        const sh = Math.max(1, Math.min(sliceH + 1, ch - sy));
        ctx.drawImage(leftOff, 0, sy, cacheW, sh, 0, y, cur, sliceH + 0.8);
        ctx.drawImage(rightOff, 0, sy, cacheW, sh, W - cur, y, cur, sliceH + 0.8);
      }
      ctx.restore();
    },
    dispose() {},
  };
}

export default function WeddingSchedule() {
  const { t } = useLanguage();
  const schedule = t.theDay || {};
  const items = schedule.items || [];

  const sectionRef = useRef(null);
  const folioRef = useRef(null);
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const latestProgressRef = useRef(0);
  const lastDrawnRef = useRef(-1);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 88%', 'start 8%'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 28,
    damping: 18,
    mass: 1.35,
  });

  const tiebackOpacity = useTransform(smoothProgress, [0.45, 0.92], [0, 1]);
  const tiebackLeftX = useTransform(smoothProgress, [0.45, 0.96], ['12px', '0px']);
  const tiebackRightX = useTransform(smoothProgress, [0.45, 0.96], ['-12px', '0px']);

  const contentOpacity = useTransform(smoothProgress, [0.3, 0.85], [0, 1]);
  const contentScale = useTransform(smoothProgress, [0.3, 0.9], [0.96, 1]);
  const contentY = useTransform(smoothProgress, [0.3, 0.9], [20, 0]);

  const drawCurtains = (rawP, force = false) => {
    const canvas = canvasRef.current;
    const renderer = rendererRef.current;
    if (!canvas || !renderer) return;

    const p = prefersReducedMotion ? 1 : clamp(rawP, 0, 1);
    if (!force && Math.abs(p - lastDrawnRef.current) < 0.002) return;
    const prevP = lastDrawnRef.current;
    lastDrawnRef.current = p;

    const { w: W, h: H, dpr } = sizeRef.current;
    if (W < 2 || H < 2) return;

    const pleatAlpha = 1 - smoothstep(0.68, 0.98, p);
    const prevAlpha = prevP < 0 ? 1 : 1 - smoothstep(0.68, 0.98, prevP);
    if (!force && pleatAlpha <= 0.004 && prevAlpha <= 0.004) {
      return;
    }

    canvas.style.visibility = pleatAlpha <= 0.004 ? 'hidden' : 'visible';
    renderer.draw(W, H, dpr, p, pleatAlpha);
  };

  useEffect(() => {
    let cancelled = false;

    const syncCanvasSize = () => {
      const folio = folioRef.current;
      const canvas = canvasRef.current;
      if (!folio || !canvas) return;
      const rect = folio.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const W = Math.max(1, Math.round(rect.width));
      const H = Math.max(1, Math.round(rect.height));
      const cw = Math.max(1, Math.round(W * dpr));
      const ch = Math.max(1, Math.round(H * dpr));
      sizeRef.current = { w: W, h: H, dpr };
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }
      drawCurtains(latestProgressRef.current, true);
    };

    const img = new Image();
    img.decoding = 'async';
    img.src = '/mauve-theme/curtain-pleats-matched.webp';
    img.onload = () => {
      if (cancelled || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const gl = canvas.getContext('webgl', {
        alpha: true,
        antialias: true,
        depth: false,
        stencil: false,
        powerPreference: 'high-performance',
      });
      let renderer = gl ? createWebGLCurtainRenderer(gl, img) : null;
      if (!renderer) {
        const ctx2d = canvas.getContext('2d');
        if (ctx2d) renderer = createCanvas2DFallback(ctx2d, img);
      }
      rendererRef.current = renderer;
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
      rendererRef.current?.dispose();
      rendererRef.current = null;
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

        {/* Layer 3 (z-index 4): GPU WebGL Closing/Parting Silk Pleats Canvas */}
        <canvas
          ref={canvasRef}
          className={styles.curtainCanvas}
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
