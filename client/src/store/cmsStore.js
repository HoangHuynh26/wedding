import { useSyncExternalStore } from 'react';
import axios from 'axios';
import weddingConfig from '../config/weddingConfig';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 6000,
});

const LS_SETTINGS_KEY = 'wedding_cms_settings_v1';
const LS_INVITATIONS_KEY = 'wedding_cms_invitations_v1';
const LS_RSVPS_KEY = 'wedding_cms_rsvps_v1';
const LEGACY_BRIDE_HISTORY = 'wedding_invitation_links_history';
const LEGACY_GROOM_HISTORY = 'wedding_invitation_links_history_groom';

export function buildDefaultCmsSettings() {
  return {
    music: {
      defaultSongId: weddingConfig.music?.id || 'young-and-beautiful',
      brideDefaultSongId: '',
      groomDefaultSongId: '',
    },
    shared: {
      vi: {
        announcementLine1: 'KÍNH MỜI QUÝ KHÁCH DỰ TIỆC CHUNG\u00A0VUI',
        announcementLine2: 'CỦA GIA ĐÌNH CHÚNG TÔI',
        quoteLine1: 'Tình yêu và sự gắn kết đưa hai trái tim về chung một mái nhà,',
        quoteLine2: 'rất mong sự hiện diện của Quý Khách để cùng sẻ chia khoảnh khắc ý nghĩa này.',
        countdownScript: 'Hẹn sớm gặp bạn!',
        rsvpQuote: '“Sự hiện diện và lời chúc phúc của Quý khách là niềm vinh hạnh to lớn cho gia đình chúng mình.”',
        footerLine1: 'Cảm ơn Quý khách đã hiện diện và cùng chia sẻ niềm vui trong ngày đặc biệt này.',
        footerLine2: 'Sự hiện diện của Quý khách chính là món quà ý nghĩa nhất dành cho chúng tôi.',
        footerThankYou: 'Thank you!',
      },
      en: {
        announcementLine1: 'YOU ARE CORDIALLY INVITED TO',
        announcementLine2: "OUR FAMILY'S WEDDING RECEPTION",
        quoteLine1: 'Love and devotion bring two hearts together under one roof,',
        quoteLine2: 'we warmly hope for your presence to share this meaningful moment with our family.',
        countdownScript: 'See you soon!',
        rsvpQuote: '“Your presence and heartfelt blessings are the greatest honor for our families.”',
        footerLine1: 'Thank you for your presence and for sharing the joy with us on this special day.',
        footerLine2: 'Your presence is truly the most meaningful gift to us.',
        footerThankYou: 'Thank you!',
      },
      zh: {
        announcementLine1: '谨定良辰 • 诚邀莅临',
        announcementLine2: '共赴我们全家的婚礼喜宴',
        quoteLine1: '爱与缘分让两颗心携手同心、共筑温馨家园，',
        quoteLine2: '我们全家诚挚期盼您的莅临，共同分享这份珍贵而美好的喜悦。',
        countdownScript: '期待与您相见！',
        rsvpQuote: '“您的莅临与诚挚祝福，是我们全家人莫大的荣幸与喜悦。”',
        footerLine1: '感谢您的莅临，与我们共同分享这特别之日的喜悦。',
        footerLine2: '您的到来，便是赐予我们最珍贵、最有意义的礼物。',
        footerThankYou: 'Thank you!',
      },
    },
    bride: {
      fullName: 'Nguyễn Thị Thu Hiền',
      shortName: 'Thu Hiền',
      dob: '23.11.1999',
      phone: '077 418 2334',
      father: 'Ông: Nguyễn Thanh Tâm',
      mother: 'Bà: Nguyễn Xuân Mai',
      ceremonyTitle: 'LỄ VU QUY',
      cardTitle: 'THIỆP MỜI LỄ VU QUY',
      dateShort: '17.01.2027',
      timeDayHeader: '11:20 AM, CHỦ NHẬT',
      monthBox: 'THÁNG 01',
      dayNumber: '17',
      yearBox: 'NĂM 2027',
      lunarDate: '( Tức ngày 10 tháng 12 năm Bính Ngọ )',
      isoDate: '2027-01-17T11:20:00+07:00',
      venueHostName: 'TƯ GIA NHÀ GÁI',
      venueHall: 'Tư gia Nhà Gái',
      regionCaps: 'PHƯỜNG TRẢNG DÀI, THÀNH PHỐ ĐỒNG NAI',
      address: '1322/768, Phường Trảng Dài, Thành Phố Đồng Nai',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=11.015761%2C106.864617',
      embedMapUrl: 'https://www.google.com/maps?q=11.015761,106.864617&z=16&output=embed',
      venueIntro: 'Tọa lạc tại không gian ấm cúng của gia đình tại Phường Trảng Dài, Thành Phố Đồng Nai, nơi lưu giữ những nụ cười, tiếng chúc phúc và khoảnh khắc thiêng liêng của ngày Lễ Vu Quy.',
      rsvpSubtitle: 'Để gia đình chuẩn bị chu đáo nhất, xin Quý khách vui lòng xác nhận trước ngày 05.01.2027.',
      scheduleItems: [
        {
          time: '10:30 AM',
          title: 'ĐÓN KHÁCH',
          detail: 'Đón tiếp Quý Khách, chụp ảnh lưu niệm và ổn định chỗ ngồi cùng gia đình',
        },
        {
          time: '11:20 AM',
          title: 'LỄ VU QUY',
          detail: 'Cử hành nghi thức Lễ Vu Quy trang trọng trước sự chứng kiến của hai họ và Quý Khách',
        },
        {
          time: '11:45 AM',
          title: 'KHAI TIỆC',
          detail: 'Khai tiệc trưa thân mật, cùng nâng ly chúc phúc và chung vui bên gia đình, bạn bè',
        },
      ],
      i18n: {
        en: {
          fullName: 'Nguyen Thi Thu Hien',
          shortName: 'Thu Hien',
          father: 'Mr. Nguyen Thanh Tam',
          mother: 'Mrs. Nguyen Xuan Mai',
          ceremonyTitle: "BRIDE'S WEDDING CEREMONY",
          cardTitle: "BRIDE'S WEDDING INVITATION",
          timeDayHeader: '11:20 AM, SUNDAY',
          monthBox: 'JANUARY',
          dayNumber: '17',
          yearBox: '2027',
          lunarDate: '( 10th Day of the 12th Lunar Month, Year of the Fire Horse )',
          venueHostName: "BRIDE'S FAMILY RESIDENCE",
          venueHall: "Bride's Family Residence",
          regionCaps: 'TRANG DAI WARD, DONG NAI CITY',
          address: '1322/768, Trang Dai Ward, Dong Nai City, Vietnam',
          rsvpSubtitle:
            'Please confirm your attendance before January 5, 2027, so our family can prepare for your visit.',
          scheduleItems: [
            {
              time: '10:30 AM',
              title: 'WELCOME',
              detail: 'Warm welcome, guest seating & commemorative photos with our family',
            },
            {
              time: '11:20 AM',
              title: "BRIDE'S WEDDING CEREMONY",
              detail:
                'We will hold the wedding ceremony in the presence of both families and our guests.',
            },
            {
              time: '11:45 AM',
              title: 'WEDDING LUNCH',
              detail:
                'An intimate lunch begins with toasts and celebration among family and friends.',
            },
          ],
        },
        zh: {
          fullName: '阮氏秋贤',
          shortName: '秋贤',
          father: '父：阮清心',
          mother: '母：阮春梅',
          ceremonyTitle: '女方婚礼仪式',
          cardTitle: '女方婚礼请柬',
          timeDayHeader: '上午 11:20 · 星期日',
          monthBox: '01月',
          dayNumber: '17日',
          yearBox: '2027年',
          lunarDate: '（农历丙午年腊月初十）',
          venueHostName: '女方府邸',
          venueHall: '女方府邸',
          regionCaps: '越南同奈市 · 长台坊',
          address: '越南同奈市长台坊 1322/768 号',
          rsvpSubtitle: '为便于家人周全准备席位与招待，烦请您于 2027年01月05日 前确认出席。',
          scheduleItems: [
            {
              time: '上午 10:30',
              title: '迎宾接待',
              detail: '欢迎各位宾客到场，合影留念并与家人一同入座',
            },
            {
              time: '上午 11:20',
              title: '女方婚礼仪式',
              detail: '在双方亲友与宾客的见证下，举行庄重温馨的女方婚礼仪式',
            },
            {
              time: '上午 11:45',
              title: '喜宴开席',
              detail: '午间喜宴正式开席，与至亲好友举杯同庆美好佳期',
            },
          ],
        },
      },
    },
    groom: {
      fullName: 'Trần Lê Đình Huy',
      shortName: 'Đình Huy',
      dob: '14.10.1997',
      phone: '0921 779 799',
      father: 'Ông: Trần Đình Lý',
      mother: 'Bà: Lê Thị Kim Dung',
      ceremonyTitle: 'LỄ THÀNH HÔN',
      cardTitle: 'THIỆP MỜI LỄ THÀNH HÔN',
      dateShort: '24.01.2027',
      timeDayHeader: '17:30 PM, CHỦ NHẬT',
      monthBox: 'THÁNG 01',
      dayNumber: '24',
      yearBox: 'NĂM 2027',
      lunarDate: '( Tức ngày 17 tháng 12 năm Bính Ngọ )',
      isoDate: '2027-01-24T17:30:00+07:00',
      venueHostName: 'NHÀ HÀNG WHITE PALACE',
      venueHall: 'Nhà hàng White Palace',
      regionCaps: '588 PHẠM VĂN ĐỒNG, P. HIỆP BÌNH CHÁNH,\nTP. THỦ ĐỨC, THÀNH PHỐ HỒ CHÍ MINH',
      address: '588 Phạm Văn Đồng, Phường Hiệp Bình Chánh, TP. Thủ Đức, TP. Hồ Chí Minh',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=White+Palace+588+Pham+Van+Dong+Thu+Duc+Ho+Chi+Minh',
      embedMapUrl: 'https://www.google.com/maps?q=White+Palace+588+Pham+Van+Dong+Thu+Duc+Ho+Chi+Minh&z=16&output=embed',
      venueIntro: 'Tọa lạc tại không gian sảnh tiệc sang trọng bậc nhất của Nhà hàng Tiệc Cưới White Palace, nơi lưu giữ những nụ cười, tiếng chúc phúc và khoảnh khắc thiêng liêng của đêm tiệc Lễ Thành Hôn.',
      rsvpSubtitle: 'Để gia đình chuẩn bị chu đáo nhất cho buổi tiệc tối tại Nhà Hàng White Palace, xin Quý khách vui lòng xác nhận trước ngày 10.01.2027.',
      scheduleItems: [
        {
          time: '17:30 PM',
          title: 'ĐÓN KHÁCH',
          detail: 'Đón tiếp Quý Khách, chụp ảnh lưu niệm và ổn định chỗ ngồi tại sảnh tiệc',
        },
        {
          time: '19:30 PM',
          title: 'KHAI TIỆC TỐI',
          detail: 'Khai tiệc tối ấm cúng, cùng nâng ly chúc phúc và chung vui bên gia đình, bạn bè',
        },
      ],
      i18n: {
        en: {
          fullName: 'Tran Le Dinh Huy',
          shortName: 'Dinh Huy',
          father: 'Mr. Tran Dinh Ly',
          mother: 'Mrs. Le Thi Kim Dung',
          ceremonyTitle: "GROOM'S WEDDING CEREMONY",
          cardTitle: "GROOM'S WEDDING INVITATION",
          timeDayHeader: '17:30 PM, SUNDAY',
          monthBox: 'JANUARY',
          dayNumber: '24',
          yearBox: '2027',
          lunarDate: '( 17th Day of the 12th Lunar Month, Year of the Fire Horse )',
          venueHostName: 'WHITE PALACE RESTAURANT',
          venueHall: 'White Palace Restaurant',
          regionCaps: '588 PHAM VAN DONG, HIEP BINH CHANH WARD,\nTHU DUC CITY, HO CHI MINH CITY',
          address: '588 Pham Van Dong, Hiep Binh Chanh Ward, Thu Duc City, Ho Chi Minh City',
          rsvpSubtitle:
            'Please confirm your attendance before January 10, 2027, so our family can prepare for the evening banquet at White Palace.',
          scheduleItems: [
            {
              time: '17:30 PM',
              title: 'WELCOME',
              detail: 'Evening guest welcome, seating & commemorative photos at the White Palace hall',
            },
            {
              time: '19:30 PM',
              title: 'EVENING BANQUET',
              detail: 'Dinner begins with toasts and celebration among family and friends.',
            },
          ],
        },
        zh: {
          fullName: '陈黎廷辉',
          shortName: '廷辉',
          father: '父：陈廷理',
          mother: '母：黎氏金蓉',
          ceremonyTitle: '新婚喜宴',
          cardTitle: '新婚喜宴请柬',
          timeDayHeader: '17:30 PM · 星期日',
          monthBox: '01月',
          dayNumber: '24日',
          yearBox: '2027年',
          lunarDate: '（农历丙午年腊月十七）',
          venueHostName: 'WHITE PALACE 婚礼宴会厅',
          venueHall: 'White Palace 宴会厅',
          regionCaps: '胡志明市守德市 · 协平政坊范文同街 588 号',
          address: '胡志明市守德市协平政坊范文同街 588 号 (White Palace)',
          rsvpSubtitle:
            '为便于家人周全准备 White Palace 晚宴席位与招待，烦请您于 2027年01月10日 前确认出席。',
          scheduleItems: [
            {
              time: '17:30 PM',
              title: '迎宾接待',
              detail: '在 White Palace 宴会厅迎接各位宾客，合影留念并安排入座',
            },
            {
              time: '19:30 PM',
              title: '晚宴开席',
              detail: '新婚晚宴正式开席，与至亲好友举杯共庆美好夜晚',
            },
          ],
        },
      },
    },
    updatedAt: null,
  };
}

