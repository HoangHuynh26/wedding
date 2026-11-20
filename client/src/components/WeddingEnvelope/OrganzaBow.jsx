import React, { useEffect, useRef, useState } from 'react';
import styles from './OrganzaBow.module.css';

const width = 1280;
const height = 714;
const ribbonY = 312;
const finishTime = 4520;

// Photograph fragments are clipped once at their native scale from silk-organza-bow.webp.
const photoPieces = {
  leftLoop: {
    bounds: [341, 106, 267, 240],
    edge: 'M605 273 C595 214 568 165 518 137 C481 115 437 104 421 109 C407 127 377 190 344 281 C339 295 358 307 393 322 C458 350 529 351 600 324 Z',
  },
  rightLoop: {
    bounds: [670, 106, 266, 240],
    edge: 'M672 279 C691 194 732 153 803 122 C825 112 843 106 852 109 C873 135 910 213 931 276 C941 294 916 313 885 325 C817 352 744 350 675 324 Z',
  },
  leftTail: {
    bounds: [255, 319, 355, 296],
    edge: 'M593 321 C567 346 541 351 505 375 C419 436 344 519 258 578 C310 585 395 607 456 613 C522 539 578 437 608 345 Z',
  },
  rightTail: {
    bounds: [666, 314, 371, 305],
    edge: 'M670 316 C735 337 800 374 850 416 C904 465 975 532 1035 567 C987 582 912 600 837 617 C761 536 702 433 669 351 Z',
  },
  knot: {
    bounds: [592, 262, 91, 99],
    edge: 'M604 269 C620 273 623 260 639 267 C654 272 676 265 679 287 C682 306 680 337 670 348 C657 360 640 345 628 353 C613 365 597 350 597 335 C594 314 594 282 604 269 Z',
  },
};

// Build a seamless, full-length real photographed silk organza sash (660 x 134) from the actual photo strip
function buildRealSash(image, isRight) {
  const sashW = 660;
  const sashH = 134;
  const stripW = 334;

  // 1. Extract the clean outer photographed silk ribbon strip along its exact stitched satin hems
  const strip = document.createElement('canvas');
  strip.width = stripW;
  strip.height = sashH;
  const sctx = strip.getContext('2d');
  if (!isRight) {
    sctx.translate(0, -244);
    sctx.clip(new Path2D('M0 247 L334 252 L334 373 L0 375 Z'));
    sctx.drawImage(image, 0, 0);
  } else {
    sctx.translate(-946, -244);
    sctx.clip(new Path2D('M946 252 L1280 247 L1280 375 L946 373 Z'));
    sctx.drawImage(image, 0, 0);
  }

  // 2. Extend seamlessly to 660px by mirror-blending the real silk texture toward the center knot
  const full = document.createElement('canvas');
  full.width = sashW;
  full.height = sashH;
  const fctx = full.getContext('2d');
  const overlap = 36;

  if (!isRight) {
    // 1. Fade the right overlap edge of the outer photo strip [298..334] from 1 -> 0
    sctx.setTransform(1, 0, 0, 1, 0, 0);
    sctx.globalCompositeOperation = 'destination-in';
    const sGrad = sctx.createLinearGradient(0, 0, stripW, 0);
    sGrad.addColorStop(0, 'rgba(0,0,0,1)');
    sGrad.addColorStop((stripW - overlap) / stripW, 'rgba(0,0,0,1)');
    sGrad.addColorStop(1, 'rgba(0,0,0,0)');
    sctx.fillStyle = sGrad;
    sctx.fillRect(0, 0, stripW, sashH);
    sctx.globalCompositeOperation = 'source-over';
    fctx.drawImage(strip, 0, 0);

    // 2. Build mirrored inner continuation [298..656] with a single full-width alpha mask
    const mir = document.createElement('canvas');
    mir.width = stripW;
    mir.height = sashH;
    const mctx = mir.getContext('2d');
    mctx.translate(stripW, 0);
    mctx.scale(-1, 1);
    if (!isRight) {
      mctx.translate(0, -244);
      mctx.clip(new Path2D('M0 247 L334 252 L334 373 L0 375 Z'));
      mctx.drawImage(image, 0, 0);
    }

    mctx.setTransform(1, 0, 0, 1, 0, 0);
    mctx.globalCompositeOperation = 'destination-in';
    const mGrad = mctx.createLinearGradient(0, 0, stripW, 0);
    mGrad.addColorStop(0, 'rgba(0,0,0,0)');
    mGrad.addColorStop(overlap / stripW, 'rgba(0,0,0,1)');
    mGrad.addColorStop((stripW - 34) / stripW, 'rgba(0,0,0,1)');
    mGrad.addColorStop(1, 'rgba(0,0,0,0)');
    mctx.fillStyle = mGrad;
    mctx.fillRect(0, 0, stripW, sashH);
    mctx.globalCompositeOperation = 'source-over';

    fctx.drawImage(mir, stripW - overlap, 0, stripW + 24, sashH);
  } else {
    // 1. Fade the left overlap edge of the outer right photo strip [0..36] from 0 -> 1
    sctx.setTransform(1, 0, 0, 1, 0, 0);
    sctx.globalCompositeOperation = 'destination-in';
    const sGrad = sctx.createLinearGradient(0, 0, stripW, 0);
    sGrad.addColorStop(0, 'rgba(0,0,0,0)');
    sGrad.addColorStop(overlap / stripW, 'rgba(0,0,0,1)');
    sGrad.addColorStop(1, 'rgba(0,0,0,1)');
    sctx.fillStyle = sGrad;
    sctx.fillRect(0, 0, stripW, sashH);
    sctx.globalCompositeOperation = 'source-over';
    fctx.drawImage(strip, sashW - stripW, 0);

    // 2. Build mirrored inner continuation [4..362] with a single full-width alpha mask
    const mir = document.createElement('canvas');
    mir.width = stripW;
    mir.height = sashH;
    const mctx = mir.getContext('2d');
    mctx.translate(stripW, 0);
    mctx.scale(-1, 1);
    mctx.translate(-946, -244);
    mctx.clip(new Path2D('M946 252 L1280 247 L1280 375 L946 373 Z'));
    mctx.drawImage(image, 0, 0);

    mctx.setTransform(1, 0, 0, 1, 0, 0);
    mctx.globalCompositeOperation = 'destination-in';
    const mGrad = mctx.createLinearGradient(0, 0, stripW, 0);
    mGrad.addColorStop(0, 'rgba(0,0,0,0)');
    mGrad.addColorStop(34 / stripW, 'rgba(0,0,0,1)');
    mGrad.addColorStop((stripW - overlap) / stripW, 'rgba(0,0,0,1)');
    mGrad.addColorStop(1, 'rgba(0,0,0,0)');
    mctx.fillStyle = mGrad;
    mctx.fillRect(0, 0, stripW, sashH);
    mctx.globalCompositeOperation = 'source-over';

    fctx.drawImage(mir, 4, 0, stripW + 22, sashH);
  }

  return { layer: full, y: 244, w: sashW, h: sashH };
}

