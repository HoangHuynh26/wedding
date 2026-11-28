import React, { useEffect, useRef } from 'react';
import { useMotionValueEvent, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { createScheduleCurtains, schedulePaper, scheduleVelvet } from './scheduleCurtains';
import styles from './WeddingSchedule.module.css';

export default function WeddingSchedule() {
  const { t } = useLanguage();
  const schedule = t.theDay || {};
  const items = schedule.items || [];
  const sectionRef = useRef(null);
  const folioRef = useRef(null);
  const drapesRef = useRef(null);
  const canvasRef = useRef(null);
  const updateRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 90%', 'start 13%'],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 76,
    damping: 22,
    mass: 0.85,
    restDelta: 0.0005,
  });

  useEffect(() => {
    if (reducedMotion) return undefined;
    const folio = folioRef.current;
    const drapes = drapesRef.current;
    const canvas = canvasRef.current;
    const leftPanel = drapes.firstElementChild;
    let renderer;
    let observer;
    let cancelled = false;
    let width = 0;
    let height = 0;
    let panelWidth = 0;
    let lastDraw = -1;

    function showRestingCurtains() {
      canvas.style.visibility = 'hidden';
      drapes.style.visibility = '';
    }

    function draw(value) {
      const position = Math.max(0, Math.min(value, 1));
      if (!renderer || !width || !height) return;
      if (position >= 0.9995) {
        if (lastDraw !== 1) showRestingCurtains();
        lastDraw = 1;
        return;
      }
      if (Math.abs(position - lastDraw) < 0.0005) return;

      renderer.draw(width, height, panelWidth, position);
      canvas.style.visibility = 'visible';
      drapes.style.visibility = 'hidden';
      lastDraw = position;
    }

    function resize() {
      const bounds = folio.getBoundingClientRect();
      ({ width, height } = bounds);
      panelWidth = leftPanel.getBoundingClientRect().width;
      if (!width || !height) return;
      const density = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * density);
      canvas.height = Math.round(height * density);
      lastDraw = -1;
      draw(progress.get());
    }

    function handleContextLoss() {
      updateRef.current = null;
      renderer?.dispose();
      renderer = null;
      showRestingCurtains();
    }

    const image = new Image();
    image.src = scheduleVelvet;
    image.decode().then(() => {
      if (cancelled) return;
      renderer = createScheduleCurtains(canvas, image);
      if (!renderer) return;
      updateRef.current = draw;
      resize();
      if (typeof ResizeObserver !== 'undefined') {
        observer = new ResizeObserver(resize);
        observer.observe(folio);
      }
      window.addEventListener('resize', resize);
      canvas.addEventListener('webglcontextlost', handleContextLoss);
    }).catch(showRestingCurtains);

    return () => {
      cancelled = true;
      updateRef.current = null;
      observer?.disconnect();
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('webglcontextlost', handleContextLoss);
      renderer?.dispose();
      showRestingCurtains();
    };
  }, [progress, reducedMotion]);

  useMotionValueEvent(progress, 'change', value => updateRef.current?.(value));

  return (
    <section
      ref={sectionRef}
      className={styles.scheduleSection}
      id="schedule"
      aria-label={schedule.headingTop ? `${schedule.headingTop} ${schedule.headingBottom}` : 'Lịch Trình'}
    >
      <div
        ref={folioRef}
        className={styles.curtainFolio}
        style={{ '--schedule-paper': `url("${schedulePaper}")`, '--schedule-velvet': `url("${scheduleVelvet}")` }}
      >
        <div ref={drapesRef} className={styles.drapes} aria-hidden="true">
          <div className={`${styles.drape} ${styles.left}`} />
          <div className={`${styles.drape} ${styles.right}`} />
        </div>

        <div className={styles.scheduleContent}>
          <header className={styles.headerBlock}>
            <h2 className={styles.scriptHeading}>
              <span>{schedule.headingTop || 'Lịch'}</span>
              <span>{schedule.headingBottom || 'Trình'}</span>
            </h2>
          </header>

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
        </div>

        <canvas ref={canvasRef} className={styles.curtainCanvas} aria-hidden="true" />
      </div>
    </section>
  );
}