function mergeSideBranch(defSide, savedSide) {
  const s = savedSide || {};
  const mergeLoc = (defLoc, savedLoc) => ({
    ...defLoc,
    ...(savedLoc || {}),
    scheduleItems: Array.isArray(savedLoc?.scheduleItems)
      ? savedLoc.scheduleItems
      : defLoc.scheduleItems,
  });

  return {
    ...defSide,
    ...s,
    scheduleItems: Array.isArray(s.scheduleItems) ? s.scheduleItems : defSide.scheduleItems,
    i18n: {
      en: mergeLoc(defSide.i18n.en, s.i18n?.en),
      zh: mergeLoc(defSide.i18n.zh, s.i18n?.zh),
    },
  };
}

function deepMergeSettings(defaults, saved) {
  if (!saved || typeof saved !== 'object') return defaults;
  return {
    music: { ...defaults.music, ...(saved.music || {}) },
    shared: {
      vi: { ...defaults.shared.vi, ...(saved.shared?.vi || {}) },
      en: { ...defaults.shared.en, ...(saved.shared?.en || {}) },
      zh: { ...defaults.shared.zh, ...(saved.shared?.zh || {}) },
    },
    bride: mergeSideBranch(defaults.bride, saved.bride),
    groom: mergeSideBranch(defaults.groom, saved.groom),
    updatedAt: saved.updatedAt || defaults.updatedAt,
  };
}

