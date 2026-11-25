import React, { useEffect, useState, useRef } from 'react';
import styles from './CursorEffect.module.css';

export default function CursorEffect() {
  const [isSupported, setIsSupported] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const dotRef = useRef(null);
  const ringRef = useRef(null);

  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });

  useEffect(() => {
    // Check if device supports fine pointer (mouse, not touch)
    const mediaQuery = window.matchMedia('(pointer: fine)');
    if (!mediaQuery.matches) {
      return;
    }

    setIsSupported(true);

    let animationFrameId = null;
    const animateRing = () => {
      const dx = mousePos.current.x - ringPos.current.x;
      const dy = mousePos.current.y - ringPos.current.y;
      const ease = 0.18;
      ringPos.current.x += dx * ease;
      ringPos.current.y += dy * ease;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      if (Math.abs(dx) > 0.25 || Math.abs(dy) > 0.25) {
        animationFrameId = requestAnimationFrame(animateRing);
      } else {
        animationFrameId = null;
      }
    };

    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }
      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(animateRing);
      }
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.getAttribute('role') === 'button' ||
        target.closest('button') ||
        target.closest('a')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseover', handleMouseOver, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (!isSupported) return null;

  return (
    <>
      <div
        ref={dotRef}
        className={`${styles.cursorDot} ${isHovering ? styles.isHovering : ''}`}
      />
      <div
        ref={ringRef}
        className={`${styles.cursorRing} ${isHovering ? styles.isHovering : ''}`}
      />
    </>
  );
}
