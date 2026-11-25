import React, { useEffect, useId, useRef } from 'react';
import { PARTING_START_MS, WRAP_CLEAR_MS, partingProgress, smoothProgress } from './openingTiming';
import styles from './WeddingEnvelope.module.css';

// Both sides of the wrap in a 1000 × 1000 folio.
// While closed (p === 0), a single continuous silk sheet renders with zero center seam.
// Once parting begins, left and right panels pull smoothly apart from the center gather.
function clothShapes(elapsed) {
  const p = partingProgress(elapsed);
  const topP = smoothProgress(elapsed, PARTING_START_MS + 390, WRAP_CLEAR_MS - 70);
  const botP = smoothProgress(elapsed, PARTING_START_MS + 470, WRAP_CLEAR_MS);
  const topOverlap = topP < 0.002 ? 1.5 : 0;
  const botOverlap = botP < 0.002 ? 1.5 : 0;

  const tipL = 500 - 560 * p;
  const topL = 500 + topOverlap - 540 * topP;
  const bottomL = 500 + botOverlap - 540 * botP;
  const upperFold = (topL - tipL) * 0.14;
  const lowerFold = (bottomL - tipL) * 0.19;

  const tipR = 1000 - tipL;
  const topR = 1000 - topL;
  const bottomR = 1000 - bottomL;

  const edgeL = `M ${topL} -4 C ${topL} 130 ${tipL + upperFold} 392 ${tipL} 500
                 C ${tipL + lowerFold} 615 ${bottomL} 870 ${bottomL} 1004`;
  const edgeR = `M ${topR} -4 C ${topR} 130 ${tipR - upperFold} 392 ${tipR} 500
                 C ${tipR - lowerFold} 615 ${bottomR} 870 ${bottomR} 1004`;

  return {
    isParting: p > 0.001,
    surfaceL: `${edgeL} H -65 V -4 Z`,
    surfaceR: `${edgeR} H 1065 V -4 Z`,
    turnL: `${edgeL} C ${bottomL - lowerFold * 0.8} 820 ${tipL - 4} 565 ${tipL - 2} 500
            C ${tipL - 3} 430 ${topL - upperFold * 1.6} 140 ${topL} -4 Z`,
    turnR: `${edgeR} C ${bottomR + lowerFold * 0.8} 820 ${tipR + 4} 565 ${tipR + 2} 500
            C ${tipR + 3} 430 ${topR + upperFold * 1.6} 140 ${topR} -4 Z`,
    turnOpacity: Math.min(0.22, p * 0.55),
    drift: (500 - 540 * topP - 500) * 0.78,
  };
}

const tied = clothShapes(0);

