/**
 * ASCII-safe URL encoding / decoding for personalized wedding invitation links.
 * Prevents Zalo, Messenger, QR scanners, Android intent://, and iOS x-safari-https://
 * from corrupting Vietnamese/Chinese UTF-8 query parameters (e.g. "Cô dâu Thu Hiền" -> "C du Thu Hi n").
 */

const INVITER_SLUG_TO_VI = {
  'co-dau': 'Cô dâu Thu Hiền',
  'chu-re': 'Chú rể Đình Huy',
  'nha-gai': 'Gia đình Nhà Gái',
  'nha-trai': 'Gia đình Nhà Trai',
  'hien-huy': 'Thu Hiền & Đình Huy',
  'huy-hien': 'Đình Huy & Thu Hiền',
};

const VI_TO_INVITER_SLUG = {
  'co dau thu hien': 'co-dau',
  'chu re dinh huy': 'chu-re',
  'gia dinh nha gai': 'nha-gai',
  'gia dinh nha trai': 'nha-trai',
  'thu hien & dinh huy': 'hien-huy',
  'dinh huy & thu hien': 'huy-hien',
};

function normalizeBasic(str = '') {
  return String(str)
    .normalize('NFD')
    .toLowerCase()
    .replace(/\p{M}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/\s*&\s*/g, ' & ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isPureAsciiPrintable(str = '') {
  return /^[\x20-\x7E]*$/.test(String(str));
}

export function encodeUtf8Base64Url(str = '') {
  const text = String(str);
  if (!text) return '';
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function decodeUtf8Base64Url(encoded = '') {
  const clean = String(encoded || '').trim();
  if (!clean) return '';
  try {
    const base64 = clean.replace(/-/g, '+').replace(/_/g, '/');
    const padLen = (4 - (base64.length % 4)) % 4;
    const padded = base64 + '='.repeat(padLen);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return '';
  }
}

export function getInviterSlug(inviter = '') {
  const key = normalizeBasic(inviter);
  return VI_TO_INVITER_SLUG[key] || '';
}

export function resolveInviterSlug(raw = '') {
  const key = String(raw || '').trim().toLowerCase();
  return INVITER_SLUG_TO_VI[key] || '';
}

/**
 * Recover legacy URL params that were mangled into Latin-1 / U+FFFD by in-app browser handoffs
 * (e.g. "C\uFFFD d\uFFFDu Thu Hi n" -> "Cô dâu Thu Hiền").
 */
export function repairCorruptedParam(value = '', rawQuery = '', paramKeys = []) {
  const text = String(value || '').trim();
  if (!text) return '';

  // 1. Check exact ASCII preset slugs first
  const bySlug = resolveInviterSlug(text);
  if (bySlug) return bySlug;

  // 2. Recover known inviter presets even if corrupted with U+FFFD or dropped Vietnamese chars
  if (/[\uFFFD?]/.test(text) || /\b(c.? d.?u|ch.? r.?|gia .?nh|thu hi.?n|.?nh huy)\b/i.test(text)) {
    const compact = text.toLowerCase().replace(/[\uFFFD\s]+/g, ' ').trim();
    if (/^c.? d.?u thu hi.? ?n$/i.test(compact)) return 'Cô dâu Thu Hiền';
    if (/^ch.? r.? .?.?nh huy$/i.test(compact)) return 'Chú rể Đình Huy';
    if (/^gia .?.?nh nh.? g.?i$/i.test(compact)) return 'Gia đình Nhà Gái';
    if (/^gia .?.?nh nh.? trai$/i.test(compact)) return 'Gia đình Nhà Trai';
    if (/^thu hi.? ?n & .?.?nh huy$/i.test(compact)) return 'Thu Hiền & Đình Huy';
    if (/^.?.?nh huy & thu hi.? ?n$/i.test(compact)) return 'Đình Huy & Thu Hiền';
  }

  // 3. If URLSearchParams emitted U+FFFD due to Latin-1 percent-encoding (%F4, %E2, etc.), decode bytes as ISO-8859-1
  if (text.includes('\uFFFD') && rawQuery && paramKeys.length > 0) {
    const cleanQuery = rawQuery.startsWith('?') ? rawQuery.slice(1) : rawQuery;
    for (const pair of cleanQuery.split('&')) {
      const eqIdx = pair.indexOf('=');
      if (eqIdx === -1) continue;
      const k = pair.slice(0, eqIdx).trim().toLowerCase();
      if (!paramKeys.includes(k)) continue;
      const rawVal = pair.slice(eqIdx + 1).replace(/\+/g, ' ');
      try {
        const latin1 = rawVal.replace(/%([0-9A-Fa-f]{2})/g, (_, hex) =>
          String.fromCharCode(parseInt(hex, 16))
        );
        if (latin1 && !latin1.includes('\uFFFD')) {
          return repairCorruptedParam(latin1);
        }
      } catch {
        // ignore
      }
    }
  }

  return text;
}

/**
 * Populate URLSearchParams with 100% ASCII-safe personalized invitation parameters.
 */
export function setSafeInvitationParams(params, { guestName = '', inviter = '', songId = '', lang = '' }) {
  const cleanGuest = String(guestName || '').trim();
  const cleanInviter = String(inviter || '').trim();

  if (cleanGuest) {
    if (isPureAsciiPrintable(cleanGuest)) {
      params.set('to', cleanGuest);
    } else {
      params.set('to64', encodeUtf8Base64Url(cleanGuest));
    }
  }

  if (cleanInviter) {
    const slug = getInviterSlug(cleanInviter);
    if (slug) {
      params.set('from', slug);
    } else if (isPureAsciiPrintable(cleanInviter)) {
      params.set('from', cleanInviter);
    } else {
      params.set('from64', encodeUtf8Base64Url(cleanInviter));
    }
  }

  if (songId) {
    params.set('music', songId);
  }
  if (lang && lang !== 'vi') {
    params.set('lang', lang);
  }
}

/**
 * Rewrite an existing URL so any non-ASCII to/from params become 100% ASCII-safe
 * before passing through Android intent:// or iOS x-safari-https:// handoffs.
 */
export function buildAsciiSafeHandoffUrl(href = '') {
  try {
    const url = new URL(href);
    const params = url.searchParams;
    const rawSearch = url.search;

    const toVal = params.get('to') || params.get('guest') || params.get('name');
    if (toVal && !params.get('to64') && !isPureAsciiPrintable(toVal)) {
      const cleanTo = repairCorruptedParam(toVal, rawSearch, ['to', 'guest', 'name']);
      params.delete('to');
      params.delete('guest');
      params.delete('name');
      params.set('to64', encodeUtf8Base64Url(cleanTo));
    }

    const fromVal = params.get('from') || params.get('inviter') || params.get('sender');
    if (fromVal && !params.get('from64')) {
      const cleanFrom = repairCorruptedParam(fromVal, rawSearch, ['from', 'inviter', 'sender']);
      const slug = getInviterSlug(cleanFrom);
      if (slug) {
        params.delete('inviter');
        params.delete('sender');
        params.set('from', slug);
      } else if (!isPureAsciiPrintable(cleanFrom)) {
        params.delete('from');
        params.delete('inviter');
        params.delete('sender');
        params.set('from64', encodeUtf8Base64Url(cleanFrom));
      }
    }

    return url.toString();
  } catch {
    return href;
  }
}