function clipPieces(image) {
  const pieces = Object.fromEntries(Object.entries(photoPieces).map(([name, { bounds, edge }]) => {
    const [x, y, w, h] = bounds;
    const layer = document.createElement('canvas');
    layer.width = w;
    layer.height = h;
    const draw = layer.getContext('2d');
    draw.translate(-x, -y);
    draw.clip(new Path2D(edge));
    draw.drawImage(image, 0, 0);

    // Feather only the tucked root of each tail so it merges seamlessly into the silk sash
    if (name === 'leftTail' || name === 'rightTail') {
      draw.setTransform(1, 0, 0, 1, 0, 0);
      draw.globalCompositeOperation = 'destination-in';
      const neckX = name === 'leftTail' ? w : 0;
      const neckGrad = draw.createRadialGradient(neckX, 10, 4, neckX, 10, 46);
      neckGrad.addColorStop(0, 'rgba(0, 0, 0, 0.05)');
      neckGrad.addColorStop(0.55, 'rgba(0, 0, 0, 0.78)');
      neckGrad.addColorStop(1, 'rgba(0, 0, 0, 1)');
      draw.fillStyle = neckGrad;
      draw.fillRect(0, 0, w, h);
      draw.globalCompositeOperation = 'source-over';
    }

    return [name, { layer, x, y }];
  }));

  pieces.leftSash = buildRealSash(image, false);
  pieces.rightSash = buildRealSash(image, true);
  return pieces;
}

function ease(time, start, end) {
  const p = Math.min(1, Math.max(0, (time - start) / (end - start)));
  return p * p * (3 - 2 * p);
}

function paintPiece(draw, piece, pivotX, pivotY, angle, dx = 0, dy = 0, scaleX = 1, scaleY = 1) {
  draw.save();
  draw.translate(pivotX + dx, pivotY + dy);
  draw.rotate(angle);
  if (scaleX !== 1 || scaleY !== 1) draw.scale(scaleX, scaleY);
  draw.drawImage(piece.layer, piece.x - pivotX, piece.y - pivotY);
  draw.restore();
}