function loadLocalJson(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveLocalJson(key, val) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // ignore storage quota errors
  }
}

function migrateLegacyInvitations() {
  if (typeof window === 'undefined') return [];
  const existing = loadLocalJson(LS_INVITATIONS_KEY, null);
  if (Array.isArray(existing)) return existing;

  const brideOld = loadLocalJson(LEGACY_BRIDE_HISTORY, []);
  const groomOld = loadLocalJson(LEGACY_GROOM_HISTORY, []);
  const combined = [
    ...(Array.isArray(groomOld) ? groomOld.map((x) => ({ ...x, side: 'groom', createdDisplay: x.createdAt })) : []),
    ...(Array.isArray(brideOld) ? brideOld.map((x) => ({ ...x, side: 'bride', createdDisplay: x.createdAt })) : []),
  ];
  saveLocalJson(LS_INVITATIONS_KEY, combined);
  return combined;
}

const defaults = buildDefaultCmsSettings();
let state = {
  settings: deepMergeSettings(defaults, loadLocalJson(LS_SETTINGS_KEY, null)),
  invitations: migrateLegacyInvitations(),
  rsvps: loadLocalJson(LS_RSVPS_KEY, []).map(({ message: _m, ...rest }) => rest),
  hydratedFromServer: false,
};

const listeners = new Set();
function emit() {
  for (const fn of listeners) fn();
}

