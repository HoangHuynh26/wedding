import React, { useEffect, useRef, useState } from 'react';
import { partingProgress } from './openingTiming';
import styles from './OrganzaBow.module.css';

const photoUrl = '/mauve-theme/silk-organza-bow.webp';
const width = 1280;
const height = 960;
const waist = 312;
const knotX = 640;
const finishTime = 5070;
const clamp = (v) => Math.max(0, Math.min(1, v));
const mix = (a, b, t) => a + (b - a) * t;

function ease(value, from, to) {
  const p = clamp((value - from) / (to - from));
  return p * p * (3 - 2 * p);
}

function cubic(a, b, c, d, t) {
  const s = 1 - t;
  return s * s * s * a + 3 * s * s * t * b + 3 * s * t * t * c + t * t * t * d;
}

// Upper and lower stitched hems, measured on the original 1280px photograph.
// u follows the length of the silk. v goes from one hem to the opposite hem.
const hems = {
  leftLoop: [[603,274,578,178,501,122,423,109], [601,327,513,362,379,347,344,291]],
  rightLoop: [[674,275,699,179,774,125,850,109], [673,327,762,362,899,351,933,290]],
  leftTail: [[600,322,508,363,373,496,258,578], [606,346,574,444,511,552,456,613]],
  rightTail: [[670,318,802,365,920,499,1035,567], [670,348,706,446,778,556,837,617]],
};

function silkPoint(hem, u, v, endCurve = 0) {
  const [a, b] = hem;
  const edge = (c, i) => cubic(c[i], c[i + 2], c[i + 4], c[i + 6], u);
  return [
    mix(edge(a, 0), edge(b, 0), v) + endCurve * u ** 3 * Math.sin(Math.PI * v),
    mix(edge(a, 1), edge(b, 1), v),
  ];
}

const vertex = (x, y, source, light = 1) => [x, y, source[0], source[1], light];

