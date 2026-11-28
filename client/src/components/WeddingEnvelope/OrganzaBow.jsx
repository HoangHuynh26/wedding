import React, { useEffect, useRef, useState } from 'react';
import { partingProgress } from './openingTiming';
import styles from './OrganzaBow.module.css';

const photoUrl = '/mauve-theme/silk-organza-bow.webp?v=4';
const width = 1280;
const height = 960;
const photoHeight = 714;
const waist = 312;
const knotX = 640;
const finishTime = 5070;

const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const mix = (a, b, t) => a + (b - a) * t;

function smooth(value, from, to) {
  const p = clamp((value - from) / (to - from));
  return p * p * (3 - 2 * p);
}

// C2-continuous quintic easing for natural zero-jerk cloth acceleration & deceleration
function quintic(value, from, to) {
  const p = clamp((value - from) / (to - from));
  return p * p * p * (p * (p * 6 - 15) + 10);
}

function cubic(a, b, c, d, t) {
  const s = 1 - t;
  return s * s * s * a + 3 * s * s * t * b + 3 * s * t * t * c + t * t * t * d;
}

// Generous anatomical Bezier hems calibrated outside the dark satin-stitched borders
// on the 1280 × 714 photograph so zero loops or V-cut tails are ever clipped.
const hems = {
  leftLoop: {
    top: [604, 272, 582, 162, 504, 108, 418, 106],
    bot: [600, 328, 506, 366, 372, 354, 340, 288],
    endCurve: -14,
  },
  rightLoop: {
    top: [672, 272, 696, 162, 774, 108, 854, 106],
    bot: [674, 328, 768, 366, 902, 354, 936, 289],
    endCurve: 14,
  },
  leftTail: {
    top: [598, 318, 484, 342, 364, 454, 248, 580],
    bot: [608, 348, 578, 454, 516, 558, 458, 616],
    endCurve: 3,
  },
  rightTail: {
    top: [674, 315, 802, 332, 924, 446, 1042, 570],
    bot: [668, 350, 700, 456, 772, 562, 834, 620],
    endCurve: -3,
  },
};

function silkPoint(hem, u, v) {
  const { top, bot, endCurve } = hem;
  const x0 = cubic(top[0], top[2], top[4], top[6], u);
  const y0 = cubic(top[1], top[3], top[5], top[7], u);
  const x1 = cubic(bot[0], bot[2], bot[4], bot[6], u);
  const y1 = cubic(bot[1], bot[3], bot[5], bot[7], u);
  return [
    mix(x0, x1, v) + endCurve * Math.pow(u, 2.4) * Math.sin(Math.PI * v),
    mix(y0, y1, v),
  ];
}

const vertex = (x, y, sx, sy, light = 1, alpha = 1) => [x, y, sx, sy, light, alpha];

