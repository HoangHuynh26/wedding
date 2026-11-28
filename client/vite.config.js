import { pbkdf2Sync } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Generates static Groom-first index.html files for /chu-re, /nha-trai, and /groom
 * so social crawlers (Zalo, Messenger, Facebook, iMessage, Telegram) always display
 * Groom's name first & 24.01.2027 even on static-only deployments (e.g. Netlify Drop).
 */
function sideSpecificOgHtmlPlugin() {
  return {
    name: 'side-specific-og-html',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const indexPath = path.join(distDir, 'index.html');
      if (!fs.existsSync(indexPath)) return;

      const baseHtml = fs.readFileSync(indexPath, 'utf-8');
      const groomTitle = 'Lễ Thành Hôn | Trần Lê Đình Huy &amp; Nguyễn Thị Thu Hiền • 24.01.2027';
      const groomOgTitle = 'Trần Lê Đình Huy &amp; Nguyễn Thị Thu Hiền — Thiệp Mời Lễ Thành Hôn';
      const groomDesc =
        'Trân trọng kính mời Quý Khách đến dự tiệc mừng Lễ Thành Hôn của Đình Huy &amp; Thu Hiền — 17:30 PM Chủ Nhật, 24.01.2027 tại Nhà Hàng White Palace.';

      const groomHtml = baseHtml
        .replace(/<title>[\s\S]*?<\/title>/i, `<title>${groomTitle}</title>`)
        .replace(
          /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
          `<meta name="description" content="${groomDesc}" />`
        )
        .replace(
          /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
          `<meta property="og:title" content="${groomOgTitle}" />`
        )
        .replace(
          /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
          `<meta property="og:description" content="${groomDesc}" />`
        )
        .replace(
          /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
          `<meta name="twitter:title" content="${groomOgTitle}" />`
        )
        .replace(
          /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
          `<meta name="twitter:description" content="${groomDesc}" />`
        );

      for (const routeDir of ['chu-re', 'nha-trai', 'groom']) {
        const outDir = path.join(distDir, routeDir);
        fs.mkdirSync(outDir, { recursive: true });
        fs.writeFileSync(path.join(outDir, 'index.html'), groomHtml, 'utf-8');
      }
    },
  };
}

function createAdminPinVerifier(mode) {
  const pin = process.env.ADMIN_PIN ?? loadEnv(mode, __dirname, 'ADMIN_PIN').ADMIN_PIN;
  if (!pin || !/^[0-9]+$/.test(pin)) return null;

  const salt = 'wedding-admin-pin-v1';
  const iterations = 210_000;
  return {
    digits: pin.length,
    salt,
    iterations,
    fingerprint: pbkdf2Sync(pin, salt, iterations, 32, 'sha256').toString('hex'),
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), sideSpecificOgHtmlPlugin()],
  define: {
    __ADMIN_PIN_VERIFIER__: JSON.stringify(createAdminPinVerifier(mode)),
  },
  server: {
    port: 5173,
    host: true,
    allowedHosts: [
      'corps-dvds-gratuit-automobiles.trycloudflare.com',
      '.trycloudflare.com',
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    host: true,
    allowedHosts: [
      'corps-dvds-gratuit-automobiles.trycloudflare.com',
      '.trycloudflare.com',
    ],
  },
}));
