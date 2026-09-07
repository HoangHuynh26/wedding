import React, { useRef, useEffect } from 'react';
import styles from './Sparkles.module.css';

export default function Sparkles({ count = 28 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const handleResize = () => {
      canvas.width = canvas.parentElement ? canvas.parentElement.offsetWidth : window.innerWidth;
      canvas.height = canvas.parentElement ? canvas.parentElement.offsetHeight : window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Generate gold and champagne stardust particles
    const particles = Array.from({ length: count }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 0.8,
      alpha: Math.random() * 0.7 + 0.2,
      velocity: {
        x: (Math.random() - 0.5) * 0.35,
        y: -Math.random() * 0.5 - 0.15, // float gently upwards
      },
      twinkleSpeed: Math.random() * 0.02 + 0.01,
      color: Math.random() > 0.4 ? 'rgba(148, 163, 184, ' : 'rgba(255, 255, 255, ',
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.velocity.x;
        p.y += p.velocity.y;
        p.alpha += Math.sin(Date.now() * p.twinkleSpeed) * 0.015;

        const clampedAlpha = Math.max(0.1, Math.min(0.9, p.alpha));

        // Wrap around edges
        if (p.y < 0) p.y = canvas.height;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${clampedAlpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#cbd5e1';
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [count]);

  return <canvas ref={canvasRef} className={styles.sparklesCanvas} />;
}