function paintBow(painter, time) {
  painter.begin();

  // Before untying starts (0..1400ms), render the pure 1:1 studio photograph quad
  // and cross-blend smoothly (1400..1540ms) into the articulated silk mesh while still at rest.
  const meshBlend = smooth(time, 1400, 1540);
  if (meshBlend < 0.999) {
    const photoAlpha = 1 - meshBlend;
    painter.surface(1, 1, (u, v) =>
      vertex(u * width, v * photoHeight, u * width, v * photoHeight, 1, photoAlpha)
    );
    if (meshBlend <= 0.001) {
      painter.end();
      return;
    }
  }

  // Realistic 4-stage silk ribbon physics:
  // 1) pull (1480..2680ms): Both tails draw outward/downward as both loops cinch into the knot
  // 2) tighten (1500..2660ms): Center knot snugs slightly as loops slip through
  // 3) undo & drape (2480..3650ms): Center knot uncoils; freed ribbon ends drape downward under gravity
  // 4) partP (3750..5070ms): Ribbons sweep outward with OrganzaWrap, trailing in aerodynamic S-curves
  const pull = quintic(time, 1480, 2680);
  const tighten = Math.sin(smooth(time, 1500, 2660) * Math.PI);
  const undo = quintic(time, 2480, 3420);
  const drape = quintic(time, 2480, 3650);
  const partP = partingProgress(time);
  const travel = (width / 1.02) * 0.56 * partP;
  const speed = Math.sin(partP * Math.PI);

  for (const side of [-1, 1]) {
    const hingeX = knotX + side * (15 * undo + travel);
    const hingeY = waist + 11 * undo;

    // 1. Continuous horizontal silk sash curving smoothly downward at the gathered waist fold
    painter.surface(36, 14, (u, v) => {
      const fromEdge = (1 - u) * 305;
      const sx = side < 0 ? fromEdge : width - 1 - fromEdge;
      const sy = mix(244, 378, v);

      const outerX = knotX + side * (650 + travel * 0.15);
      const bendZone = (1 - smooth(u, 0, 0.25)) * undo;
      const cx = mix(hingeX, outerX, u) - side * 8 * bendZone * (1 - u);
      const cy =
        mix(hingeY, waist, smooth(u, 0, 0.28)) +
        (10 * undo + 7 * speed) * Math.sin(Math.PI * u) +
        14 * Math.pow(bendZone, 1.6);

      const elbowAng = -side * 0.86 * Math.pow(bendZone, 1.35);
      const halfH = mix(
        mix(25, 67, smooth(u, 0, 0.14)),
        mix(26, 67, smooth(u, 0, 0.22)),
        undo
      );
      const offset = (2 * v - 1) * halfH;
      const nx = -Math.sin(elbowAng) * offset;
      const ny = Math.cos(elbowAng) * offset;
      const shade = 1 - 0.08 * bendZone;
      return vertex(cx + nx, cy + ny, sx, sy, shade, meshBlend);
    });

    // 2. Flowing silk tail — draws outward during pull, then drapes downward under gravity with air-drag trail
    const tailHem = side > 0 ? hems.rightTail : hems.leftTail;
    painter.surface(34, 10, (u, v) => {
      const [sx, sy] = silkPoint(tailHem, u, v);
      const [bx, by] = silkPoint(tailHem, u, 0.5);
      const offX = sx - bx;
      const offY = sy - by;

      const rootX0 = knotX + side * 33;
      const rootY0 = 333;
      const anchorX = mix(rootX0, hingeX - side * 7, undo);
      const anchorY = mix(rootY0, hingeY + 7, undo);

      const restDx = bx - rootX0;
      const restDy = by - rootY0;

      const pullLen = 1 + 0.26 * pull;
      const pulledDx = restDx * pullLen + side * 16 * pull * u;
      const pulledDy = restDy * pullLen + 32 * pull * Math.pow(u, 1.3);

      const tailLen = 335;
      const hangDx =
        side * (34 * u + 18 * Math.pow(u, 1.8)) -
        side * speed * 124 * Math.pow(u, 1.4);
      const hangDy = tailLen * Math.pow(u, 0.96) - speed * 26 * Math.pow(u, 1.4);

      const dx = mix(pulledDx, hangDx, drape);
      const dy = mix(pulledDy, hangDy, drape);

      const restAng = Math.atan2(restDx, Math.max(1, restDy));
      const curAng = Math.atan2(dx + side * 4, Math.max(1, dy + 8));
      const dAng = (curAng - restAng) * drape;
      const ca = Math.cos(dAng);
      const sa = Math.sin(dAng);
      const widthScale = mix(1 - 0.1 * pull, 0.95 + 0.12 * u, drape);
      const rx = (offX * ca + offY * sa) * widthScale;
      const ry = (-offX * sa + offY * ca) * widthScale;

      const flutter = 8 * speed * Math.sin(u * 4.8 - time * 0.005) * Math.pow(u, 1.25);
      const rootFeather = mix(1, smooth(u, 0, 0.05), undo);
      const shade = 1 - 0.07 * undo * (1 - smooth(u, 0, 0.18));
      return vertex(
        anchorX + dx + rx + flutter,
        anchorY + dy + ry,
        sx,
        sy,
        shade,
        meshBlend * rootFeather
      );
    });
  }

  // 3. Left & right bow loops — contract radially & tilt down into the knot throat as tails pull
  if (pull < 0.998) {
    const loopAlpha = (1 - smooth(pull, 0.78, 0.995)) * meshBlend;
    for (const side of [-1, 1]) {
      const loopHem = side > 0 ? hems.rightLoop : hems.leftLoop;
      const tx = knotX + side * 22;
      const ty = waist + 2;
      const lenScale = Math.pow(1 - pull, 1.12);
      const rot = side * 0.28 * pull;
      const ca = Math.cos(rot);
      const sa = Math.sin(rot);

      painter.surface(32, 10, (u, v) => {
        const [sx, sy] = silkPoint(loopHem, u, v);
        const dx0 = (sx - tx) * lenScale;
        const dy0 = (sy - ty) * lenScale * (1 - 0.28 * pull);
        const px = tx + dx0 * ca - dy0 * sa;
        const py = ty + dx0 * sa + dy0 * ca;
        return vertex(px, py, sx, sy, 1 - 0.07 * pull * (1 - u), loopAlpha);
      });
    }
  }

  // 4. Center gathered silk knot — tightens snug around slipping loops, then loosens & uncoils
  if (undo < 0.995) {
    const knotAlpha = (1 - smooth(undo, 0.28, 0.96)) * meshBlend;
    const kxScale = (1 - 0.12 * tighten) * (1 + 0.38 * undo);
    const kyScale = (1 - 0.06 * tighten) * (1 - 0.26 * undo);

    painter.surface(18, 14, (u, v) => {
      const sx = 595 + 86 * u;
      const sy = 265 + 94 * v;
      const edgeU = Math.abs(u - 0.5) * 2;
      const edgeV = Math.abs(v - 0.5) * 2;
      const feather = (1 - smooth(edgeU, 0.76, 1)) * (1 - smooth(edgeV, 0.8, 1));
      const x = knotX + (sx - knotX) * kxScale;
      const y = waist + (sy - waist) * kyScale + 8 * undo;
      return vertex(x, y, sx, sy, 1 - 0.09 * tighten, knotAlpha * feather);
    });
  }

  painter.end();
}