let previewDraftSettings = null;
let cachedPreviewSnapshot = null;

const isPreviewIframe =
  typeof window !== 'undefined' &&
  window.self !== window.top &&
  new URLSearchParams(window.location.search).get('preview') === '1';

function rebuildPreviewSnapshot() {
  if (isPreviewIframe && previewDraftSettings) {
    cachedPreviewSnapshot = { ...state, settings: previewDraftSettings };
  } else {
    cachedPreviewSnapshot = null;
  }
}

function setState(partial) {
  state = { ...state, ...partial };
  rebuildPreviewSnapshot();
  emit();
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return cachedPreviewSnapshot || state;
}

// Listen to cross-tab localStorage updates & same-origin live Admin preview postMessage!
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === LS_SETTINGS_KEY) {
      setState({
        settings: deepMergeSettings(buildDefaultCmsSettings(), loadLocalJson(LS_SETTINGS_KEY, null)),
      });
    } else if (e.key === LS_INVITATIONS_KEY) {
      setState({ invitations: loadLocalJson(LS_INVITATIONS_KEY, []) });
    } else if (e.key === LS_RSVPS_KEY) {
      setState({
        rsvps: loadLocalJson(LS_RSVPS_KEY, []).map(({ message: _m, ...rest }) => rest),
      });
    }
  });

  if (isPreviewIframe) {
    window.addEventListener('message', (e) => {
      if (e.origin !== window.location.origin) return;
      const msg = e.data;
      if (msg && msg.type === 'WEDDING_CMS_PREVIEW_DRAFT' && msg.settings) {
        previewDraftSettings = deepMergeSettings(buildDefaultCmsSettings(), msg.settings);
        rebuildPreviewSnapshot();
        emit();
      }
    });
  }
}