// Draw the real photographed horizontal silk organza sash with natural knot-pinch & rippling release wave
function paintRealSash(draw, sash, isRight, knotX, travel, knotPinch, waveAmp, time) {
  const { layer, y, w, h } = sash;
  const sliceW = 6;
  // Base x so inner tip reaches past knotX when tied, then glides outward by travel
  const baseX = isRight
    ? (knotX - 24) + travel
    : (knotX + 24 - w) - travel;

  for (let sx = 0; sx < w; sx += sliceW) {
    const sw = Math.min(sliceW, w - sx);
    const screenX = baseX + sx;
    if (screenX + sw < -40 || screenX > width + 40) continue;

    // Distance from the inner knot end of this sash
    const distFromInner = isRight ? sx : (w - (sx + sw));

    // While tied, the silk sash gathers/pinches vertically into the knot; when untied it relaxes open
    const gather = knotPinch * Math.exp(-distFromInner / 95);
    const scaleY = 1 - 0.56 * gather;

    // Supple transverse silk wave rippling outward from the center as tension releases
    const waveEnvelope = Math.exp(-distFromInner / 340);
    const phase = distFromInner * 0.022 - time * 0.0085;
    const waveY = waveAmp * waveEnvelope * Math.sin(phase) + travel * 0.045;

    const curH = h * scaleY;
    const drawY = ribbonY + (y + h * 0.5 - ribbonY) * scaleY - curH * 0.5 + waveY;

    draw.drawImage(layer, sx, 0, sw, h, screenX, drawY, sw + 0.5, curH);
  }
}

// Coupled loop-shrinking physics: as the tails are pulled outward, the bow loops narrow, tilt, and draw into the knot
function threadLoop(draw, { layer, x, y }, pull, mouth, fromRight = false) {
  if (pull >= 0.995) return;
  if (!pull) {
    draw.drawImage(layer, x, y);
    return;
  }

  // Loops shrink both horizontally (sliding into mouth) and vertically (tension narrowing)
  const slideOffset = (fromRight ? -1 : 1) * 265 * Math.pow(pull, 1.08);
  const tensionNarrow = 1 - 0.42 * ease(pull, 0.05, 0.9);
  const folding = ease(pull, 0, 0.16);

  for (let slice = 0; slice < layer.width; slice += 4) {
    const rawX = x + slice + slideOffset;
    if (!fromRight) {
      const visible = Math.min(4, layer.width - slice, mouth - rawX);
      if (visible <= 0) break;
      const distToMouth = Math.max(0, mouth - (rawX + visible * 0.5));
      const mouthPinch = 1 - 0.82 * folding * (1 - ease(distToMouth, 0, 130));
      const sy = tensionNarrow * mouthPinch;
      // Subtle downward pull tilt toward the knot as tail tugs the loop
      const pullDip = 14 * pull * (1 - Math.min(1, distToMouth / 180));
      draw.drawImage(
        layer,
        slice, 0, visible, layer.height,
        rawX, ribbonY + (y - ribbonY) * sy + pullDip, visible + 0.4, layer.height * sy,
      );
    } else {
      const sliceRight = rawX + 4;
      if (sliceRight <= mouth) continue;
      const screenX = Math.max(mouth, rawX);
      const srcOffset = screenX - rawX;
      const visible = Math.min(4 - srcOffset, layer.width - (slice + srcOffset));
      if (visible <= 0) continue;
      const distToMouth = Math.max(0, (screenX + visible * 0.5) - mouth);
      const mouthPinch = 1 - 0.82 * folding * (1 - ease(distToMouth, 0, 130));
      const sy = tensionNarrow * mouthPinch;
      const pullDip = 14 * pull * (1 - Math.min(1, distToMouth / 180));
      draw.drawImage(
        layer,
        slice + srcOffset, 0, visible, layer.height,
        screenX, ribbonY + (y - ribbonY) * sy + pullDip, visible + 0.4, layer.height * sy,
      );
    }
  }
}