function makeAtlas(image) {
  const atlas = document.createElement('canvas');
  atlas.width = image.naturalWidth;
  atlas.height = image.naturalHeight;
  const ctx = atlas.getContext('2d');
  ctx.drawImage(image, 0, 0);
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
    ['position', 2, 0],
    ['source', 2, 8],
    ['light', 1, 16],
    ['alpha', 1, 20],
  ];
  const program = gl.createProgram();
  const shaders = [
    [
      gl.VERTEX_SHADER,
      `
      attribute vec2 position, source;
      attribute float light, alpha;
      varying mediump vec2 uv;
      varying mediump float shade, vAlpha;
      void main() {
        uv = source / vec2(1280., 714.);
        shade = light;
        vAlpha = alpha;
        gl_Position = vec4(position.x / 640. - 1., 1. - position.y / 480., 0., 1.);
      }`,
    ],
    [
      gl.FRAGMENT_SHADER,
      `
      precision mediump float;
      uniform sampler2D photo;
      varying mediump vec2 uv;
      varying mediump float shade, vAlpha;
      void main() {
        vec4 silk = texture2D(photo, uv);
        gl_FragColor = vec4(silk.rgb * shade * vAlpha, silk.a * vAlpha);
      }`,
    ],
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
    gl.vertexAttribPointer(id, size, gl.FLOAT, false, 24, offset);
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

  const vertices = new Float32Array(2800 * 6 * 6);
  let offset = 0;
  const triangle = (a, b, c) => {
    vertices.set(a, offset);
    vertices.set(b, offset + 6);
    vertices.set(c, offset + 12);
    offset += 18;
  };
  return {
    begin() {
      offset = 0;
      gl.clear(gl.COLOR_BUFFER_BIT);
    },
    surface(columns, rows, point) {
      triangleGrid(columns, rows, point, triangle);
    },
    end() {
      gl.bufferData(gl.ARRAY_BUFFER, vertices.subarray(0, offset), gl.DYNAMIC_DRAW);
      gl.drawArrays(gl.TRIANGLES, 0, offset / 6);
    },
    dispose() {
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    },
  };
}

