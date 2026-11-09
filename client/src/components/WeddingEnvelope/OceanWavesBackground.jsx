import React, { useEffect, useRef } from 'react';
import styles from './OceanWavesBackground.module.css';

/**
 * OceanWavesBackground
 * Silky-smooth canvas simulation of ocean waves washing rhythmically onto golden beach sand.
 * Features:
 * - Multi-layer translucent emerald/turquoise ocean water with depth gradient
 * - Realistic asymmetrical wave surge & recede motion (swell -> crest -> wash -> pull-back)
 * - Layered seafoam crests (bọt sóng biển) with organic fractal perturbation
 * - Lingering seafoam lace (bọt biển li ti đọng lại trên cát)
 * - Wet sand darkening effect with smooth drying decay
 * - Sunlight glisten / caustics on shallow water
 * - Hardware accelerated, automatically pauses when envelope is opened to save CPU/battery
 */
export default function OceanWavesBackground({ phase = 'sealed' }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;

    // Handle high DPI displays while capping at 2 for performance
    const handleResize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Only animate while sealed or opening
    const isVisible = phase === 'sealed' || phase === 'opening';
    if (!isVisible) return () => window.removeEventListener('resize', handleResize);

    // Lingering foam bubbles that stay on wet sand
    const bubbleCount = 65;
    const bubbles = [];
    for (let i = 0; i < bubbleCount; i++) {
      bubbles.push({
        xRel: Math.random(),
        yRel: Math.random(),
        radius: 1.2 + Math.random() * 2.8,
        alpha: 0,
        maxAlpha: 0.4 + Math.random() * 0.45,
        life: 0,
        maxLife: 160 + Math.random() * 180,
      });
    }

    // Wave parameters:
    // Beach runs diagonally from upper-left to mid-right (like a real tropical coastline)
    // Ocean is at top/top-left; golden sand is at bottom/bottom-right
    let startTime = performance.now();
    let maxWetOffsets = new Float32Array(256); // Track wet sand reach

    const render = (now) => {
      const elapsed = (now - startTime) * 0.001; // in seconds

      // Clear & Draw Sand Base
      // Sand palette: warm sunlit golden-champagne beach sand
      const sandGrad = ctx.createLinearGradient(0, 0, width, height);
      sandGrad.addColorStop(0, '#e7dac5');
      sandGrad.addColorStop(0.35, '#eedfc8');
      sandGrad.addColorStop(0.7, '#f4e8d3');
      sandGrad.addColorStop(1, '#e3d2ba');
      ctx.fillStyle = sandGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle warm sunlight glow on the beach
      const sunGlow = ctx.createRadialGradient(
        width * 0.5, height * 0.45, 10,
        width * 0.5, height * 0.45, Math.max(width, height) * 0.7
      );
      sunGlow.addColorStop(0, 'rgba(255, 250, 240, 0.45)');
      sunGlow.addColorStop(0.5, 'rgba(248, 235, 215, 0.2)');
      sunGlow.addColorStop(1, 'rgba(215, 185, 150, 0)');
      ctx.fillStyle = sunGlow;
      ctx.fillRect(0, 0, width, height);

      // Coastline baseline geometry:
      // Shoreline runs diagonally: (0, height * 0.32) -> (width, height * 0.56)
      const baseShoreY1 = height * 0.32;
      const baseShoreY2 = height * 0.58;

      // Real wave surge curve:
      // Fast surge forward (inflow), brief pause at peak crest, slower retreat (backwash)
      const getWaveProgress = (t, period) => {
        const cycle = (t % period) / period; // 0 to 1
        if (cycle < 0.42) {
          // Inflow surge (smooth sine ease in-out)
          const p = cycle / 0.42;
          return Math.sin((p * Math.PI) / 2);
        } else if (cycle < 0.52) {
          // Pause at crest
          return 1.0 - (cycle - 0.42) * 0.15;
        } else {
          // Slower backwash retreat
          const p = (cycle - 0.52) / 0.48;
          return 0.985 * Math.cos((p * Math.PI) / 2);
        }
      };

      // Wave 1: Primary swell (period ~8.2s, deep reach onto sand)
      const surge1 = getWaveProgress(elapsed, 8.2);
      // Wave 2: Secondary wave with phase offset (period ~6.5s)
      const surge2 = getWaveProgress(elapsed + 3.8, 6.5);

      // Calculate shoreline Y position for coordinate x:
      const getShoreY = (x, surge, waveOffset, timeScale = 1.0) => {
        const t = elapsed * timeScale;
        const normX = x / width;
        const baseY = baseShoreY1 + (baseShoreY2 - baseShoreY1) * normX;

        // Wave undulation harmonics:
        const waveReach = height * (0.16 + surge * 0.18);
        const undulation1 = Math.sin(normX * 4.2 + t * 0.85 + waveOffset) * (height * 0.038);
        const undulation2 = Math.cos(normX * 8.6 - t * 0.6 + waveOffset * 1.5) * (height * 0.016);
        const undulation3 = Math.sin(normX * 16.0 + t * 1.4) * (height * 0.007);

        return baseY + waveReach + undulation1 + undulation2 + undulation3;
      };

      // 1. WET SAND LAYER (Darkened sand left behind by receding water)
      // Decay maximum wet sand reach slowly over time
      const resSamples = 48;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      for (let i = 0; i <= resSamples; i++) {
        const x = (i / resSamples) * width;
        const currentY = getShoreY(x, Math.max(surge1, surge2), 0);
        // Track max reach
        if (currentY > maxWetOffsets[i]) {
          maxWetOffsets[i] = currentY;
        } else {
          maxWetOffsets[i] -= 0.12; // slow drying
        }
        ctx.lineTo(x, maxWetOffsets[i]);
      }
      ctx.lineTo(width, 0);
      ctx.closePath();

      // Wet sand darkening gradient
      const wetGrad = ctx.createLinearGradient(0, height * 0.2, width, height * 0.8);
      wetGrad.addColorStop(0, 'rgba(182, 146, 108, 0.38)');
      wetGrad.addColorStop(0.6, 'rgba(195, 158, 120, 0.26)');
      wetGrad.addColorStop(1, 'rgba(210, 175, 138, 0.12)');
      ctx.fillStyle = wetGrad;
      ctx.fill();

      // Wet sand glossy sheen (sunlight reflecting off wet sand)
      ctx.fillStyle = 'rgba(255, 250, 240, 0.12)';
      ctx.fill();

      // 2. OCEAN WATER LAYER — WAVE 2 (Secondary receding wave)
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, getShoreY(0, surge2, 1.2, 0.9));
      for (let i = 1; i <= resSamples; i++) {
        const x = (i / resSamples) * width;
        const y = getShoreY(x, surge2, 1.2, 0.9);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, 0);
      ctx.closePath();

      const wave2Grad = ctx.createLinearGradient(0, 0, width * 0.5, height * 0.7);
      wave2Grad.addColorStop(0, 'rgba(19, 99, 122, 0.88)');
      wave2Grad.addColorStop(0.35, 'rgba(38, 145, 165, 0.72)');
      wave2Grad.addColorStop(0.7, 'rgba(64, 182, 196, 0.52)');
      wave2Grad.addColorStop(1, 'rgba(125, 226, 230, 0.35)');
      ctx.fillStyle = wave2Grad;
      ctx.fill();

      // 3. OCEAN WATER LAYER — WAVE 1 (Primary swell & clear shallow wash)
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, getShoreY(0, surge1, 0, 1.0));
      for (let i = 1; i <= resSamples; i++) {
        const x = (i / resSamples) * width;
        const y = getShoreY(x, surge1, 0, 1.0);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, 0);
      ctx.closePath();

      const wave1Grad = ctx.createLinearGradient(0, 0, width * 0.6, height * 0.8);
      wave1Grad.addColorStop(0, 'rgba(16, 85, 105, 0.92)');
      wave1Grad.addColorStop(0.28, 'rgba(32, 128, 148, 0.80)');
      wave1Grad.addColorStop(0.55, 'rgba(52, 168, 185, 0.62)');
      wave1Grad.addColorStop(0.85, 'rgba(92, 212, 220, 0.42)');
      wave1Grad.addColorStop(1, 'rgba(155, 238, 240, 0.28)');
      ctx.fillStyle = wave1Grad;
      ctx.fill();

      // 4. WATER CAUSTICS / SUNLIGHT SHIMMER ON SHALLOW WATER
      ctx.save();
      ctx.globalAlpha = 0.18 + Math.sin(elapsed * 1.8) * 0.06;
      ctx.fillStyle = '#ffffff';
      for (let j = 0; j < 14; j++) {
        const cx = ((j * 73 + elapsed * 18) % width);
        const cy = (height * 0.15) + ((j * 37 + elapsed * 12) % (height * 0.42));
        ctx.beginPath();
        ctx.ellipse(cx, cy, 18 + (j % 4) * 6, 4 + (j % 3) * 2, (j * 0.4), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 5. SEAFOAM LACE & WAVE CREST LIP (Bọt sóng biển trắng xóa)
      // Draw double layered seafoam along the edge of Wave 1
      const drawFoamEdge = (surge, waveOffset, timeScale, foamWidth, alpha) => {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Outer translucent soft foam glow
        ctx.beginPath();
        for (let i = 0; i <= resSamples; i++) {
          const x = (i / resSamples) * width;
          const y = getShoreY(x, surge, waveOffset, timeScale);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.45})`;
        ctx.lineWidth = foamWidth * 1.8;
        ctx.stroke();

        // Main crisp foamy white lip
        ctx.beginPath();
        for (let i = 0; i <= resSamples; i++) {
          const x = (i / resSamples) * width;
          // Add micro jitter to simulate bubbling froth
          const jitter = Math.sin(i * 1.7 + elapsed * 6) * 1.8;
          const y = getShoreY(x, surge, waveOffset, timeScale) + jitter;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
        ctx.lineWidth = foamWidth;
        ctx.stroke();

        // Delicate inner froth line
        ctx.beginPath();
        for (let i = 0; i <= resSamples; i++) {
          const x = (i / resSamples) * width;
          const y = getShoreY(x, surge, waveOffset, timeScale) - (foamWidth * 0.85);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.55})`;
        ctx.lineWidth = foamWidth * 0.6;
        ctx.stroke();

        ctx.restore();
      };

      // Primary wave foam (prominent & foamy)
      const foamAlpha1 = 0.75 + surge1 * 0.25;
      const foamWidth1 = 5.5 + surge1 * 6.5;
      drawFoamEdge(surge1, 0, 1.0, foamWidth1, foamAlpha1);

      // Secondary wave foam (gentle secondary wash)
      const foamAlpha2 = 0.45 + surge2 * 0.25;
      const foamWidth2 = 4.0 + surge2 * 3.5;
      drawFoamEdge(surge2, 1.2, 0.9, foamWidth2, foamAlpha2);

      // 6. LINGERING FOAM BUBBLES ON WET SAND (Bọt biển lăn tăn đọng lại)
      ctx.save();
      bubbles.forEach((b) => {
        b.life += 1;
        if (b.life >= b.maxLife) {
          b.life = 0;
          b.xRel = Math.random();
          b.yRel = Math.random();
        }
        const bx = b.xRel * width;
        const shoreY = getShoreY(bx, surge1, 0);
        // Position bubbles near the shoreline and wet sand zone
        const by = shoreY - 15 + b.yRel * (height * 0.12);

        const lifeRatio = b.life / b.maxLife;
        const curAlpha = Math.sin(lifeRatio * Math.PI) * b.maxAlpha;

        ctx.beginPath();
        ctx.arc(bx, by, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${curAlpha})`;
        ctx.fill();
        // Tiny dark shadow underneath bubble for 3D realism
        ctx.strokeStyle = `rgba(200, 180, 150, ${curAlpha * 0.5})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      });
      ctx.restore();

      // Request next frame
      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [phase]);

  return (
    <div className={styles.oceanCanvasWrapper} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.oceanCanvas} />
      {/* Soft vignette gradient overlay to ensure perfect contrast for the text & envelope */}
      <div className={styles.vignette} />
    </div>
  );
}