function paintBow(painter, time) {
  const tug = ease(time, 1630, 2450);
  const feed = ease(time, 2010, 3050);
  const drop = ease(time, 2730, 3450);
  const unwrap = ease(time, 2760, 3690);
  const leftSettle = ease(time, 2940, 3680);
  const rightSettle = ease(time, 2940, 3750);
  // Canvas spans 102% of the folio. Both cloth layers use the same folio-space distance.
  const travel = (width / 1.02) * 0.56 * partingProgress(time);
  painter.begin();

  function band(side) {
    const release = side < 0 ? leftSettle : rightSettle;
    painter.surface(34, 20, (u, v) => {
      // A reflected run of the unobscured photographed band extends the silk behind the bow.
      const fromEdge = (1 - u) * 640;
      const sample = 318 - Math.abs(318 - (fromEdge % 636));
      const sx = side < 0 ? sample : width - 1 - sample;
      const ridge = (v * 3.45 + .17 * Math.sin(Math.PI * u) + (side < 0 ? .23 : 0)) * 2 * Math.PI;
      const fold = Math.sin(ridge);
      const cross = v + release * .036 * fold * Math.sin(v * Math.PI);
      const sy = mix(245 + 4 * sample / 318, 376 - 2 * sample / 318, cross);
      const half = mix(13 + 51 * ease(u, 0, .46), (side < 0 ? 92 : 86) * (1 - (1 - u) ** 1.65), release);
      const crease = release * Math.sin(Math.PI * u);
      const y = waist + (2 * v - 1) * half
        + crease * (6 * fold + side * 7);
      const reflection = Math.cos(ridge);
      return vertex(knotX + side * (u * 642 + travel), y, [sx, sy],
        1 + release * (.12 - .36 * Math.max(0, reflection) ** 2 - .04 * (1 - u)));
    });
  }

  function tail(side) {
    const isRight = side > 0;
    const hem = isRight ? hems.rightTail : hems.leftTail;
    const settle = isRight ? rightSettle : leftSettle;
    const paidOut = isRight ? .28 * feed : 0;
    painter.surface(34, 5, (u, v) => {
      // Keep the weave running in one direction as material feeds down from the knot.
      const grain = u / (1 + 2.6 * paidOut * (1 - u));
      const source = silkPoint(hem, grain, v);
      const [x, y] = silkPoint(hem, u, v);
      const mid = silkPoint(hem, u, .5);
      const rx = 670;
      const ry = 332;
      const angle = isRight ? (.22 + .19 * u) * tug : 0;
      const dx = x - rx;
      const dy = y - ry;
      const rootX = mix(hem[0][0], hem[1][0], v) - rx;
      const rootY = mix(hem[0][1], hem[1][1], v) - ry;
      const rootAngle = isRight ? .22 * tug : 0;
      const gather = ease(time, 1660, 2350) * (1 - u) ** 3;
      const neckX = rx + rootX * Math.cos(rootAngle) - rootY * Math.sin(rootAngle);
      const neckY = ry + rootX * Math.sin(rootAngle) + rootY * Math.cos(rootAngle);
      const drawnX = rx + dx * Math.cos(angle) - dy * Math.sin(angle) + 35 * paidOut * u + (knotX - neckX) * gather;
      const drawnY = ry + dx * Math.sin(angle) + dy * Math.cos(angle) + 410 * paidOut * u + (waist - neckY) * gather;
      // The free ends sweep in arcs and settle as folds on their respective bands.
      const local = ease(settle, .13 * u, 1);
      const sweep = Math.sin(local * Math.PI) * u;
      const foldWidth = (isRight ? 29 : 34) * (1 - (1 - u) ** 2);
      const laidX = knotX + side * (u * (isRight ? 700 : 684) + (v - .5) * 75 * u);
      const laidY = waist + (v - .5) * foldWidth + u * 9 - 9 * Math.sin(u * Math.PI);
      return vertex(
        mix(drawnX, laidX, local) + side * (travel + sweep * 50),
        mix(drawnY, laidY, local) + sweep * (isRight ? 58 : 76),
        source, 1 + .047 * sweep * ((y - mid[1]) / 80),
      );
    });
  }

  function loop(side) {
    const isRight = side > 0;
    if (isRight && feed === 1) return;
    const hem = isRight ? hems.rightLoop : hems.leftLoop;
    const endCurve = side * 6;
    painter.surface(30, 6, (u, v) => {
      if (isRight) {
        const available = 1 - feed;
        const source = silkPoint(hem, feed + available * u, v, endCurve);
        const [x, y] = silkPoint(hem, available * u, v, endCurve);
        const takeup = Math.sin(feed * Math.PI);
        const throat = ease(feed, .65, 1);
        return vertex(
          mix(x, 659, throat), mix(y, waist + 1, throat) + takeup * u * 25,
          source, 1 - .055 * takeup * (1 - u),
        );
      }
      const source = silkPoint(hem, u, v, endCurve);
      const center = silkPoint(hem, u, .5, endCurve);
      // Once the wrap opens, gravity turns over the last bight. Its outer fold
      // drops below the waist before its two plies settle lengthwise on the left sash.
      const roll = ease(drop, .14 * u, 1);
      const turn = Math.sin(roll * Math.PI);
      const loft = (1 - roll) * (1 - .22 * turn);
      const laidX = knotX - 661 * u + (v - .5) * 42 * u;
      const laidY = waist - 12 * Math.sin(Math.PI * u) + 4 * u;
      return vertex(
        mix(center[0], laidX, roll) + (source[0] - center[0]) * loft - travel,
        mix(center[1], laidY, roll) + (source[1] - center[1]) * loft
          + 197 * turn * u ** 1.45 + 27 * Math.sin(2 * Math.PI * (u - .24)) * turn * u
          + (v - .5) * 25 * u * roll,
        source, 1 - .14 * turn * u * (1 - v),
      );
    });
  }

  band(-1);
  band(1);
  tail(-1);
  tail(1);
  loop(-1);
  loop(1);

  if (time < 3750) {
    // The rolled wrap peels from the left across the waist, turns edge-on and
    // slips below the right pleat. Its contact point stays at the waist during the tug.
    const tuck = ease(time, 3370, 3750);
    painter.surface(18, 6, (u, v) => {
      const x = 592 + 91 * u;
      const y = 262 + 99 * v;
      const wave = Math.sin(Math.PI * unwrap);
      const radius = (1 - .12 * feed) * (1 - tuck);
      const unfoldedX = knotX + 185 * u;
      const unfoldedY = waist + 9 * Math.sin(Math.PI * u) - 7 * u;
      return vertex(
        mix(x, unfoldedX, unwrap) + (v - .5) * 29 * wave,
        mix(waist + (y - waist) * radius, unfoldedY + (v - .5) * 20 * radius, unwrap)
          - wave * 17 * Math.sin(Math.PI * u),
        [1 + 91 * u, 1 + 99 * v], 1 + .075 * wave * Math.cos(u * 2 * Math.PI),
      );
    });
  }
  painter.end();
}

// The atlas keeps the original photograph's translucent mesh, highlights and seams.
// Its upper-left corner has room for the isolated winding of silk at the center.
function makeAtlas(image) {
  const atlas = document.createElement('canvas');
  atlas.width = image.naturalWidth;
  atlas.height = image.naturalHeight;
  const ctx = atlas.getContext('2d');
  ctx.drawImage(image, 0, 0);
  ctx.clearRect(0, 0, 95, 102);
  ctx.save();
  ctx.translate(1 - 592, 1 - 262);
  ctx.clip(new Path2D('M604 269 C620 273 623 260 639 267 C654 272 676 265 679 287 C682 306 680 337 670 348 C657 360 640 345 628 353 C613 365 597 350 597 335 C594 314 594 282 604 269 Z'));
  ctx.drawImage(image, 0, 0);
  ctx.restore();
  return atlas;
}