function drawBow(draw, pieces, time) {
  draw.clearRect(0, 0, width, height);

  // Stage 1: Both tails actively pull outward & swing upward, drawing the two loops into the knot
  const pullLeft = ease(time, 1100, 2520);
  const pullRight = ease(time, 1180, 2600);
  const avgPull = 0.5 * (pullLeft + pullRight);

  // Stage 2: Knot cinches under tension, then unrolls flat into the ribbon as the loops slip free
  const knotCinch = Math.sin(ease(time, 1100, 2350) * Math.PI);
  const knotUnwrap = ease(time, 2250, 2950);
  const knotPinch = 1 - 0.72 * knotUnwrap;

  // Stage 3: Supple silk release wave & outward parting glide with the organza veil panels
  const releaseWave = Math.sin(ease(time, 2350, 3450) * Math.PI) * 16;
  const leftPart = 920 * ease(time, 2820, finishTime);
  const rightPart = 940 * ease(time, 2760, 4460);

  const knotX = 638 + 6 * Math.sin(avgPull * Math.PI);
  const knotShift = knotX - 638;
  const exitFade = 1 - ease(time, 4120, finishTime);
  draw.globalAlpha = exitFade;

  // Tail roots stay firmly anchored inside the knot while their outer tips elongate & lift upward
  // as they pull the loop fabric through the knot, then glide outward with leftPart / rightPart!
  const leftTailPullX = knotShift - leftPart;
  const leftTailPullY = -8 * pullLeft + leftPart * 0.045 + releaseWave * 0.4;
  const leftTailAngle = 0.42 * pullLeft - 0.1 * ease(time, 2800, 4100);
  const leftTailStretchX = 1 + 0.34 * pullLeft;
  const leftTailStretchY = 1 - 0.1 * pullLeft;

  const rightTailPullX = knotShift + rightPart;
  const rightTailPullY = -8 * pullRight + rightPart * 0.045 - releaseWave * 0.4;
  const rightTailAngle = -0.42 * pullRight + 0.1 * ease(time, 2800, 4100);
  const rightTailStretchX = 1 + 0.34 * pullRight;
  const rightTailStretchY = 1 - 0.1 * pullRight;

  // 1. Draw the actively pulling real silk tails
  paintPiece(
    draw,
    pieces.leftTail,
    604,
    328,
    leftTailAngle,
    leftTailPullX,
    leftTailPullY,
    leftTailStretchX,
    leftTailStretchY,
  );
  paintPiece(
    draw,
    pieces.rightTail,
    671,
    328,
    rightTailAngle,
    rightTailPullX,
    rightTailPullY,
    rightTailStretchX,
    rightTailStretchY,
  );

  // 2. Draw the 100% REAL photographed horizontal silk organza sashes (with knot gather & silk wave)
  paintRealSash(draw, pieces.leftSash, false, knotX, leftPart, knotPinch, releaseWave, time);
  paintRealSash(draw, pieces.rightSash, true, knotX, rightPart, knotPinch, -releaseWave, time);

  // 3. Draw both bow loops shrinking & pulling naturally through the center knot as tails pull them
  threadLoop(draw, pieces.leftLoop, pullLeft, knotX - 4, false);
  threadLoop(draw, pieces.rightLoop, pullRight, knotX + 4, true);

  // 4. Center knot cinches tight as tails pull, then unrolls & dissolves into the parting silk ribbons
  if (knotUnwrap < 0.98) {
    const knotAlpha = (1 - ease(knotUnwrap, 0.35, 0.96)) * exitFade;
    const knotScaleX = 1 - 0.16 * knotCinch + 0.55 * knotUnwrap;
    const knotScaleY = 1 - 0.12 * knotCinch - 0.48 * knotUnwrap;
    const knotTwist = -0.08 * knotCinch + 0.05 * knotUnwrap;
    draw.globalAlpha = knotAlpha;
    paintPiece(
      draw,
      pieces.knot,
      638,
      315,
      knotTwist,
      knotX - 638,
      4 * knotUnwrap,
      knotScaleX,
      knotScaleY,
    );
  }
  draw.globalAlpha = 1;
}

export default function OrganzaBow({ opening }) {
  const canvas = useRef(null);
  const openingStart = useRef(null);
  const [pieces, setPieces] = useState(null);

  useEffect(() => {
    const image = new Image();
    image.src = '/mauve-theme/silk-organza-bow.webp';
    let cancelled = false;

    image.decode().then(() => {
      if (!cancelled) setPieces(clipPieces(image));
    }).catch(() => {
      // Paper and veil can still open if the decorative image fails to load.
    });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    openingStart.current = opening ? performance.now() : null;
  }, [opening]);

  useEffect(() => {
    if (!pieces || !canvas.current) return undefined;
    const draw = canvas.current.getContext('2d');
    if (!draw) return undefined;
    if (!opening) {
      drawBow(draw, pieces, 0);
      return undefined;
    }

    const start = openingStart.current ?? performance.now();
    let frame;
    function paint(now) {
      const elapsed = now - start;
      drawBow(draw, pieces, Math.min(elapsed, finishTime));
      if (elapsed < finishTime) frame = requestAnimationFrame(paint);
    }
    paint(performance.now());
    return () => cancelAnimationFrame(frame);
  }, [opening, pieces]);

  return (
    <canvas
      ref={canvas}
      className={styles.bow}
      data-opening={opening}
      width={width}
      height={height}
      aria-hidden="true"
    />
  );
}
