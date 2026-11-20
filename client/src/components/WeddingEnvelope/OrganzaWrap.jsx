import React, { useEffect, useId, useRef } from 'react';
import { PARTING_START_MS, WRAP_CLEAR_MS, partingProgress, smoothProgress } from './openingTiming';
import styles from './WeddingEnvelope.module.css';

// One side of the wrap, mirrored about the middle of a 1000 × 1000 folio.
// The gather is pulled first. The selvages at the corners follow slightly later.
function clothEdges(elapsed) {
  const tip = 500 - 560 * partingProgress(elapsed);
  const top = 500 - 540 * smoothProgress(elapsed, PARTING_START_MS + 390, WRAP_CLEAR_MS - 70);
  const bottom = 500 - 540 * smoothProgress(elapsed, PARTING_START_MS + 470, WRAP_CLEAR_MS);
  const upperFold = (top - tip) * .14;
  const lowerFold = (bottom - tip) * .19;
  const edge = `M ${top} -4 C ${top} 130 ${tip + upperFold} 392 ${tip} 500
                C ${tip + lowerFold} 615 ${bottom} 870 ${bottom} 1004`;
  return {
    surface: `${edge} H -65 V -4 Z`,
    turn: `${edge} C ${bottom - lowerFold * .8} 820 ${tip - 4} 565 ${tip - 2} 500
                C ${tip - 3} 430 ${top - upperFold * 1.6} 140 ${top} -4 Z`,
    drift: (top - 500) * .78,
  };
}

const tied = clothEdges(0);

export default function OrganzaWrap({ opening }) {
  const id = useId();
  const surface = useRef(null);
  const turn = useRef(null);
  const pattern = useRef(null);

  useEffect(() => {
    if (!opening) return undefined;
    const start = performance.now();
    let frame;
    function paint(now) {
      if (!surface.current) return;
      const elapsed = now - start;
      const shape = clothEdges(elapsed);
      surface.current.setAttribute('d', shape.surface);
      turn.current.setAttribute('d', shape.turn);
      pattern.current.setAttribute('patternTransform', `translate(${shape.drift} 0)`);
      if (elapsed < WRAP_CLEAR_MS) frame = requestAnimationFrame(paint);
    }
    const timer = setTimeout(() => { frame = requestAnimationFrame(paint); }, PARTING_START_MS);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [opening]);

  return (
    <svg className={styles.wrap} viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <defs>
        <path ref={surface} id={`${id}-cloth`} d={tied.surface} />
        <path ref={turn} id={`${id}-turn`} d={tied.turn} />
        <linearGradient id={`${id}-silk`} x1="0" y1="0" x2="1" y2=".16" gradientUnits="objectBoundingBox">
          <stop stopColor="#e7dbe5" stopOpacity=".57" />
          <stop offset=".42" stopColor="#e6d9e2" stopOpacity=".31" />
          <stop offset=".81" stopColor="#b9a5b6" stopOpacity=".40" />
          <stop offset="1" stopColor="#eadde8" stopOpacity=".54" />
        </linearGradient>
        <pattern ref={pattern} id={`${id}-weave`} patternUnits="userSpaceOnUse" width="1000" height="1000">
          <image href="/mauve-theme/mother-of-pearl.webp" width="1000" height="1000" preserveAspectRatio="none" opacity=".16" />
        </pattern>
        <g id={`${id}-panel`}>
          <use href={`#${id}-cloth`} fill={`url(#${id}-silk)`} />
          <use href={`#${id}-cloth`} fill={`url(#${id}-weave)`} />
          <use href={`#${id}-turn`} fill="#f6eaf2" fillOpacity=".32" />
        </g>
      </defs>
      <use href={`#${id}-panel`} />
      <use href={`#${id}-panel`} transform="translate(1000 0) scale(-1 1)" />
    </svg>
  );
}