let initialFetchStarted = false;
export async function syncCmsFromServer(force = false) {
  if (typeof window === 'undefined') return;
  if (initialFetchStarted && !force) return;
  initialFetchStarted = true;

  const [settingsRes, invRes, rsvpRes] = await Promise.allSettled([
    api.get('/api/cms/settings'),
    api.get('/api/cms/invitations'),
    api.get('/api/rsvp'),
  ]);

  const next = { hydratedFromServer: true };

  if (settingsRes.status === 'fulfilled' && settingsRes.value?.data?.settings) {
    const merged = deepMergeSettings(buildDefaultCmsSettings(), settingsRes.value.data.settings);
    saveLocalJson(LS_SETTINGS_KEY, merged);
    next.settings = merged;
  }

  if (invRes.status === 'fulfilled' && Array.isArray(invRes.value?.data?.invitations)) {
    const serverInvs = invRes.value.data.invitations;
    if (serverInvs.length > 0 || state.invitations.length === 0) {
      // Merge unique by id so neither local nor server cards are lost
      const map = new Map();
      for (const item of [...serverInvs, ...state.invitations]) {
        if (item?.id) map.set(String(item.id), item);
      }
      const mergedInvs = Array.from(map.values());
      saveLocalJson(LS_INVITATIONS_KEY, mergedInvs);
      next.invitations = mergedInvs;
    }
  }

  if (rsvpRes.status === 'fulfilled' && Array.isArray(rsvpRes.value?.data?.recentGuests)) {
    const serverRsvps = rsvpRes.value.data.recentGuests.map(({ message: _m, ...rest }) => rest);
    if (serverRsvps.length > 0 || state.rsvps.length === 0) {
      const map = new Map();
      for (const item of [...serverRsvps, ...state.rsvps]) {
        const k = item?.id || `${item.invitationType}_${item.fullName}_${item.submittedAt}`;
        map.set(String(k), item);
      }
      const mergedRsvps = Array.from(map.values());
      saveLocalJson(LS_RSVPS_KEY, mergedRsvps);
      next.rsvps = mergedRsvps;
    }
  }

  setState(next);
}

export async function saveCmsSettings(newSettings) {
  const merged = deepMergeSettings(buildDefaultCmsSettings(), {
    ...newSettings,
    updatedAt: new Date().toISOString(),
  });
  saveLocalJson(LS_SETTINGS_KEY, merged);
  setState({ settings: merged });

  try {
    const res = await api.put('/api/cms/settings', merged);
    if (res.data?.settings) {
      const synced = deepMergeSettings(buildDefaultCmsSettings(), res.data.settings);
      saveLocalJson(LS_SETTINGS_KEY, synced);
      setState({ settings: synced });
    }
  } catch {
    // Offline / static dev fallback already persisted in localStorage
  }
  return merged;
}

