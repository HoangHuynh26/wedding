/**
 * Netlify Edge Function: Dynamic Side-Aware & Language-Aware Open Graph Meta Tags
 * Ensures Zalo, Facebook, Messenger, iMessage, Telegram, and WhatsApp link previews show:
 *  - Bride's invitation (/): Bride's name FIRST, Groom's name SECOND (17.01.2027)
 *  - Groom's invitation (/chu-re, /nha-trai, /groom, ?side=groom): Groom's name FIRST, Bride's name SECOND (24.01.2027)
 *  - Localized in Vietnamese (vi), English (en), or Chinese (zh), with optional guest personalization (?to=... / ?to64=...)
 */

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function decodeBase64UrlUtf8(b64url = '') {
  try {
    const pad = '='.repeat((4 - (b64url.length % 4)) % 4);
    const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/') + pad;
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return '';
  }
}

export default async (request, context) => {
  try {
    const url = new URL(request.url);
    const pathname = url.pathname.toLowerCase();

    // Skip static assets and API endpoints
    if (
      /\.[a-z0-9]{2,6}$/i.test(pathname) ||
      pathname.startsWith('/assets/') ||
      pathname.startsWith('/audio/') ||
      pathname.startsWith('/photos/') ||
      pathname.startsWith('/mauve-theme/') ||
      pathname.startsWith('/flowers/') ||
      pathname.startsWith('/videos/') ||
      pathname.startsWith('/api/') ||
      pathname.startsWith('/.netlify/')
    ) {
      return context.next();
    }

    const response = await context.next();
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      return response;
    }

    const params = url.searchParams;
    const rawSide = (params.get('side') || '').trim().toLowerCase();
    const rawFrom = (params.get('from') || '').trim().toLowerCase();
    const isGroomSide =
      /^\/(chu-re|nha-trai|groom)(\/|$)/.test(pathname) ||
      /^\/admin\/(chu-re|nha-trai|groom)(\/|$)/.test(pathname) ||
      rawSide === 'groom' ||
      rawSide === 'chu-re' ||
      rawSide === 'nha-trai' ||
      rawFrom === 'chu-re' ||
      rawFrom === 'nha-trai' ||
      rawFrom === 'huy-hien';

    const rawLang = (
      params.get('lang') ||
      params.get('language') ||
      params.get('locale') ||
      ''
    )
      .trim()
      .toLowerCase();

    let lang = 'vi';
    if (rawLang === 'en' || rawLang === 'english' || rawLang === 'eng') {
      lang = 'en';
    } else if (rawLang === 'zh' || rawLang === 'cn' || rawLang.startsWith('zh-') || rawLang === 'chinese') {
      lang = 'zh';
    }

    const to64 = params.get('to64') || '';
    const guestRaw = (
      (to64 ? decodeBase64UrlUtf8(to64) : '') ||
      params.get('to') ||
      params.get('guest') ||
      params.get('name') ||
      ''
    ).trim();

    let htmlLang = 'vi';
    let pageTitle = '';
    let ogTitle = '';
    let ogDesc = '';

    if (lang === 'en') {
      htmlLang = 'en';
      if (isGroomSide) {
        pageTitle = 'Wedding Celebration | Tran Le Dinh Huy & Nguyen Thi Thu Hien • 24.01.2027';
        ogTitle = 'Tran Le Dinh Huy & Nguyen Thi Thu Hien — Wedding Invitation';
        ogDesc = guestRaw
          ? `Dear ${guestRaw} — Together with our families, Dinh Huy & Thu Hien joyfully invite you to celebrate our wedding on Sunday, January 24, 2027 at White Palace.`
          : 'Together with our families, Dinh Huy & Thu Hien joyfully invite you to celebrate our wedding on Sunday, January 24, 2027 at White Palace.';
      } else {
        pageTitle = 'Wedding Invitation | Nguyen Thi Thu Hien & Tran Le Dinh Huy • 17.01.2027';
        ogTitle = 'Nguyen Thi Thu Hien & Tran Le Dinh Huy — Wedding Invitation';
        ogDesc = guestRaw
          ? `Dear ${guestRaw} — Together with our families, Thu Hien & Dinh Huy joyfully invite you to celebrate our wedding on Sunday, January 17, 2027.`
          : 'Together with our families, Thu Hien & Dinh Huy joyfully invite you to celebrate our wedding on Sunday, January 17, 2027.';
      }
    } else if (lang === 'zh') {
      htmlLang = 'zh-CN';
      if (isGroomSide) {
        pageTitle = '新婚喜宴请柬｜陈黎廷辉 & 阮氏秋贤 · 2027.01.24';
        ogTitle = '陈黎廷辉 & 阮氏秋贤 — 新婚喜宴请柬';
        ogDesc = guestRaw
          ? `诚邀 ${guestRaw} 莅临 White Palace 参加廷辉与秋贤的新婚晚宴（2027年01月24日 17:30）。`
          : '谨以满怀喜悦之心，廷辉与秋贤诚邀您于 2027年01月24日 莅临 White Palace 参加我们的新婚晚宴。';
      } else {
        pageTitle = '归宁喜宴请柬｜阮氏秋贤 & 陈黎廷辉 · 2027.01.17';
        ogTitle = '阮氏秋贤 & 陈黎廷辉 — 归宁喜宴请柬';
        ogDesc = guestRaw
          ? `诚邀 ${guestRaw} 莅临参加秋贤与廷辉的归宁喜宴（2027年01月17日 11:20）。`
          : '谨以满怀喜悦之心，秋贤与廷辉诚邀您于 2027年01月17日 莅临参加我们的归宁喜宴。';
      }
    } else {
      htmlLang = 'vi';
      if (isGroomSide) {
        pageTitle = 'Lễ Thành Hôn | Trần Lê Đình Huy & Nguyễn Thị Thu Hiền • 24.01.2027';
        ogTitle = 'Trần Lê Đình Huy & Nguyễn Thị Thu Hiền — Thiệp Mời Lễ Thành Hôn';
        ogDesc = guestRaw
          ? `Trân trọng kính mời ${guestRaw} đến dự tiệc mừng Lễ Thành Hôn của Đình Huy & Thu Hiền — 17:30 Chủ Nhật, 24.01.2027 tại Nhà Hàng White Palace.`
          : 'Trân trọng kính mời Quý Khách đến dự tiệc mừng Lễ Thành Hôn của Đình Huy & Thu Hiền — 17:30 Chủ Nhật, 24.01.2027 tại Nhà Hàng White Palace.';
      } else {
        pageTitle = 'Lễ Vu Quy | Nguyễn Thị Thu Hiền & Trần Lê Đình Huy • 17.01.2027';
        ogTitle = 'Nguyễn Thị Thu Hiền & Trần Lê Đình Huy — Thiệp Mời Lễ Vu Quy';
        ogDesc = guestRaw
          ? `Trân trọng kính mời ${guestRaw} đến dự tiệc mừng Lễ Vu Quy của Thu Hiền & Đình Huy — Chủ Nhật, 17.01.2027.`
          : 'Trân trọng kính mời Quý Khách đến dự tiệc mừng Lễ Vu Quy của Thu Hiền & Đình Huy — Chủ Nhật, 17.01.2027.';
      }
    }

    const safePageTitle = escapeHtml(pageTitle);
    const safeOgTitle = escapeHtml(ogTitle);
    const safeOgDesc = escapeHtml(ogDesc);

    const html = await response.text();
    const updatedHtml = html
      .replace(/<html\s+lang="[^"]*"/i, `<html lang="${htmlLang}"`)
      .replace(/<title>[\s\S]*?<\/title>/i, `<title>${safePageTitle}</title>`)
      .replace(
        /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
        `<meta name="description" content="${safeOgDesc}" />`
      )
      .replace(
        /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
        `<meta property="og:title" content="${safeOgTitle}" />`
      )
      .replace(
        /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
        `<meta property="og:description" content="${safeOgDesc}" />`
      )
      .replace(
        /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
        `<meta name="twitter:title" content="${safeOgTitle}" />`
      )
      .replace(
        /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
        `<meta name="twitter:description" content="${safeOgDesc}" />`
      );

    const headers = new Headers(response.headers);
    headers.delete('content-length');
    headers.set('cache-control', 'public, max-age=0, must-revalidate');

    return new Response(updatedHtml, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch {
    return context.next();
  }
};
