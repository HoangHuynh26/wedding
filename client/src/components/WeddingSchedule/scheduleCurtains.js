export const schedulePaper = '/mauve-theme/schedule-paper.webp';
export const scheduleVelvet = '/mauve-theme/schedule-velvet.webp';

const rows = 64;
const outerFold = 0.42;

function sampleHems(image) {
  const sample = document.createElement('canvas');
  sample.width = image.naturalWidth;
  sample.height = rows + 1;
  const context = sample.getContext('2d', { willReadFrequently: true });
  context.drawImage(image, 0, 0, sample.width, sample.height);
  const { data } = context.getImageData(0, 0, sample.width, sample.height);
  const half = sample.width / 2;

  return [false, true].map(right => {
    const edges = Array.from({ length: rows + 1 }, (_, row) => {
      const offset = row * sample.width;
      for (let distance = half - 1; distance >= 0; distance--) {
        const x = right ? sample.width - 1 - distance : distance;
        if (data[(offset + x) * 4 + 3] >= 96) return (distance + 1) / half;
      }
      return 0;
    });
    return edges.map((edge, row) =>
      (edges[Math.max(0, row - 1)] + 2 * edge + edges[Math.min(rows, row + 1)]) / 4,
    );
  });
}

function gather(progress, row, right) {
  const curve = progress * progress * (3 - 2 * progress);
  const lowerHemLag = Math.abs(row / rows - 0.51);
  return curve + curve * (1 - curve) * (0.46 - 1.05 * lowerHemLag - (right ? 0.08 : 0));
}

function createGlRenderer(gl, image, hems) {
  const shaders = [
    [gl.VERTEX_SHADER, `
      attribute vec2 aPosition;
      attribute vec2 aUv;
      varying highp vec2 vUv;
      void main() {
        vUv = aUv;
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `],
    [gl.FRAGMENT_SHADER, `
      precision mediump float;
      uniform sampler2D uVelvet;
      varying highp vec2 vUv;
      void main() {
        gl_FragColor = texture2D(uVelvet, vUv);
      }
    `],
  ];

  const program = gl.createProgram();
  for (const [type, source] of shaders) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    gl.attachShader(program, shader);
    gl.deleteShader(shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }

  const buffer = gl.createBuffer();
  const texture = gl.createTexture();
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

  for (const [name, offset] of [['aPosition', 0], ['aUv', 8]]) {
    const index = gl.getAttribLocation(program, name);
    gl.enableVertexAttribArray(index);
    gl.vertexAttribPointer(index, 2, gl.FLOAT, false, 16, offset);
  }

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  const vertices = new Float32Array(2 * rows * 2 * 6 * 4);
  const grid = new Float32Array((rows + 1) * 12);
  let cursor = 0;

  function addVertex(index) {
    vertices[cursor++] = grid[index];
    vertices[cursor++] = grid[index + 1];
    vertices[cursor++] = grid[index + 2];
    vertices[cursor++] = grid[index + 3];
  }

  return {
    draw(width, height, panelWidth, progress) {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      cursor = 0;

      for (let side = 0; side < 2; side++) {
        const right = side === 1;
        const direction = right ? -1 : 1;
        const anchor = right ? 1 : -1;
        const textureOrigin = right ? 1 : 0;

        for (let row = 0; row <= rows; row++) {
          const edge = hems[side][row];
          const split = edge * outerFold;
          // Gather the outer folds while the inner hem and tassels move as one.
          const extension = (width / 2 + 1.2 - panelWidth * edge) * (1 - gather(progress, row, right));
          const y = 1 - 2 * row / rows;
          const v = row / rows;
          grid.set([
            anchor, y, textureOrigin, v,
            anchor + direction * 2 * (split * panelWidth + extension) / width, y,
            textureOrigin + direction * split / 2, v,
            anchor + direction * 2 * (panelWidth + extension) / width, y, 0.5, v,
          ], row * 12);
        }

        for (let row = 0; row < rows; row++) {
          for (let strip = 0; strip < 2; strip++) {
            const top = row * 12 + strip * 4;
            const bottom = top + 12;
            addVertex(top);
            addVertex(top + 4);
            addVertex(bottom);
            addVertex(bottom);
            addVertex(top + 4);
            addVertex(bottom + 4);
          }
        }
      }

      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
      gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 4);
    },
    dispose() {
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    },
  };
}

function create2DRenderer(context, image, hems) {
  const half = image.naturalWidth / 2;
  const sourceSlice = image.naturalHeight / rows;

  return {
    draw(width, height, panelWidth, progress) {
      const { canvas } = context;
      context.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
      context.clearRect(0, 0, width, height);
      const slice = height / rows;

      for (let row = 0; row < rows; row++) {
        const sourceY = sourceSlice * row;
        const y = slice * row;
        for (let side = 0; side < 2; side++) {
          const right = side === 1;
          const edge = (hems[side][row] + hems[side][row + 1]) / 2;
          const split = edge * outerFold;
          const extension = (width / 2 + 1.2 - panelWidth * edge) * (1 - gather(progress, row + 0.5, right));
          const outerWidth = panelWidth * split + extension;
          const innerWidth = panelWidth * (1 - split);
          const outerX = right ? width - outerWidth : 0;
          const innerX = right ? outerX - innerWidth : outerWidth;
          const outerSrc = right ? image.naturalWidth - half * split : 0;
          const innerSrc = right ? half : half * split;
          // Overlap vertical slices by less than a pixel to cover raster rounding.
          context.drawImage(image, outerSrc, sourceY, half * split, sourceSlice, outerX, y, outerWidth, slice + 0.4);
          context.drawImage(image, innerSrc, sourceY, half * (1 - split), sourceSlice, innerX, y, innerWidth, slice + 0.4);
        }
      }
    },
    dispose() {},
  };
}

export function createScheduleCurtains(canvas, image) {
  const hems = sampleHems(image);
  const gl = canvas.getContext('webgl', { alpha: true, depth: false, powerPreference: 'low-power' });
  if (gl) return createGlRenderer(gl, image, hems);
  const context = canvas.getContext('2d');
  return context ? create2DRenderer(context, image, hems) : null;
}