function triangleGrid(columns, rows, point, triangle) {
  let upper = Array.from({ length: columns + 1 }, (_, i) => point(i / columns, 0));
  for (let j = 1; j <= rows; j++) {
    const lower = Array.from({ length: columns + 1 }, (_, i) => point(i / columns, j / rows));
    for (let i = 0; i < columns; i++) {
      triangle(upper[i], upper[i + 1], lower[i]);
      triangle(lower[i], upper[i + 1], lower[i + 1]);
    }
    upper = lower;
  }
}

function gpuPainter(gl, atlas) {
  const attributes = [
    ['position', 2, 0], ['source', 2, 8], ['light', 1, 16],
  ];
  const program = gl.createProgram();
  const shaders = [
    [gl.VERTEX_SHADER, `
      attribute vec2 position, source;
      attribute float light;
      varying mediump vec2 uv;
      varying mediump float shade;
      void main() {
        uv = source / vec2(1280., 714.);
        shade = light;
        gl_Position = vec4(position.x / 640. - 1., 1. - position.y / 480., 0., 1.);
      }`],
    [gl.FRAGMENT_SHADER, `
      precision mediump float;
      uniform sampler2D photo;
      varying mediump vec2 uv;
      varying mediump float shade;
      void main() {
        vec4 silk = texture2D(photo, uv);
        gl_FragColor = vec4(silk.rgb * shade, silk.a);
      }`],
  ].map(([type, code]) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, code);
    gl.compileShader(shader);
    gl.attachShader(program, shader);
    return shader;
  });
  gl.linkProgram(program);
  shaders.forEach((shader) => gl.deleteShader(shader));
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  attributes.forEach(([name, size, offset]) => {
    const id = gl.getAttribLocation(program, name);
    gl.enableVertexAttribArray(id);
    gl.vertexAttribPointer(id, size, gl.FLOAT, false, 20, offset);
  });
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  // Seven surfaces, 2,168 cells at most, six vertices per cell and five floats per vertex.
  const vertices = new Float32Array(2168 * 6 * 5);
  let offset = 0;
  const triangle = (a, b, c) => {
    vertices.set(a, offset); vertices.set(b, offset + 5); vertices.set(c, offset + 10);
    offset += 15;
  };
  return {
    begin() { offset = 0; gl.clear(gl.COLOR_BUFFER_BIT); },
    surface(columns, rows, point) { triangleGrid(columns, rows, point, triangle); },
    end() {
      gl.bufferData(gl.ARRAY_BUFFER, vertices.subarray(0, offset), gl.DYNAMIC_DRAW);
      gl.drawArrays(gl.TRIANGLES, 0, offset / 5);
    },
    dispose() { gl.deleteTexture(texture); gl.deleteBuffer(buffer); gl.deleteProgram(program); },
  };
}