export default function OrganzaWrap({ opening }) {
  const id = useId();
  const closedSheet = useRef(null);
  const partingGroup = useRef(null);
  const surfaceL = useRef(null);
  const surfaceR = useRef(null);
  const turnL = useRef(null);
  const turnR = useRef(null);
  const turnFillL = useRef(null);
  const turnFillR = useRef(null);
  const patternL = useRef(null);
  const patternR = useRef(null);

  useEffect(() => {
    if (!opening) return undefined;
    const start = performance.now();
    let frame;
    function paint(now) {
      if (!surfaceL.current || !surfaceR.current) return;
      const elapsed = now - start;
      const shape = clothShapes(elapsed);

      if (shape.isParting) {
        if (closedSheet.current) closedSheet.current.setAttribute('opacity', '0');
        if (partingGroup.current) partingGroup.current.setAttribute('opacity', '1');
        surfaceL.current.setAttribute('d', shape.surfaceL);
        surfaceR.current.setAttribute('d', shape.surfaceR);
        turnL.current.setAttribute('d', shape.turnL);
        turnR.current.setAttribute('d', shape.turnR);
        const op = shape.turnOpacity.toFixed(3);
        if (turnFillL.current) turnFillL.current.setAttribute('fill-opacity', op);
        if (turnFillR.current) turnFillR.current.setAttribute('fill-opacity', op);
        patternL.current.setAttribute('patternTransform', `translate(${shape.drift} 0)`);
        patternR.current.setAttribute('patternTransform', `translate(${-shape.drift} 0)`);
      }

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
        <path ref={surfaceL} id={`${id}-cloth-l`} d={tied.surfaceL} />
        <path ref={surfaceR} id={`${id}-cloth-r`} d={tied.surfaceR} />
        <path ref={turnL} id={`${id}-turn-l`} d={tied.turnL} />
        <path ref={turnR} id={`${id}-turn-r`} d={tied.turnR} />

        {/* Seamless full-width silk gradient when closed (no vertical white seam at center) */}
        <linearGradient id={`${id}-silk-full`} x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
          <stop offset="0" stopColor="#e7dbe5" stopOpacity=".54" />
          <stop offset=".24" stopColor="#e4d6e0" stopOpacity=".32" />
          <stop offset=".5" stopColor="#cbb9c8" stopOpacity=".38" />
          <stop offset=".76" stopColor="#e4d6e0" stopOpacity=".32" />
          <stop offset="1" stopColor="#e7dbe5" stopOpacity=".54" />
        </linearGradient>

        {/* Matching left & right half gradients that join seamlessly at x = 500 when parting begins */}
        <linearGradient id={`${id}-silk-l`} x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
          <stop offset="0" stopColor="#e7dbe5" stopOpacity=".54" />
          <stop offset=".48" stopColor="#e4d6e0" stopOpacity=".32" />
          <stop offset="1" stopColor="#cbb9c8" stopOpacity=".38" />
        </linearGradient>
        <linearGradient id={`${id}-silk-r`} x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
          <stop offset="0" stopColor="#cbb9c8" stopOpacity=".38" />
          <stop offset=".52" stopColor="#e4d6e0" stopOpacity=".32" />
          <stop offset="1" stopColor="#e7dbe5" stopOpacity=".54" />
        </linearGradient>

        <pattern id={`${id}-weave-full`} patternUnits="userSpaceOnUse" width="1000" height="1000">
          <image href="/mauve-theme/mother-of-pearl.webp" width="1000" height="1000" preserveAspectRatio="none" opacity=".16" />
        </pattern>
        <pattern ref={patternL} id={`${id}-weave-l`} patternUnits="userSpaceOnUse" width="1000" height="1000">
          <image href="/mauve-theme/mother-of-pearl.webp" width="1000" height="1000" preserveAspectRatio="none" opacity=".16" />
        </pattern>
        <pattern ref={patternR} id={`${id}-weave-r`} patternUnits="userSpaceOnUse" width="1000" height="1000">
          <image href="/mauve-theme/mother-of-pearl.webp" width="1000" height="1000" preserveAspectRatio="none" opacity=".16" />
        </pattern>
      </defs>

      {/* Single continuous seamless silk sheet while closed — completely eliminates center white line */}
      <g ref={closedSheet} opacity="1">
        <rect x="-65" y="-4" width="1130" height="1008" fill={`url(#${id}-silk-full)`} />
        <rect x="-65" y="-4" width="1130" height="1008" fill={`url(#${id}-weave-full)`} />
      </g>

      {/* Parting left & right silk panels (activated smoothly once the bow unties) */}
      <g ref={partingGroup} opacity="0">
        <use href={`#${id}-cloth-l`} fill={`url(#${id}-silk-l)`} />
        <use href={`#${id}-cloth-l`} fill={`url(#${id}-weave-l)`} />
        <use ref={turnFillL} href={`#${id}-turn-l`} fill="#f6eaf2" fillOpacity="0" />

        <use href={`#${id}-cloth-r`} fill={`url(#${id}-silk-r)`} />
        <use href={`#${id}-cloth-r`} fill={`url(#${id}-weave-r)`} />
        <use ref={turnFillR} href={`#${id}-turn-r`} fill="#f6eaf2" fillOpacity="0" />
      </g>
    </svg>
  );
}