export async function resetCmsSettings() {
  const fresh = {
    ...buildDefaultCmsSettings(),
    updatedAt: new Date().toISOString(),
  };
  saveLocalJson(LS_SETTINGS_KEY, fresh);
  setState({ settings: fresh });
  try {
    await api.put('/api/cms/settings', fresh);
  } catch {
    // ignore
  }
  return fresh;
}

/**
 * Every click on "Sao chép link" creates 1 tracked invitation card record.
 */
export async function recordCreatedInvitation(item) {
  const now = new Date();
  const record = {
    id: `inv_${now.getTime()}_${Math.random().toString(36).slice(2, 6)}`,
    side: item.side === 'groom' ? 'groom' : 'bride',
    guestName: String(item.guestName || '').trim(),
    inviter: String(item.inviter || '').trim(),
    lang: item.lang || 'vi',
    langLabel: item.langLabel || 'Tiếng Việt',
    langFlag: item.langFlag || '🇻🇳',
    songId: item.songId || 'young-and-beautiful',
    songTitle: item.songTitle || 'Young and Beautiful',
    songArtist: item.songArtist || 'Lana Del Rey',
    url: String(item.url || '').trim(),
    createdAt: now.toISOString(),
    createdDisplay: now.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };

  const updated = [record, ...state.invitations].slice(0, 5000);
  saveLocalJson(LS_INVITATIONS_KEY, updated);
  setState({ invitations: updated });

  try {
    await api.post('/api/cms/invitations', record);
  } catch {
    // Persisted locally when backend is offline
  }
  return record;
}

export async function deleteCreatedInvitation(id) {
  const updated = state.invitations.filter((x) => String(x.id) !== String(id));
  saveLocalJson(LS_INVITATIONS_KEY, updated);
  setState({ invitations: updated });
  try {
    await api.delete(`/api/cms/invitations/${encodeURIComponent(id)}`);
  } catch {
    // ignore
  }
}

export async function clearCreatedInvitations(side = '') {
  const updated = side ? state.invitations.filter((x) => x.side !== side) : [];
  saveLocalJson(LS_INVITATIONS_KEY, updated);
  setState({ invitations: updated });
  try {
    await api.delete('/api/cms/invitations', { params: side ? { side } : {} });
  } catch {
    // ignore
  }
}

/**
 * Record website attendance confirmation — STRICTLY WITHOUT guest `message`!
 */
export function recordLocalRsvpConfirmation(confirmation) {
  if (!confirmation || !confirmation.fullName) return;
  const now = new Date();
  const cleanRecord = {
    id: confirmation.id || `rsvp_${now.getTime()}_${Math.random().toString(36).slice(2, 6)}`,
    fullName: String(confirmation.fullName).trim(),
    side: String(confirmation.side || '').trim(),
    invitationType: confirmation.invitationType === 'groom' ? 'groom' : 'bride',
    language: confirmation.language || 'vi',
    attendance: true,
    dateFormatted:
      confirmation.dateFormatted ||
      now.toLocaleString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }),
    submittedAt: confirmation.submittedAt || now.toISOString(),
  };
  // Deduplicate by id or recent same-name + same-type within 30s
  const filtered = state.rsvps.filter((r) => String(r.id) !== String(cleanRecord.id));
  const updated = [cleanRecord, ...filtered].slice(0, 5000);
  saveLocalJson(LS_RSVPS_KEY, updated);
  setState({ rsvps: updated });
  return cleanRecord;
}

export async function deleteRsvpConfirmation(id) {
  const updated = state.rsvps.filter((x) => String(x.id) !== String(id));
  saveLocalJson(LS_RSVPS_KEY, updated);
  setState({ rsvps: updated });
  try {
    await api.delete(`/api/rsvp/${encodeURIComponent(id)}`);
  } catch {
    // ignore
  }
}

export async function clearRsvpConfirmations(invitationType = '') {
  const updated = invitationType
    ? state.rsvps.filter((x) => x.invitationType !== invitationType)
    : [];
  saveLocalJson(LS_RSVPS_KEY, updated);
  setState({ rsvps: updated });
  try {
    await api.delete('/api/rsvp', { params: invitationType ? { invitationType } : {} });
  } catch {
    // ignore
  }
}

export function useCmsStore() {
  if (typeof window !== 'undefined' && !initialFetchStarted && !isPreviewIframe) {
    void syncCmsFromServer();
  }
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
