import React, { useRef, useEffect } from 'react';
import styles from './Sparkles.module.css';

/**
 * Sparkles (Kim Tuyến Bay Bổng)
 * Luxury gold & champagne floating glitter, tumbling sequins, and twinkling stars.
 */
export default function Sparkles({ count = 38, className = '', theme = 'gold-rose' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let isRunning = true;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      const width = parent ? parent.offsetWidth : window.innerWidth;
      const height = parent ? parent.offsetHeight : window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const getCanvasSize = () => {
      const parent = canvas.parentElement;
      return {
        w: parent ? parent.offsetWidth : window.innerWidth,
        h: parent ? parent.offsetHeight : window.innerHeight,
      };
    };

    const { w: initialW, h: initialH } = getCanvasSize();

    // Particle types: 'star' (ngôi sao 4 cánh), 'flake' (kim tuyến lấp lánh xoay 3D), 'dust' (bụi tiên phát sáng)
    const types = ['star', 'flake', 'dust', 'flake', 'dust', 'star'];

    // Luxury high-contrast palettes that pop brilliantly on light ivory/cream backgrounds
    const paletteMap = {
      'gold-rose': [
        { r: 218, g: 148, b: 32 },  // Deep 24K Royal Gold
        { r: 228, g: 122, b: 95 },  // Sparkling Rose Gold
        { r: 242, g: 178, b: 52 },  // Radiant Sun Gold
        { r: 196, g: 118, b: 34 },  // Warm Amber Bronze
        { r: 215, g: 95, b: 85 },   // Romantic Rose Champagne
      ],
      'royal-gold': [
        { r: 218, g: 148, b: 32 },  // Deep 24K Royal Gold
        { r: 242, g: 178, b: 52 },  // Radiant Sun Gold
        { r: 196, g: 118, b: 34 },  // Warm Amber Bronze
        { r: 232, g: 165, b: 42 },  // Metallic Gold
      ],
    };

    const palette = paletteMap[theme] || paletteMap['gold-rose'];

    const particles = Array.from({ length: count }).map(() => {
      const type = types[Math.floor(Math.random() * types.length)];
      const color = palette[Math.floor(Math.random() * palette.length)];
      const baseAlpha = Math.random() * 0.45 + 0.45;
      const size = type === 'star' ? Math.random() * 5.5 + 3.8 : type === 'flake' ? Math.random() * 4 + 2.2 : Math.random() * 2.5 + 1.2;

      return {
        x: Math.random() * initialW,
        y: Math.random() * initialH,
        type,
        color,
        size,
        baseAlpha,
        alpha: baseAlpha,
        speedY: (Math.random() * 0.45 + 0.2) * (prefersReducedMotion ? 0.3 : 1),
        swaySpeed: Math.random() * 0.002 + 0.001,
        swayAmp: Math.random() * 0.8 + 0.4,
        swayPhase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.0035 + 0.002,
        twinklePhase: Math.random() * Math.PI * 2,
        rotZ: Math.random() * Math.PI * 2,
        rotSpeedZ: (Math.random() - 0.5) * 0.018,
        rotX: Math.random() * Math.PI * 2,
        rotSpeedX: Math.random() * 0.025 + 0.015,
      };
    });

    let lastTime = performance.now();

    const drawSparkleStar = (x, y, size, alpha, rot, c) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})`;
      ctx.shadowColor = `rgba(${c.r}, ${c.g}, ${c.b}, 0.85)`;
      ctx.shadowBlur = size * 2.2;

      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2;
        ctx.lineTo(Math.cos(a) * size, Math.sin(a) * size);
        const ha = a + Math.PI / 4;
        ctx.lineTo(Math.cos(ha) * (size * 0.22), Math.sin(ha) * (size * 0.22));
      }
      ctx.closePath();
      ctx.fill();

      // Bright white central highlight
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, alpha * 1.35)})`;
      ctx.fill();

      ctx.restore();
    };

    const drawGlitterFlake = (x, y, size, alpha, rotZ, rotX, c) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotZ);
      const flipScale = Math.cos(rotX);
      ctx.scale(1, Math.abs(flipScale) * 0.85 + 0.15);

      const shine = Math.max(0.2, Math.abs(flipScale));
      const r = Math.min(255, Math.floor(c.r + (255 - c.r) * (1 - shine)));
      const g = Math.min(255, Math.floor(c.g + (255 - c.g) * (1 - shine)));
      const b = Math.min(255, Math.floor(c.b + (255 - c.b) * (1 - shine)));

      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * shine})`;
      ctx.shadowColor = `rgba(${c.r}, ${c.g}, ${c.b}, ${0.5 * shine})`;
      ctx.shadowBlur = size * 2;

      ctx.beginPath();
      // Hexagonal / diamond sequin
      const sides = 6;
      for (let i = 0; i < sides; i++) {
        const a = (i * 2 * Math.PI) / sides;
        const px = Math.cos(a) * size;
        const py = Math.sin(a) * size;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    };

    const drawDustMote = (x, y, radius, alpha, c) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})`;
      ctx.shadowColor = `rgba(${c.r}, ${c.g}, ${c.b}, 0.8)`;
      ctx.shadowBlur = radius * 3.5;
      ctx.fill();
      ctx.restore();
    };

    const render = (time) => {
      if (!isRunning) return;
      const dt = Math.min(time - lastTime, 64);
      lastTime = time;

      const { w, h } = getCanvasSize();
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Float upwards
        p.y -= p.speedY * (dt / 16);
        // Organic horizontal swaying breeze
        p.swayPhase += p.swaySpeed * dt;
        p.x += Math.sin(p.swayPhase) * p.swayAmp;

        // Twinkle
        p.twinklePhase += p.twinkleSpeed * dt;
        p.alpha = Math.max(0.08, Math.min(0.95, p.baseAlpha * (0.65 + 0.35 * Math.sin(p.twinklePhase))));

        // Rotate
        p.rotZ += p.rotSpeedZ * (dt / 16);
        p.rotX += p.rotSpeedX * (dt / 16);

        // Screen wrap
        if (p.y < -20) {
          p.y = h + 15;
          p.x = Math.random() * w;
        }
        if (p.x < -20) p.x = w + 15;
        else if (p.x > w + 20) p.x = -15;

        // Draw particle based on type
        if (p.type === 'star') {
          drawSparkleStar(p.x, p.y, p.size, p.alpha, p.rotZ, p.color);
        } else if (p.type === 'flake') {
          drawGlitterFlake(p.x, p.y, p.size, p.alpha, p.rotZ, p.rotX, p.color);
        } else {
          drawDustMote(p.x, p.y, p.size, p.alpha, p.color);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [count]);

  return <canvas ref={canvasRef} className={`${styles.sparklesCanvas} ${className}`} aria-hidden="true" />;
}