// Canvas2D fallback for devices without WebGL
function cpuPainter(output, atlas) {
  const surface = document.createElement('canvas');
  const lighting = document.createElement('canvas');
  surface.width = lighting.width = width;
  surface.height = lighting.height = height;
  const ctx = surface.getContext('2d');
  const shade = lighting.getContext('2d');
  let minX, minY, maxX, maxY, pieceAlpha;
  function path(context, a, b, c) {
    context.beginPath();
    context.moveTo(a[0], a[1]);
    context.lineTo(b[0], b[1]);
    context.lineTo(c[0], c[1]);
    context.closePath();
  }
  function triangle(a, b, c) {
    const alpha = (a[5] + b[5] + c[5]) / 3;
    if (alpha < 0.01) return;
    pieceAlpha += alpha;
    const su = b[2] - a[2],
      sv = b[3] - a[3],
      tu = c[2] - a[2],
      tv = c[3] - a[3];
    const det = su * tv - tu * sv;
    if (Math.abs(det) < 0.001) return;
    const bx = b[0] - a[0],
      by = b[1] - a[1],
      cx = c[0] - a[0],
      cy = c[1] - a[1];
    const xx = (bx * tv - cx * sv) / det,
      xy = (cx * su - bx * tu) / det;
    const yx = (by * tv - cy * sv) / det,
      yy = (cy * su - by * tu) / det;
    const sx = Math.max(0, Math.floor(Math.min(a[2], b[2], c[2])) - 1);
    const sy = Math.max(0, Math.floor(Math.min(a[3], b[3], c[3])) - 1);
    const w = Math.ceil(Math.max(a[2], b[2], c[2])) + 1 - sx;
    const h = Math.ceil(Math.max(a[3], b[3], c[3])) + 1 - sy;
    minX = Math.min(minX, a[0], b[0], c[0]);
    minY = Math.min(minY, a[1], b[1], c[1]);
    maxX = Math.max(maxX, a[0], b[0], c[0]);
    maxY = Math.max(maxY, a[1], b[1], c[1]);
    ctx.save();
    ctx.globalAlpha = alpha;
    path(ctx, a, b, c);
    ctx.clip();
    ctx.transform(xx, yx, xy, yy, a[0] - xx * a[2] - xy * a[3], a[1] - yx * a[2] - yy * a[3]);
    ctx.drawImage(atlas, sx, sy, w, h, sx, sy, w, h);
    ctx.restore();
    const light = (a[4] + b[4] + c[4]) / 3;
    if (Math.abs(light - 1) < 0.012) return;
    shade.fillStyle = light < 1 ? '#000' : '#fff';
    shade.globalAlpha = light < 1 ? 1 - light : Math.min(1, (light - 1) * 3);
    path(shade, a, b, c);
    shade.fill();
  }
  return {
    begin() {
      output.clearRect(0, 0, width, height);
    },
    surface(columns, rows, point) {
      minX = width;
      minY = height;
      maxX = maxY = 0;
      pieceAlpha = 0;
      ctx.globalCompositeOperation = shade.globalCompositeOperation = 'lighter';
      triangleGrid(Math.max(1, Math.ceil(columns / 2)), Math.max(1, Math.ceil(rows / 2)), point, triangle);
      if (pieceAlpha <= 0) return;
      const x = Math.max(0, Math.floor(minX) - 1),
        y = Math.max(0, Math.floor(minY) - 1);
      const w = Math.min(width, Math.ceil(maxX) + 1) - x,
        h = Math.min(height, Math.ceil(maxY) + 1) - y;
      if (w <= 0 || h <= 0) return;
      ctx.globalCompositeOperation = 'source-atop';
      ctx.drawImage(lighting, x, y, w, h, x, y, w, h);
      output.drawImage(surface, x, y, w, h, x, y, w, h);
      ctx.clearRect(x, y, w, h);
      shade.clearRect(x, y, w, h);
    },
    end() {},
    dispose() {},
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
      const visibleTime = time < 1400 ? 0 : time;
      if (visibleTime !== lastTime) paintBow(painter, visibleTime);
      lastTime = visibleTime;
      if (fallback.current) fallback.current.hidden = true;
      if (start.current !== null && time < 1400) {
        wake = window.setTimeout(refresh, 1400 - time);
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
      const gl =
        !useCpu && element.getContext('webgl', { alpha: true, antialias: true, depth: false });
      const ctx = !gl && element.getContext('2d');
      painter = gl ? gpuPainter(gl, atlas) : ctx && cpuPainter(ctx, atlas);
      if (gl && !painter) {
        switchToCanvas();
        return;
      }
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
      <img
        ref={fallback}
        className={styles.photo}
        data-opening={opening}
        src={photoUrl}
        alt=""
        aria-hidden="true"
      />
      <canvas
        key={useCpu ? '2d' : 'webgl'}
        ref={canvas}
        className={styles.bow}
        data-opening={opening}
        width={width}
        height={height}
        aria-hidden="true"
      />
    </>
  );
}