// Canvas2D uses the same moving hems on devices without a WebGL context.
function cpuPainter(output, atlas) {
  const surface = document.createElement('canvas');
  const lighting = document.createElement('canvas');
  surface.width = lighting.width = width;
  surface.height = lighting.height = height;
  const ctx = surface.getContext('2d');
  const shade = lighting.getContext('2d');
  let minX, minY, maxX, maxY;
  function path(context, a, b, c) {
    context.beginPath(); context.moveTo(a[0], a[1]); context.lineTo(b[0], b[1]);
    context.lineTo(c[0], c[1]); context.closePath();
  }
  function triangle(a, b, c) {
    const su = b[2] - a[2], sv = b[3] - a[3], tu = c[2] - a[2], tv = c[3] - a[3];
    const det = su * tv - tu * sv;
    if (Math.abs(det) < .001) return;
    const bx = b[0] - a[0], by = b[1] - a[1], cx = c[0] - a[0], cy = c[1] - a[1];
    const xx = (bx * tv - cx * sv) / det, xy = (cx * su - bx * tu) / det;
    const yx = (by * tv - cy * sv) / det, yy = (cy * su - by * tu) / det;
    const sx = Math.max(0, Math.floor(Math.min(a[2], b[2], c[2])) - 1);
    const sy = Math.max(0, Math.floor(Math.min(a[3], b[3], c[3])) - 1);
    const w = Math.ceil(Math.max(a[2], b[2], c[2])) + 1 - sx;
    const h = Math.ceil(Math.max(a[3], b[3], c[3])) + 1 - sy;
    minX = Math.min(minX, a[0], b[0], c[0]); minY = Math.min(minY, a[1], b[1], c[1]);
    maxX = Math.max(maxX, a[0], b[0], c[0]); maxY = Math.max(maxY, a[1], b[1], c[1]);
    ctx.save();
    path(ctx, a, b, c); ctx.clip();
    ctx.transform(xx, yx, xy, yy, a[0] - xx * a[2] - xy * a[3], a[1] - yx * a[2] - yy * a[3]);
    ctx.drawImage(atlas, sx, sy, w, h, sx, sy, w, h);
    ctx.restore();
    const light = (a[4] + b[4] + c[4]) / 3;
    if (Math.abs(light - 1) < .012) return;
    shade.fillStyle = light < 1 ? '#000' : '#fff';
    shade.globalAlpha = light < 1 ? 1 - light : Math.min(1, (light - 1) * 3);
    path(shade, a, b, c); shade.fill();
  }
  return {
    begin() { output.clearRect(0, 0, width, height); },
    surface(columns, rows, point) {
      minX = width; minY = height; maxX = maxY = 0;
      // Adjacent triangle edges have complementary coverage. Adding premultiplied color
      // within each continuous piece prevents a transparent hairline along the diagonal.
      ctx.globalCompositeOperation = shade.globalCompositeOperation = 'lighter';
      triangleGrid(Math.ceil(columns / 2), Math.ceil(rows / 2), point, triangle);
      const x = Math.max(0, Math.floor(minX) - 1), y = Math.max(0, Math.floor(minY) - 1);
      const w = Math.min(width, Math.ceil(maxX) + 1) - x, h = Math.min(height, Math.ceil(maxY) + 1) - y;
      if (w <= 0 || h <= 0) return;
      ctx.globalCompositeOperation = 'source-atop';
      ctx.drawImage(lighting, x, y, w, h, x, y, w, h);
      output.drawImage(surface, x, y, w, h, x, y, w, h);
      ctx.clearRect(x, y, w, h); shade.clearRect(x, y, w, h);
    },
    end() {}, dispose() {},
  };
}

export default function OrganzaBow({ opening }) {
  const [useCpu, setUseCpu] = useState(false);
  const canvas = useRef(null);
  const fallback = useRef(null);
  const animation = useRef(null);
  const start = useRef(null);
  useEffect(() => {
    const element = canvas.current;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let disposed = false;
    let frame;
    let wake;
    let lastTime;
    let painter;
    const run = (now) => {
      cancelAnimationFrame(frame);
      clearTimeout(wake);
      if (!painter || disposed) return;
      const elapsed = start.current === null ? 0 : now - start.current;
      const time = motion.matches && start.current !== null ? finishTime : elapsed;
      const visibleTime = time < 1630 ? 0 : time;
      if (visibleTime !== lastTime) paintBow(painter, visibleTime);
      lastTime = visibleTime;
      if (fallback.current) fallback.current.hidden = true;
      if (start.current !== null && time < 1630) {
        wake = window.setTimeout(refresh, 1630 - time);
      } else if (start.current !== null && time < finishTime) {
        frame = requestAnimationFrame(run);
      }
    };
    const refresh = () => run(performance.now());
    animation.current = refresh;
    motion.addEventListener('change', refresh);
    const image = new Image();
    const switchToCanvas = () => setUseCpu(true);
    element.addEventListener('webglcontextlost', switchToCanvas);
    image.onload = () => {
      if (disposed) return;
      const atlas = makeAtlas(image);
      const gl = !useCpu && element.getContext('webgl', { alpha: true, antialias: true, depth: false });
      const ctx = !gl && element.getContext('2d');
      painter = gl ? gpuPainter(gl, atlas) : ctx && cpuPainter(ctx, atlas);
      if (gl && !painter) { switchToCanvas(); return; }
      refresh();
    };
    image.src = photoUrl;
    return () => {
      disposed = true;
      animation.current = null;
      image.onload = null;
      element.removeEventListener('webglcontextlost', switchToCanvas);
      motion.removeEventListener('change', refresh);
      cancelAnimationFrame(frame);
      clearTimeout(wake);
      painter?.dispose();
    };
  }, [useCpu]);
  useEffect(() => {
    start.current = opening ? performance.now() : null;
    animation.current?.();
  }, [opening]);

  return (
    <>
      <img ref={fallback} className={styles.photo} data-opening={opening} src={photoUrl} alt="" aria-hidden="true" />
      <canvas key={useCpu ? '2d' : 'webgl'} ref={canvas} className={styles.bow} data-opening={opening} width={width} height={height} aria-hidden="true" />
    </>
  );
}
