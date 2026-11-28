import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import {
  Home,
  Heart,
  UserCheck,
  Music,
  Users,
  MailCheck,
  Search,
  Play,
  Pause,
  Copy,
  Check,
  ExternalLink,
  Download,
  Trash2,
  Plus,
  RotateCcw,
  Save,
  RefreshCw,
  Smartphone,
  Monitor,
  Share2,
  Globe,
  Calendar,
  Sparkles,
  Bell,
  Menu,
  X,
  Star,
  FileSpreadsheet,
  Mail,
  BookOpen,
  ChevronDown,
  UserPlus,
} from 'lucide-react';
import { chineseNames } from '../../config/chineseInvitation';
import weddingConfig from '../../config/weddingConfig';
import {
  useCmsStore,
  saveCmsSettings,
  resetCmsSettings,
  recordCreatedInvitation,
  deleteCreatedInvitation,
  clearCreatedInvitations,
  deleteRsvpConfirmation,
  clearRsvpConfirmations,
  syncCmsFromServer,
} from '../../store/cmsStore';
import { setSafeInvitationParams } from '../../utils/invitationCodec';
import styles from './Admin.module.css';

const BRIDE_INVITER_PRESETS = [
  'Cô dâu Thu Hiền',
  'Gia đình Nhà Gái',
  'Ba Mẹ Cô dâu',
  'Thu Hiền & Đình Huy',
];

const GROOM_INVITER_PRESETS = [
  'Chú rể Đình Huy',
  'Gia đình Nhà Trai',
  'Ba Mẹ Chú rể',
  'Đình Huy & Thu Hiền',
];

const LANGUAGE_OPTIONS = [
  {
    code: 'vi',
    flag: '🇻🇳',
    name: 'Tiếng Việt',
    badge: 'Mặc định',
  },
  {
    code: 'en',
    flag: '🇬🇧',
    name: 'Tiếng Anh (English)',
    badge: 'Auto Translate',
  },
  {
    code: 'zh',
    flag: '🇨🇳',
    name: 'Tiếng Trung (中文)',
    badge: '自动翻译',
  },
];

const PREFIXES_BY_LANG = {
  vi: ['Bạn', 'Anh', 'Chị', 'Em', 'Vợ chồng', 'Gia đình', 'Cô & Chú', 'Bác'],
  en: ['Mr.', 'Ms.', 'Mrs.', 'Mr. & Mrs.', 'Dr.', 'Family of'],
  zh: ['先生', '女士', '阖家', '亲爱的', '尊敬的'],
};

const ZH_SUFFIX_HONORIFICS = new Set(['先生', '女士', '阖家']);

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Tổng quan', icon: Home },
  { id: 'bride', label: 'Thiệp Cô dâu', icon: Heart },
  { id: 'groom', label: 'Thiệp Chú rể', icon: UserCheck },
  { id: 'music', label: 'Nhạc nền', icon: Music },
  {
    id: 'guests',
    label: 'Khách mời',
    icon: Users,
    children: [
      { id: 'guests-bride', label: 'Cô dâu', emoji: '👰' },
      { id: 'guests-groom', label: 'Chú rể', emoji: '🤵' },
    ],
  },
  { id: 'rsvp', label: 'Xác nhận tham dự', icon: MailCheck },
];

const VALID_TAB_IDS = new Set([
  'dashboard',
  'bride',
  'groom',
  'music',
  'guests-bride',
  'guests-groom',
  'rsvp',
]);

const SIDE_EDITOR_SECTIONS = [
  { id: 'hero', short: '1. Mở đầu', label: 'Bìa mở đầu & Nghi lễ' },
  { id: 'countdown', short: '2. Đếm ngược', label: 'Khung Đếm ngược' },
  { id: 'invitation', short: '3. Thiệp chính', label: 'Thiệp mời chính & Gia đình' },
  { id: 'schedule', short: '4. Lịch trình', label: 'Lịch trình buổi lễ' },
  { id: 'venue', short: '5. Địa điểm', label: 'Địa điểm, Bản đồ & Liên hệ' },
  { id: 'rsvp', short: '6. RSVP', label: 'Xác nhận tham dự' },
];

const SECTION_LABELS = {
  hero: 'Bìa mở đầu',
  countdown: 'Đếm ngược',
  invitation: 'Thiệp mời chính',
  schedule: 'Lịch trình',
  venue: 'Địa điểm & Bản đồ',
  rsvp: 'Xác nhận RSVP',
  footer: 'Chân trang (Footer)',
};

const DEVICE_VIEWPORTS = {
  mobile: { width: 390, height: 844, bezel: 12, chromeTop: 0, label: '390 × 844' },
  desktop: { width: 1440, height: 860, bezel: 8, chromeTop: 22, label: '1440 × 860' },
};

/**
 * True-proportion hardware viewport emulator (Mobile 390×844 / Desktop 1440×860)
 * Dynamically scales the native CSS viewport via ResizeObserver so media queries,
 * 100svh, and aspect-ratio artwork inside the iframe always render at 100% authentic proportions.
 */
function ScaledDeviceFrame({ device = 'mobile', src, iframeKey, iframeRef, title, routeLabel = '/' }) {
  const stageRef = useRef(null);
  const spec = DEVICE_VIEWPORTS[device] || DEVICE_VIEWPORTS.mobile;
  const [scale, setScale] = useState(device === 'mobile' ? 0.56 : 0.34);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;

    const computeScale = () => {
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const availW = Math.max(120, rect.width - spec.bezel - 12);
      const availH = Math.max(150, rect.height - spec.bezel - spec.chromeTop - 10);
      const next = Math.min(availW / spec.width, availH / spec.height, 1);
      setScale(Math.max(0.18, Number(next.toFixed(4))));
    };

    computeScale();
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(computeScale);
      ro.observe(el);
      return () => ro.disconnect();
    }
    window.addEventListener('resize', computeScale);
    return () => window.removeEventListener('resize', computeScale);
  }, [device, spec.width, spec.height, spec.bezel, spec.chromeTop]);

  const scaledW = Math.round(spec.width * scale);
  const scaledH = Math.round(spec.height * scale);

  if (device === 'desktop') {
    return (
      <div ref={stageRef} className={styles.emulatorStage}>
        <div
          className={styles.emulatorDesktopShell}
          style={{ width: `${scaledW + spec.bezel}px`, height: `${scaledH + spec.bezel + spec.chromeTop}px` }}
        >
          <div className={styles.emulatorBrowserBar}>
            <div className={styles.browserDots}>
              <span />
              <span />
              <span />
            </div>
            <div className={styles.browserAddressPill}>
              {routeLabel} • {spec.label}
            </div>
          </div>
          <div
            className={styles.emulatorScreenClip}
            style={{ width: `${scaledW}px`, height: `${scaledH}px`, borderRadius: '0 0 7px 7px' }}
          >
            <iframe
              ref={iframeRef}
              key={iframeKey}
              src={src}
              title={title}
              style={{
                width: `${spec.width}px`,
                height: `${spec.height}px`,
                transform: `scale(${scale})`,
                transformOrigin: '0 0',
                border: 'none',
                display: 'block',
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  const outerRadius = Math.max(18, Math.round(40 * scale) + 5);
  const innerRadius = Math.max(14, Math.round(36 * scale));
  const islandW = Math.max(38, Math.round(98 * scale));
  const islandH = Math.max(8, Math.round(22 * scale));

  return (
    <div ref={stageRef} className={styles.emulatorStage}>
      <div
        className={styles.emulatorPhoneShell}
        style={{
          width: `${scaledW + spec.bezel}px`,
          height: `${scaledH + spec.bezel}px`,
          borderRadius: `${outerRadius}px`,
        }}
      >
        <div
          className={styles.emulatorDynamicIsland}
          style={{
            width: `${islandW}px`,
            height: `${islandH}px`,
            top: `${Math.max(8, Math.round(14 * scale))}px`,
          }}
          aria-hidden="true"
        />
        <div
          className={styles.emulatorScreenClip}
          style={{
            width: `${scaledW}px`,
            height: `${scaledH}px`,
            borderRadius: `${innerRadius}px`,
          }}
        >
          <iframe
            ref={iframeRef}
            key={iframeKey}
            src={src}
            title={title}
            style={{
              width: `${spec.width}px`,
              height: `${spec.height}px`,
              transform: `scale(${scale})`,
              transformOrigin: '0 0',
              border: 'none',
              display: 'block',
            }}
          />
        </div>
      </div>
    </div>
  );
}

function splitIsoToDateAndTime(isoStr = '', fallbackDate = '2027-01-17', fallbackTime = '11-20-00') {
  const raw = String(isoStr || '').trim();
  const m = raw.match(/^(\d{4}-\d{2}-\d{2})[T\s]+(\d{1,2})[-:](\d{2})(?:[-:](\d{2}))?/);
  if (m) {
    const [, datePart, hh, mm, ss = '00'] = m;
    return {
      datePart,
      timePart: `${String(hh).padStart(2, '0')}-${mm}-${ss}`,
    };
  }
  return { datePart: fallbackDate, timePart: fallbackTime };
}

function buildIsoFromDateAndTime(datePart = '', timePart = '') {
  const dMatch = String(datePart || '').trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const tMatch = String(timePart || '')
    .trim()
    .match(/^(\d{1,2})[-:](\d{1,2})(?:[-:](\d{1,2}))?$/);
  if (!dMatch || !tMatch) return null;

  const yyyy = dMatch[1];
  const mo = String(Math.min(12, Math.max(1, Number(dMatch[2])))).padStart(2, '0');
  const dd = String(Math.min(31, Math.max(1, Number(dMatch[3])))).padStart(2, '0');
  const hh = String(Math.min(23, Math.max(0, Number(tMatch[1])))).padStart(2, '0');
  const mi = String(Math.min(59, Math.max(0, Number(tMatch[2])))).padStart(2, '0');
  const ss = String(Math.min(59, Math.max(0, Number(tMatch[3] ?? 0)))).padStart(2, '0');
  return `${yyyy}-${mo}-${dd}T${hh}:${mi}:${ss}+07:00`;
}

function CountdownDateTimeFields({ isoDate, isGroom, onChangeIso }) {
  const fallbackDate = isGroom ? '2027-01-24' : '2027-01-17';
  const fallbackTime = isGroom ? '17-30-00' : '11-20-00';
  const parsed = useMemo(
    () => splitIsoToDateAndTime(isoDate, fallbackDate, fallbackTime),
    [isoDate, fallbackDate, fallbackTime]
  );

  const [dateInput, setDateInput] = useState(parsed.datePart);
  const [timeInput, setTimeInput] = useState(parsed.timePart);
  const datePickerRef = useRef(null);

  useEffect(() => {
    setDateInput(parsed.datePart);
    setTimeInput(parsed.timePart);
  }, [parsed.datePart, parsed.timePart]);

  const tryCommit = (nextDate, nextTime) => {
    const built = buildIsoFromDateAndTime(nextDate, nextTime);
    if (built) onChangeIso(built);
  };

  return (
    <div className={styles.fieldGrid2}>
      <div className={styles.fieldGroup} style={{ marginBottom: 0 }}>
        <label>Ngày cưới (yyyy-mm-dd)</label>
        <div className={styles.dateInputWrap}>
          <input
            type="text"
            className={`${styles.textInput} ${styles.dateTextInputWithBtn}`}
            placeholder="2027-01-24"
            value={dateInput}
            onChange={(e) => {
              const v = e.target.value;
              setDateInput(v);
              tryCommit(v, timeInput);
            }}
            onBlur={() => {
              const built = buildIsoFromDateAndTime(dateInput, timeInput);
              if (built) {
                const norm = splitIsoToDateAndTime(built, fallbackDate, fallbackTime);
                setDateInput(norm.datePart);
              } else {
                setDateInput(parsed.datePart);
              }
            }}
          />
          <button
            type="button"
            className={styles.calendarIconBtn}
            title="Chọn ngày trên lịch"
            onClick={() => {
              if (datePickerRef.current?.showPicker) {
                datePickerRef.current.showPicker();
              } else {
                datePickerRef.current?.focus();
              }
            }}
          >
            <Calendar size={14} />
          </button>
          <input
            ref={datePickerRef}
            type="date"
            className={styles.hiddenNativeDate}
            tabIndex={-1}
            aria-hidden="true"
            value={/^\d{4}-\d{2}-\d{2}$/.test(dateInput) ? dateInput : parsed.datePart}
            onChange={(e) => {
              const v = e.target.value;
              if (v) {
                setDateInput(v);
                tryCommit(v, timeInput);
              }
            }}
          />
        </div>
      </div>

      <div className={styles.fieldGroup} style={{ marginBottom: 0 }}>
        <label>Giờ - Phút - Giây (hh-mm-ss)</label>
        <input
          type="text"
          className={styles.textInput}
          placeholder="17-30-00"
          value={timeInput}
          onChange={(e) => {
            const v = e.target.value;
            setTimeInput(v);
            tryCommit(dateInput, v);
          }}
          onBlur={() => {
            const built = buildIsoFromDateAndTime(dateInput, timeInput);
            if (built) {
              const norm = splitIsoToDateAndTime(built, fallbackDate, fallbackTime);
              setTimeInput(norm.timePart);
            } else {
              setTimeInput(parsed.timePart);
            }
          }}
        />
      </div>
    </div>
  );
}

function resolveInitialTab(pathname = '', search = '') {
  const p = pathname.toLowerCase();
  if (/\/(chu-re|nha-trai|groom)(\/|$)/.test(p)) return 'groom';
  if (/\/(co-dau|nha-gai|bride)(\/|$)/.test(p)) return 'bride';
  const params = new URLSearchParams(search);
  const t = (params.get('tab') || '').toLowerCase();
  if (t === 'guests') return 'guests-bride';
  if (VALID_TAB_IDS.has(t)) return t;
  return 'dashboard';
}

function downloadCsv(filename, headers, rows) {
  const escapeCsv = (val) => {
    const s = String(val ?? '').replace(/"/g, '""');
    return `"${s}"`;
  };
  const csvContent =
    '\uFEFF' +
    [headers.map(escapeCsv).join(','), ...rows.map((r) => r.map(escapeCsv).join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Admin() {
  const location = useLocation();
  const navigate = useNavigate();
  const { settings, invitations, rsvps } = useCmsStore();
  const playlist = weddingConfig.playlist || [];

  const [activeTab, setActiveTab] = useState(() =>
    resolveInitialTab(location.pathname, location.search)
  );
  const [guestsMenuOpen, setGuestsMenuOpen] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Editable draft copy of CMS settings
  const [draft, setDraft] = useState(() => settings);
  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const isDirty = useMemo(() => {
    try {
      return JSON.stringify({ ...draft, updatedAt: null }) !== JSON.stringify({ ...settings, updatedAt: null });
    } catch {
      return false;
    }
  }, [draft, settings]);

  // Sync URL route (/admin/co-dau, /admin/chu-re) if navigated externally
  useEffect(() => {
    const target = resolveInitialTab(location.pathname, location.search);
    setActiveTab(target);
  }, [location.pathname, location.search]);

  const switchTab = (tabId) => {
    const resolved = tabId === 'guests' ? 'guests-bride' : tabId;
    setActiveTab(resolved);
    if (resolved === 'guests-bride' || resolved === 'guests-groom') {
      setGuestsMenuOpen(true);
    }
    setSidebarOpen(false);
    if (resolved === 'bride') {
      navigate('/admin/co-dau', { replace: true });
    } else if (resolved === 'groom') {
      navigate('/admin/chu-re', { replace: true });
    } else {
      navigate(resolved === 'dashboard' ? '/admin' : `/admin?tab=${resolved}`, { replace: true });
    }
  };

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToastMessage(''), 3000);
  }, []);

  // ── Shared Dashboard & Split-Studio Preview State ──
  const [sharedEditLang, setSharedEditLang] = useState('vi');
  const [previewSide, setPreviewSide] = useState('bride');
  const [previewLang, setPreviewLang] = useState('vi');
  const [previewDevice, setPreviewDevice] = useState('mobile');
  const [previewKey, setPreviewKey] = useState(1);

  const [sidePreviewLang, setSidePreviewLang] = useState('vi');
  const [sidePreviewDevice, setSidePreviewDevice] = useState('mobile');
  const [sideEnvelopeSealed, setSideEnvelopeSealed] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [dashActiveSection, setDashActiveSection] = useState('invitation');

  const editorPaneRef = useRef(null);
  const sideIframeRef = useRef(null);
  const dashIframeRef = useRef(null);
  const dashFormColRef = useRef(null);
  const lastScrollSyncRef = useRef({ sectionId: 'hero', progress: 0 });
  const jumpLockUntilRef = useRef(0);

  // Reset scroll & active section when switching between Bride and Groom tabs
  useEffect(() => {
    if (activeTab === 'bride' || activeTab === 'groom') {
      setActiveSection('hero');
      setSideEnvelopeSealed(false);
      lastScrollSyncRef.current = { sectionId: 'hero', progress: 0 };
      if (editorPaneRef.current) {
        editorPaneRef.current.scrollTop = 0;
      }
    }
  }, [activeTab]);

  // Keep Dashboard preview language synced when user changes Shared Content edit language
  useEffect(() => {
    setPreviewLang(sharedEditLang);
  }, [sharedEditLang]);

  const postToIframe = useCallback((iframeEl, payload) => {
    try {
      const win = iframeEl?.contentWindow;
      if (win && typeof window !== 'undefined') {
        win.postMessage(payload, window.location.origin);
      }
    } catch {
      // ignore cross-frame timing before mount
    }
  }, []);

  // Broadcast live `draft` changes immediately to whichever preview iframe is mounted!
  useEffect(() => {
    const payload = { type: 'WEDDING_CMS_PREVIEW_DRAFT', settings: draft };
    postToIframe(sideIframeRef.current, payload);
    postToIframe(dashIframeRef.current, payload);
  }, [draft, postToIframe]);

  // Listen for `WEDDING_PREVIEW_READY` from the preview iframe so it immediately receives draft + scroll position
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onMessage = (e) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === 'WEDDING_PREVIEW_READY') {
        const draftMsg = { type: 'WEDDING_CMS_PREVIEW_DRAFT', settings: draft };
        postToIframe(sideIframeRef.current, draftMsg);
        postToIframe(dashIframeRef.current, draftMsg);

        if (activeTab === 'bride' || activeTab === 'groom') {
          if (sideEnvelopeSealed) {
            postToIframe(sideIframeRef.current, {
              type: 'WEDDING_CMS_PREVIEW_ENVELOPE',
              sealed: true,
            });
          } else {
            postToIframe(sideIframeRef.current, {
              type: 'WEDDING_CMS_SYNC_SCROLL',
              sectionId: lastScrollSyncRef.current.sectionId || 'hero',
              progress: lastScrollSyncRef.current.progress || 0,
            });
          }
        }
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [draft, activeTab, sideEnvelopeSealed, postToIframe]);

  // ── Continuous Left-Pane Scroll -> Right-Preview Scroll Sync (Bride & Groom Studio) ──
  const handleStudioEditorScroll = useCallback(() => {
    if (performance.now() < jumpLockUntilRef.current) return;
    const pane = editorPaneRef.current;
    if (!pane) return;

    const maxScroll = Math.max(0, pane.scrollHeight - pane.clientHeight);
    const scrollTop = pane.scrollTop;
    const scrollRatio = maxScroll > 0 ? Math.max(0, Math.min(1, scrollTop / maxScroll)) : 0;
    const endSweep = scrollRatio > 0.82 ? ((scrollRatio - 0.82) / 0.18) * 0.45 : 0;
    const probeY = scrollTop + pane.clientHeight * (0.15 + 0.18 * scrollRatio + endSweep);

    const cards = Array.from(pane.querySelectorAll('[data-preview-section]'));
    if (!cards.length) return;

    const paneRect = pane.getBoundingClientRect();
    let matchedCard = cards[0];
    let progress = 0;

    for (let i = 0; i < cards.length; i += 1) {
      const card = cards[i];
      const rect = card.getBoundingClientRect();
      const cardTop = rect.top - paneRect.top + scrollTop;
      const cardBottom = cardTop + Math.max(1, rect.height);

      if (probeY >= cardTop && probeY <= cardBottom) {
        matchedCard = card;
        progress = scrollTop <= 6 && i === 0 ? 0 : (probeY - cardTop) / Math.max(1, rect.height);
        break;
      }
      if (probeY > cardBottom) {
        matchedCard = card;
        progress = 1;
      }
    }

    const sectionId = matchedCard.getAttribute('data-preview-section') || 'hero';
    const clampedProgress = Math.max(0, Math.min(1, progress));

    setActiveSection((prev) => (prev === sectionId ? prev : sectionId));
    if (sideEnvelopeSealed) {
      setSideEnvelopeSealed(false);
    }

    lastScrollSyncRef.current = { sectionId, progress: clampedProgress };
    postToIframe(sideIframeRef.current, {
      type: 'WEDDING_CMS_SYNC_SCROLL',
      sectionId,
      progress: clampedProgress,
    });
  }, [postToIframe, sideEnvelopeSealed]);

  // Also sync immediately when focusing/clicking any input field inside a section card
  const handleStudioFocusCapture = useCallback(
    (e) => {
      const target = e.target;
      if (!target || typeof target.closest !== 'function') return;
      const explicitSection = target.getAttribute('data-preview-focus');
      const card = target.closest('[data-preview-section]');
      if (!card && !explicitSection) return;

      const sectionId = explicitSection || card.getAttribute('data-preview-section') || 'hero';
      let progress = 0;
      if (card && !explicitSection) {
        const cardRect = card.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        const relY = targetRect.top - cardRect.top;
        progress = relY < 85 ? 0 : Math.max(0, Math.min(0.95, relY / Math.max(1, cardRect.height)));
      }

      setActiveSection(sectionId);
      if (sideEnvelopeSealed) setSideEnvelopeSealed(false);
      lastScrollSyncRef.current = { sectionId, progress };
      postToIframe(sideIframeRef.current, {
        type: 'WEDDING_CMS_SYNC_SCROLL',
        sectionId,
        progress,
      });
    },
    [postToIframe, sideEnvelopeSealed]
  );

  const jumpToStudioSection = (sectionId) => {
    const pane = editorPaneRef.current;
    jumpLockUntilRef.current = performance.now() + 480;
    setActiveSection(sectionId);
    setSideEnvelopeSealed(false);
    lastScrollSyncRef.current = { sectionId, progress: 0 };
    postToIframe(sideIframeRef.current, {
      type: 'WEDDING_CMS_SYNC_SCROLL',
      sectionId,
      progress: 0,
    });

    if (!pane) return;
    const card = pane.querySelector(`[data-preview-section="${sectionId}"]`);
    if (card) {
      const paneRect = pane.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const jumpBar = pane.querySelector('[data-jump-bar="1"]');
      const barOffset = (jumpBar ? jumpBar.offsetHeight : 44) + 12;
      const targetTop =
        sectionId === 'hero'
          ? 0
          : Math.max(0, cardRect.top - paneRect.top + pane.scrollTop - barOffset);
      pane.scrollTo({ top: targetTop, behavior: 'smooth' });
    }
  };

  const toggleEnvelopePreview = () => {
    const nextSealed = !sideEnvelopeSealed;
    setSideEnvelopeSealed(nextSealed);
    if (nextSealed) {
      postToIframe(sideIframeRef.current, {
        type: 'WEDDING_CMS_PREVIEW_ENVELOPE',
        sealed: true,
      });
    } else {
      postToIframe(sideIframeRef.current, {
        type: 'WEDDING_CMS_PREVIEW_ENVELOPE',
        sealed: false,
      });
      postToIframe(sideIframeRef.current, {
        type: 'WEDDING_CMS_SYNC_SCROLL',
        sectionId: activeSection || 'hero',
        progress: 0,
      });
    }
  };

  // ── Dashboard Scroll & Focus Sync (Shared Content -> #invitation/#countdown/#rsvp, Footer -> #footer) ──
  useEffect(() => {
    if (activeTab !== 'dashboard' || typeof window === 'undefined') return undefined;
    const onWinScroll = () => {
      const col = dashFormColRef.current;
      if (!col) return;
      const cards = Array.from(col.querySelectorAll('[data-preview-section]'));
      if (!cards.length) return;
      const probe = window.innerHeight * 0.36;
      let matched = cards[0];
      let progress = 0;
      for (const card of cards) {
        const rect = card.getBoundingClientRect();
        if (rect.top <= probe && rect.bottom >= probe) {
          matched = card;
          progress = Math.max(0, Math.min(1, (probe - rect.top) / Math.max(1, rect.height)));
          break;
        }
        if (rect.top < probe) {
          matched = card;
          progress = 1;
        }
      }
      const sectionId = matched.getAttribute('data-preview-section') || 'invitation';
      setDashActiveSection((prev) => (prev === sectionId ? prev : sectionId));
      postToIframe(dashIframeRef.current, {
        type: 'WEDDING_CMS_SYNC_SCROLL',
        sectionId,
        progress,
      });
    };
    window.addEventListener('scroll', onWinScroll, { passive: true });
    return () => window.removeEventListener('scroll', onWinScroll);
  }, [activeTab, postToIframe]);

  const handleDashFocusCapture = useCallback(
    (e) => {
      const target = e.target;
      if (!target || typeof target.closest !== 'function') return;
      const explicitSection = target.getAttribute('data-preview-focus');
      const card = target.closest('[data-preview-section]');
      const sectionId =
        explicitSection || card?.getAttribute('data-preview-section') || 'invitation';
      setDashActiveSection(sectionId);
      postToIframe(dashIframeRef.current, {
        type: 'WEDDING_CMS_SYNC_SCROLL',
        sectionId,
        progress: 0,
      });
    },
    [postToIframe]
  );

  // ── Audio Preview Player & Unified 285-Song Filter/Sort (Music & Guest tabs) ──
  const [previewSongId, setPreviewSongId] = useState(null);
  const previewAudioRef = useRef(null);
  const [musicCategory, setMusicCategory] = useState('all');
  const [musicSearch, setMusicSearch] = useState('');
  const [musicSort, setMusicSort] = useState('default');
  const guestMusicListRef = useRef(null);

  useEffect(() => {
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current.src = '';
      }
    };
  }, []);

  const handleTogglePreview = (e, song) => {
    if (e) e.stopPropagation();
    if (!song) return;
    if (previewSongId === song.id) {
      previewAudioRef.current?.pause();
      setPreviewSongId(null);
      return;
    }
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }
    const audio = new Audio(song.src);
    audio.onended = () => setPreviewSongId(null);
    audio.onerror = () => {
      if (song.fallbackSrc && audio.src !== song.fallbackSrc) {
        audio.src = song.fallbackSrc;
        audio.play().catch(() => setPreviewSongId(null));
      } else {
        setPreviewSongId(null);
        showToast('Không thể phát bản nghe thử này.');
      }
    };
    audio
      .play()
      .then(() => setPreviewSongId(song.id))
      .catch(() => setPreviewSongId(null));
    previewAudioRef.current = audio;
  };

  // ── Music Filter & Sort Logic (All 285 tracks) ──
  const matchSongCategory = useCallback((song, catId) => {
    if (!catId || catId === 'all') return true;
    const c = song.country || '';
    if (catId === 'hoa-tau') return song.category === 'hoa-tau';
    if (catId === 'don-khach') return song.category === 'don-khach';
    if (catId === 'classic') return song.category === 'classic';
    if (catId === 'vietnam') return song.region === 'vietnam' || c.includes('Việt Nam');
    if (catId === 'au-my') {
      return (
        song.region === 'au-my' ||
        (!song.region && c === 'Âu - Mỹ') ||
        /^(Mỹ|Anh|Canada|Ireland|Anh \/ Quốc tế)$/.test(c)
      );
    }
    if (catId === 'trung-quoc') {
      return song.region === 'trung-quoc' || /Trung Quốc|Đài Loan|Hong Kong/.test(c);
    }
    if (catId === 'han-quoc') return song.region === 'han-quoc' || c.includes('Hàn Quốc');
    if (catId === 'nhat-ban') return song.region === 'nhat-ban' || c.includes('Nhật Bản');
    if (catId === 'thai-lan') return song.region === 'thai-lan' || c.includes('Thái Lan');
    if (catId === 'an-do') return song.region === 'an-do' || c.includes('Ấn Độ');
    if (catId === 'phap') return c.includes('Pháp');
    if (catId === 'y') return /(^|\s|\/)Ý($|\s|\/)/.test(c) || c === 'Ý';
    if (catId === 'au-co-dien') {
      return song.region === 'phap-y' && !c.includes('Pháp') && !((/(^|\s|\/)Ý($|\s|\/)/.test(c)) || c === 'Ý');
    }
    if (catId === 'latin') {
      return (
        song.region === 'latin' ||
        /Mexico|Brazil|Tây Ban Nha|Colombia|Dominica|Puerto Rico/.test(c)
      );
    }
    return true;
  }, []);

  const musicCategories = useMemo(
    () => [
      { id: 'all', label: 'Tất Cả', count: playlist.length },
      { id: 'vietnam', label: '🇻🇳 Việt Nam', count: playlist.filter((s) => matchSongCategory(s, 'vietnam')).length },
      { id: 'au-my', label: '🇺🇸 Âu - Mỹ', count: playlist.filter((s) => matchSongCategory(s, 'au-my')).length },
      { id: 'trung-quoc', label: '🇨🇳 Hoa Ngữ', count: playlist.filter((s) => matchSongCategory(s, 'trung-quoc')).length },
      { id: 'han-quoc', label: '🇰🇷 Hàn Quốc', count: playlist.filter((s) => matchSongCategory(s, 'han-quoc')).length },
      { id: 'nhat-ban', label: '🇯🇵 Nhật Bản', count: playlist.filter((s) => matchSongCategory(s, 'nhat-ban')).length },
      { id: 'thai-lan', label: '🇹🇭 Thái Lan', count: playlist.filter((s) => matchSongCategory(s, 'thai-lan')).length },
      { id: 'an-do', label: '🇮🇳 Ấn Độ', count: playlist.filter((s) => matchSongCategory(s, 'an-do')).length },
      { id: 'phap', label: '🇫🇷 Pháp', count: playlist.filter((s) => matchSongCategory(s, 'phap')).length },
      { id: 'y', label: '🇮🇹 Ý', count: playlist.filter((s) => matchSongCategory(s, 'y')).length },
      { id: 'latin', label: '💃 Latin', count: playlist.filter((s) => matchSongCategory(s, 'latin')).length },
      { id: 'hoa-tau', label: '🎻 Hòa Tấu / Phim', count: playlist.filter((s) => matchSongCategory(s, 'hoa-tau')).length },
      { id: 'don-khach', label: '🎧 Mở Thiệp', count: playlist.filter((s) => matchSongCategory(s, 'don-khach')).length },
      { id: 'classic', label: '✨ Kinh Điển', count: playlist.filter((s) => matchSongCategory(s, 'classic')).length },
    ],
    [playlist, matchSongCategory]
  );

  const filteredPlaylist = useMemo(() => {
    const fold = (str = '') =>
      String(str)
        .normalize('NFD')
        .toLowerCase()
        .replace(/\p{M}/gu, '')
        .replace(/đ/g, 'd');

    const qRaw = musicSearch.trim().toLowerCase().replace(/^#/, '');
    const qFold = fold(qRaw);

    const list = playlist.filter((song, idx) => {
      if (!matchSongCategory(song, musicCategory)) return false;

      if (qRaw) {
        const sttNum = String(song.stt || idx + 1);
        if (sttNum === qRaw) return true;
        const hayRaw = `${sttNum} ${song.title} ${song.artist} ${song.tag || ''} ${song.country || ''} ${song.id}`.toLowerCase();
        if (hayRaw.includes(qRaw)) return true;
        return fold(hayRaw).includes(qFold);
      }
      return true;
    });

    if (musicSort === 'title') {
      return [...list].sort((a, b) => String(a.title || '').localeCompare(String(b.title || ''), 'vi'));
    }
    if (musicSort === 'artist') {
      return [...list].sort((a, b) => String(a.artist || '').localeCompare(String(b.artist || ''), 'vi'));
    }
    return list;
  }, [playlist, musicCategory, musicSearch, musicSort, matchSongCategory]);

  const globalDefaultSong = useMemo(() => {
    const id = settings?.music?.defaultSongId || weddingConfig.music?.id || 'young-and-beautiful';
    return playlist.find((s) => s.id === id) || playlist[0];
  }, [playlist, settings?.music?.defaultSongId]);

  const brideDefaultSong = useMemo(() => {
    const id = settings?.music?.brideDefaultSongId;
    return id ? playlist.find((s) => s.id === id) : null;
  }, [playlist, settings?.music?.brideDefaultSongId]);

  const groomDefaultSong = useMemo(() => {
    const id = settings?.music?.groomDefaultSongId;
    return id ? playlist.find((s) => s.id === id) : null;
  }, [playlist, settings?.music?.groomDefaultSongId]);

  const handleSetDefaultMusic = async (songId, scope = 'all') => {
    const currentMusic = settings?.music || {};
    let nextMusic;
    if (scope === 'bride') {
      nextMusic = { ...currentMusic, brideDefaultSongId: songId };
    } else if (scope === 'groom') {
      nextMusic = { ...currentMusic, groomDefaultSongId: songId };
    } else {
      nextMusic = {
        defaultSongId: songId,
        brideDefaultSongId: '',
        groomDefaultSongId: '',
      };
    }
    await saveCmsSettings({ ...settings, music: nextMusic });
    const found = playlist.find((s) => s.id === songId);
    const scopeLabel =
      scope === 'bride'
        ? 'Thiệp Cô dâu'
        : scope === 'groom'
          ? 'Thiệp Chú rể'
          : 'Mặc định cả 2 thiệp';
    showToast(`✓ Đã đặt "${found?.title || songId}" làm nhạc nền (${scopeLabel})!`);
    setPreviewKey((k) => k + 1);
  };

  // ── Guest Link Builder State (Separated Clearly Between Bride & Groom) ──
  const isGuestTab = activeTab === 'guests-bride' || activeTab === 'guests-groom';
  const guestCardSide = activeTab === 'guests-groom' ? 'groom' : 'bride';
  const activePresets = guestCardSide === 'groom' ? GROOM_INVITER_PRESETS : BRIDE_INVITER_PRESETS;
  const [inviterBySide, setInviterBySide] = useState({
    bride: BRIDE_INVITER_PRESETS[0],
    groom: GROOM_INVITER_PRESETS[0],
  });
  const [customInviterBySide, setCustomInviterBySide] = useState({ bride: '', groom: '' });
  const [isCustomBySide, setIsCustomBySide] = useState({ bride: false, groom: false });
  const [guestNameBySide, setGuestNameBySide] = useState({ bride: '', groom: '' });
  const [selectedLangBySide, setSelectedLangBySide] = useState({ bride: 'vi', groom: 'vi' });
  const [selectedSongBySide, setSelectedSongBySide] = useState({
    bride: '',
    groom: '',
  });
  const guestInputRef = useRef(null);
  const qrRef = useRef(null);

  const inviter = inviterBySide[guestCardSide];
  const customInviter = customInviterBySide[guestCardSide];
  const isCustomInviter = isCustomBySide[guestCardSide];
  const guestName = guestNameBySide[guestCardSide];
  const selectedLang = selectedLangBySide[guestCardSide];

  const defaultSongIdForGuestSide =
    (guestCardSide === 'groom'
      ? settings?.music?.groomDefaultSongId
      : settings?.music?.brideDefaultSongId) ||
    settings?.music?.defaultSongId ||
    'young-and-beautiful';

  const selectedSongId = selectedSongBySide[guestCardSide] || defaultSongIdForGuestSide;

  const setInviter = (val) =>
    setInviterBySide((prev) => ({ ...prev, [guestCardSide]: val }));
  const setCustomInviter = (val) =>
    setCustomInviterBySide((prev) => ({ ...prev, [guestCardSide]: val }));
  const setIsCustomInviter = (val) =>
    setIsCustomBySide((prev) => ({ ...prev, [guestCardSide]: val }));
  const setGuestName = (updater) =>
    setGuestNameBySide((prev) => ({
      ...prev,
      [guestCardSide]: typeof updater === 'function' ? updater(prev[guestCardSide]) : updater,
    }));
  const setSelectedLang = (val) =>
    setSelectedLangBySide((prev) => ({ ...prev, [guestCardSide]: val }));
  const setSelectedSongId = (val) =>
    setSelectedSongBySide((prev) => ({ ...prev, [guestCardSide]: val }));

  const activeInviter = isCustomInviter
    ? customInviter.trim() || (guestCardSide === 'groom' ? 'Gia đình Nhà Trai' : 'Gia đình Nhà Gái')
    : inviter;
  const activeSong =
    playlist.find((s) => s.id === selectedSongId) || globalDefaultSong || playlist[0];
  const activeLangObj =
    LANGUAGE_OPTIONS.find((l) => l.code === selectedLang) || LANGUAGE_OPTIONS[0];

  const baseUrl =
    typeof window !== 'undefined' ? window.location.origin : 'https://wedding.dinhhuy-thuhien.love';

  const generatedUrl = useMemo(() => {
    if (!guestName.trim()) return '';
    const params = new URLSearchParams();
    setSafeInvitationParams(params, {
      guestName: guestName.trim(),
      inviter: activeInviter,
      songId: selectedSongId,
      lang: selectedLang,
    });
    const routePath = guestCardSide === 'groom' ? '/chu-re' : '/';
    return `${baseUrl}${routePath}?${params.toString()}`;
  }, [guestName, activeInviter, selectedSongId, selectedLang, baseUrl, guestCardSide]);

  const handleAddPrefix = (prefix) => {
    const isZhSuffix = selectedLang === 'zh' && ZH_SUFFIX_HONORIFICS.has(prefix);
    setGuestName((prev) => {
      const trimmed = prev.trim();
      if (isZhSuffix) {
        if (!trimmed) {
          requestAnimationFrame(() => {
            if (guestInputRef.current) {
              guestInputRef.current.focus();
              guestInputRef.current.setSelectionRange(0, 0);
            }
          });
          return prefix;
        }
        if (trimmed.endsWith(prefix)) return trimmed;
        if (trimmed.startsWith(prefix) && trimmed.length > prefix.length) {
          return `${trimmed.slice(prefix.length).trim()}${prefix}`;
        }
        return `${trimmed}${prefix}`;
      }
      const sep = selectedLang === 'zh' ? '' : ' ';
      if (!trimmed) return `${prefix}${sep}`;
      if (trimmed.toLowerCase().startsWith(prefix.toLowerCase())) return trimmed;
      return `${prefix}${sep}${trimmed}`;
    });
  };

  const handleCreateAndCopyLink = async () => {
    if (!generatedUrl || !guestName.trim()) return;
    try {
      await navigator.clipboard.writeText(generatedUrl);
      await recordCreatedInvitation({
        side: guestCardSide,
        guestName: guestName.trim(),
        inviter: activeInviter,
        lang: selectedLang,
        langLabel: activeLangObj.name,
        langFlag: activeLangObj.flag,
        songId: activeSong.id,
        songTitle: activeSong.title,
        songArtist: activeSong.artist,
        url: generatedUrl,
      });
      showToast(`✓ Đã tạo thiệp mới & sao chép link cho "${guestName.trim()}"!`);
    } catch {
      showToast('Không thể tự động sao chép. Vui lòng chọn và sao chép link thủ công.');
    }
  };

  const handleReCopyExistingLink = async (url, label) => {
    try {
      await navigator.clipboard.writeText(url);
      showToast(`✓ Đã sao chép lại link mời của "${label}"!`);
    } catch {
      showToast('Không thể tự động sao chép link.');
    }
  };

  const handleCopyMessage = async () => {
    if (!generatedUrl || !guestName.trim()) return;
    const cleanGuest = guestName.trim();
    const enGuest = cleanGuest.replace(/^dear\s+/i, '').trim() || cleanGuest;
    const zhGreeting = /^(亲爱的|尊敬的)/.test(cleanGuest)
      ? `${cleanGuest}：`
      : `${cleanGuest}，您好：`;
    const isGroom = guestCardSide === 'groom';
    let msg = '';

    if (isGroom) {
      if (selectedLang === 'en') {
        msg = `Dear ${enGuest},\n\nOur family warmly invites you to the evening banquet celebrating the wedding of Dinh Huy and Thu Hien at White Palace (588 Pham Van Dong, Hiep Binh Chanh Ward, Thu Duc City, Ho Chi Minh City) on Sunday, January 24, 2027. Guest welcome is at 17:30 PM and dinner begins at 19:30 PM.\n\n🎵 Dedicated melody for you: "${activeSong.title}" - ${activeSong.artist}\n✨ Open your personalized English wedding invitation here:\n${generatedUrl}\n\nYour presence would be a great honor and joy for our family.`;
      } else if (selectedLang === 'zh') {
        msg = `${zhGreeting}\n\n谨以满怀喜悦之心，我们全家诚挚邀请您莅临 White Palace 宴会厅（胡志明市守德市协平政坊范文同街 588 号）参加${chineseNames.groom.shortName}与${chineseNames.bride.shortName}的新婚晚宴（2027年01月24日 星期日 17:30 PM 迎宾接待 · 19:30 PM 晚宴开席）！\n\n🎵 为您专属挑选的旋律：《${activeSong.title}》- ${activeSong.artist}\n✨ 点击开启您的专属中文电子婚礼请柬：\n${generatedUrl}\n\n您的莅临是我们全家的荣幸，也将为我们带来无比的喜悦！`;
      } else {
        msg = `Trân trọng kính mời ${cleanGuest} đến tham dự tiệc tối mừng Lễ Thành Hôn của Đình Huy & Thu Hiền tại Nhà Hàng White Palace — 588 Phạm Văn Đồng, Phường Hiệp Bình Chánh, TP. Thủ Đức, TP. Hồ Chí Minh (17:30 PM đón khách, 19:30 PM khai tiệc tối — Chủ Nhật, ngày 24/01/2027)!\n\n🎵 Giai điệu dành riêng cho ${cleanGuest}: "${activeSong.title}" - ${activeSong.artist}\n✨ Xem thiệp mời cưới online tại đây:\n${generatedUrl}\n\nSự hiện diện của ${cleanGuest} là niềm vinh hạnh và hạnh phúc lớn của gia đình chúng mình!`;
      }
    } else if (selectedLang === 'en') {
      msg = `Dear ${enGuest},\n\nOur family warmly invites you to celebrate the wedding of Thu Hien and Dinh Huy at the bride's family home on Sunday, January 17, 2027. Guest welcome is at 10:30 AM, the bride's wedding ceremony is at 11:20 AM, and the wedding lunch is at 11:45 AM.\n\n🎵 Dedicated melody for you: "${activeSong.title}" - ${activeSong.artist}\n✨ Open your personalized English wedding invitation here:\n${generatedUrl}\n\nYour presence would be a great honor and joy for our family.`;
    } else if (selectedLang === 'zh') {
      msg = `${zhGreeting}\n\n谨以满怀喜悦之心，我们全家诚挚邀请您莅临参加${chineseNames.bride.shortName}与${chineseNames.groom.shortName}的女方婚礼仪式暨喜宴（2027年01月17日 星期日 上午 10:30 喜迎宾客 · 上午 11:20 女方婚礼仪式 · 上午 11:45 喜宴开席）！\n\n🎵 为您专属挑选的旋律：《${activeSong.title}》- ${activeSong.artist}\n✨ 点击开启您的专属中文电子婚礼请柬：\n${generatedUrl}\n\n衷心期待您的光临，与我们全家共享这份珍贵的幸福时刻！`;
    } else {
      msg = `Trân trọng kính mời ${cleanGuest} đến tham dự tiệc mừng Lễ Vu Quy của Thu Hiền & Đình Huy (Chủ Nhật, ngày 17/01/2027)!\n\n🎵 Giai điệu dành riêng cho ${cleanGuest}: "${activeSong.title}" - ${activeSong.artist}\n✨ Xem thiệp mời cưới online tại đây:\n${generatedUrl}\n\nSự hiện diện của ${cleanGuest} là niềm vinh hạnh và hạnh phúc lớn của gia đình chúng mình!`;
    }

    try {
      await navigator.clipboard.writeText(msg);
      showToast(`✓ Đã sao chép mẫu lời mời (${activeLangObj.name})!`);
    } catch {
      showToast('Không thể sao chép văn bản.');
    }
  };

  const handleDownloadQr = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    const sideSlug = guestCardSide === 'groom' ? 'ChuRe' : 'CoDau';
    a.download = `QR-Thiep-${sideSlug}-${guestName.trim().replace(/\s+/g, '-') || 'Khach'}-${selectedLang.toUpperCase()}.png`;
    a.click();
    showToast('✓ Đã tải ảnh mã QR về máy!');
  };

  // ── Created Invitations Filtering & Pagination (Scoped Strictly to Active Bride / Groom Guest Page) ──
  const [invSearch, setInvSearch] = useState('');
  const [invPage, setInvPage] = useState(1);
  const INV_PAGE_SIZE = 10;

  useEffect(() => {
    setInvPage(1);
    setInvSearch('');
  }, [guestCardSide]);

  const filteredInvitations = useMemo(() => {
    const q = invSearch.trim().toLowerCase();
    return invitations.filter((item) => {
      const itemSide = item.side === 'groom' ? 'groom' : 'bride';
      if (itemSide !== guestCardSide) return false;
      if (q) {
        const hay = `${item.guestName || ''} ${item.inviter || ''} ${item.songTitle || ''}`.toLowerCase();
        return hay.includes(q);
      }
      return true;
    });
  }, [invitations, guestCardSide, invSearch]);

  const totalInvPages = Math.max(1, Math.ceil(filteredInvitations.length / INV_PAGE_SIZE));
  const safeInvPage = Math.min(invPage, totalInvPages);
  const pagedInvitations = useMemo(() => {
    const start = (safeInvPage - 1) * INV_PAGE_SIZE;
    return filteredInvitations.slice(start, start + INV_PAGE_SIZE);
  }, [filteredInvitations, safeInvPage]);

  // ── RSVP Confirmations Filtering & Pagination ──
  const [rsvpFilter, setRsvpFilter] = useState('all');
  const [rsvpSearch, setRsvpSearch] = useState('');
  const [rsvpPage, setRsvpPage] = useState(1);
  const RSVP_PAGE_SIZE = 10;

  const filteredRsvps = useMemo(() => {
    const q = rsvpSearch.trim().toLowerCase();
    return rsvps.filter((item) => {
      if (rsvpFilter !== 'all' && item.invitationType !== rsvpFilter) return false;
      if (q) {
        const hay = `${item.fullName || ''} ${item.side || ''}`.toLowerCase();
        return hay.includes(q);
      }
      return true;
    });
  }, [rsvps, rsvpFilter, rsvpSearch]);

  const totalRsvpPages = Math.max(1, Math.ceil(filteredRsvps.length / RSVP_PAGE_SIZE));
  const safeRsvpPage = Math.min(rsvpPage, totalRsvpPages);
  const pagedRsvps = useMemo(() => {
    const start = (safeRsvpPage - 1) * RSVP_PAGE_SIZE;
    return filteredRsvps.slice(start, start + RSVP_PAGE_SIZE);
  }, [filteredRsvps, safeRsvpPage]);

  // ── Derived Metrics ──
  const brideInvCount = useMemo(
    () => invitations.filter((x) => x.side !== 'groom').length,
    [invitations]
  );
  const groomInvCount = useMemo(
    () => invitations.filter((x) => x.side === 'groom').length,
    [invitations]
  );
  const brideRsvpCount = useMemo(
    () => rsvps.filter((x) => x.invitationType !== 'groom').length,
    [rsvps]
  );
  const groomRsvpCount = useMemo(
    () => rsvps.filter((x) => x.invitationType === 'groom').length,
    [rsvps]
  );

  const lastUpdatedLabel = useMemo(() => {
    if (!settings?.updatedAt) return 'Mặc định gốc';
    try {
      return new Date(settings.updatedAt).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Vừa xong';
    }
  }, [settings?.updatedAt]);

  // ── Handlers for Draft Updates & Persistence ──
  const updateSharedField = (lang, key, value) => {
    setDraft((prev) => ({
      ...prev,
      shared: {
        ...prev.shared,
        [lang]: {
          ...(prev.shared?.[lang] || {}),
          [key]: value,
        },
      },
    }));
  };

  const UNIVERSAL_SIDE_FIELDS = useMemo(
    () => new Set(['dateShort', 'isoDate', 'phone', 'dob', 'googleMapsUrl', 'embedMapUrl']),
    []
  );

  const updateSideField = (sideKey, field, value, lang = sidePreviewLang) => {
    setDraft((prev) => {
      const sidePrev = prev[sideKey] || {};
      if (lang === 'vi' || UNIVERSAL_SIDE_FIELDS.has(field)) {
        return {
          ...prev,
          [sideKey]: {
            ...sidePrev,
            [field]: value,
          },
        };
      }
      return {
        ...prev,
        [sideKey]: {
          ...sidePrev,
          i18n: {
            ...(sidePrev.i18n || {}),
            [lang]: {
              ...(sidePrev.i18n?.[lang] || {}),
              [field]: value,
            },
          },
        },
      };
    });
  };

  const updateScheduleItem = (sideKey, index, field, value, lang = sidePreviewLang) => {
    setDraft((prev) => {
      const sidePrev = prev[sideKey] || {};
      if (lang === 'vi') {
        const list = [...(sidePrev.scheduleItems || [])];
        list[index] = { ...(list[index] || {}), [field]: value };
        return {
          ...prev,
          [sideKey]: { ...sidePrev, scheduleItems: list },
        };
      }
      const langBranch = sidePrev.i18n?.[lang] || {};
      const list = [...(langBranch.scheduleItems || [])];
      list[index] = { ...(list[index] || {}), [field]: value };
      return {
        ...prev,
        [sideKey]: {
          ...sidePrev,
          i18n: {
            ...(sidePrev.i18n || {}),
            [lang]: { ...langBranch, scheduleItems: list },
          },
        },
      };
    });
  };

  const addScheduleItem = (sideKey, lang = sidePreviewLang) => {
    const newEntry =
      lang === 'en'
        ? { time: '18:00 PM', title: 'NEW EVENT', detail: 'Activity description...' }
        : lang === 'zh'
          ? { time: '18:00 PM', title: '新环节', detail: '活动详情...' }
          : { time: '18:00 PM', title: 'MỤC MỚI', detail: 'Mô tả hoạt động...' };

    setDraft((prev) => {
      const sidePrev = prev[sideKey] || {};
      if (lang === 'vi') {
        return {
          ...prev,
          [sideKey]: {
            ...sidePrev,
            scheduleItems: [...(sidePrev.scheduleItems || []), newEntry],
          },
        };
      }
      const langBranch = sidePrev.i18n?.[lang] || {};
      return {
        ...prev,
        [sideKey]: {
          ...sidePrev,
          i18n: {
            ...(sidePrev.i18n || {}),
            [lang]: {
              ...langBranch,
              scheduleItems: [...(langBranch.scheduleItems || []), newEntry],
            },
          },
        },
      };
    });
  };

  const removeScheduleItem = (sideKey, index, lang = sidePreviewLang) => {
    setDraft((prev) => {
      const sidePrev = prev[sideKey] || {};
      if (lang === 'vi') {
        const list = (sidePrev.scheduleItems || []).filter((_, idx) => idx !== index);
        return {
          ...prev,
          [sideKey]: { ...sidePrev, scheduleItems: list },
        };
      }
      const langBranch = sidePrev.i18n?.[lang] || {};
      const list = (langBranch.scheduleItems || []).filter((_, idx) => idx !== index);
      return {
        ...prev,
        [sideKey]: {
          ...sidePrev,
          i18n: {
            ...(sidePrev.i18n || {}),
            [lang]: { ...langBranch, scheduleItems: list },
          },
        },
      };
    });
  };

  const handleSaveSettings = async (label = 'cấu hình thiệp') => {
    await saveCmsSettings(draft);
    showToast(`✓ Đã lưu cập nhật ${label} thành công!`);
  };

  const handleResetAllSettings = async () => {
    if (
      window.confirm(
        'Khôi phục toàn bộ nội dung thiệp Cô dâu, Chú rể, Footer và Nhạc nền về mặc định ban đầu?'
      )
    ) {
      const fresh = await resetCmsSettings();
      setDraft(fresh);
      setPreviewKey((k) => k + 1);
      showToast('✓ Đã khôi phục cấu hình mặc định!');
    }
  };

  // Dashboard Live Preview URL (?preview=1 enables live postMessage draft & scroll sync)
  const previewUrl = useMemo(() => {
    const path = previewSide === 'groom' ? '/chu-re' : '/';
    const params = new URLSearchParams();
    params.set('preview', '1');
    if (previewLang !== 'vi') params.set('lang', previewLang);
    return `${path}?${params.toString()}`;
  }, [previewSide, previewLang]);

  // Compact Single-Line Header Metadata
  const headerMeta = {
    dashboard: {
      title: 'Tổng quan hệ thống',
      badge: `Cập nhật: ${lastUpdatedLabel}`,
    },
    bride: {
      title: 'Chỉnh sửa Thiệp Cô dâu',
      badge: `${draft?.bride?.dateShort || '17.01.2027'} • Đã tạo ${brideInvCount} • RSVP ${brideRsvpCount}`,
    },
    groom: {
      title: 'Chỉnh sửa Thiệp Chú rể',
      badge: `${draft?.groom?.dateShort || '24.01.2027'} • Đã tạo ${groomInvCount} • RSVP ${groomRsvpCount}`,
    },
    music: {
      title: 'Nhạc nền mặc định',
      badge: `${playlist.length} bản nhạc (cao trào 6.00s)`,
    },
    'guests-bride': {
      title: 'Khách mời Cô dâu (Nhà Gái)',
      badge: `Lễ Vu Quy ${draft?.bride?.dateShort || '17.01.2027'} • Đã tạo ${brideInvCount} thiệp`,
    },
    'guests-groom': {
      title: 'Khách mời Chú rể (Nhà Trai)',
      badge: `Lễ Thành Hôn ${draft?.groom?.dateShort || '24.01.2027'} • Đã tạo ${groomInvCount} thiệp`,
    },
    rsvp: {
      title: 'Xác nhận tham dự (RSVP)',
      badge: `${rsvps.length} lượt xác nhận`,
    },
  }[activeTab] || { title: 'Quản trị thiệp cưới', badge: '' };

  const isStudioTab = activeTab === 'bride' || activeTab === 'groom';

  // ═══════════════════════════════════════════════════════════════════════════
  // SPLIT-SCREEN SCROLL-SYNC STUDIO FOR BRIDE & GROOM INVITATIONS
  // Left: Ordered Section Editor | Right: Full-Height Scroll-Synced Live Preview
  // ═══════════════════════════════════════════════════════════════════════════
  const renderSideStudio = (sideKey) => {
    const isGroom = sideKey === 'groom';
    const sideBase = draft?.[sideKey] || {};
    // Resolve active localized view (VI / EN / ZH) merged over universal fields (dateShort, isoDate, phone, dob, map URLs)
    const sideObj =
      sidePreviewLang === 'vi'
        ? sideBase
        : {
            ...sideBase,
            ...(sideBase.i18n?.[sidePreviewLang] || {}),
          };
    const editLangMeta =
      LANGUAGE_OPTIONS.find((l) => l.code === sidePreviewLang) || LANGUAGE_OPTIONS[0];
    const livePath = isGroom ? '/chu-re' : '/';
    const sideIframeSrc = `${livePath}?preview=1${
      sidePreviewLang !== 'vi' ? `&lang=${sidePreviewLang}` : ''
    }`;

    return (
      <div
        className={`${styles.studioSplitLayout} ${
          sidePreviewDevice === 'desktop' ? styles.studioSplitDesktop : ''
        }`}
      >
        {/* LEFT PANE: Independently Scrollable Editor Ordered 1:1 With Invitation Sections */}
        <div
          ref={editorPaneRef}
          className={styles.studioEditorPane}
          onScroll={handleStudioEditorScroll}
          onFocusCapture={handleStudioFocusCapture}
        >
          {/* Sticky Section Quick-Jump Bar + Save Button Right Beside 6. RSVP */}
          <div data-jump-bar="1" className={styles.sectionJumpBar}>
            {SIDE_EDITOR_SECTIONS.map((sec) => (
              <button
                key={sec.id}
                type="button"
                className={`${styles.sectionJumpPill} ${
                  activeSection === sec.id ? styles.sectionJumpPillActive : ''
                }`}
                onClick={() => jumpToStudioSection(sec.id)}
              >
                {sec.short}
              </button>
            ))}

            <button
              type="button"
              className={styles.btnJumpBarSave}
              onClick={() =>
                handleSaveSettings(
                  `${isGroom ? 'Thiệp Chú rể' : 'Thiệp Cô dâu'} (${sidePreviewLang.toUpperCase()})`
                )
              }
            >
              <Save size={13} />
              <span>Lưu ({sidePreviewLang.toUpperCase()})</span>
            </button>

            <span className={styles.editingLangBadge}>
              {editLangMeta.flag} {editLangMeta.name}
            </span>
          </div>

          <div className={styles.studioCardsStack}>
            {/* 1. HERO / OPENING COVER (#hero) */}
            <section
              data-preview-section="hero"
              className={`${styles.studioCard} ${
                activeSection === 'hero' ? styles.studioCardActive : ''
              }`}
            >
              <div className={styles.studioCardHeader}>
                <span className={styles.studioStepNum}>1</span>
                <div>
                  <h3 className={styles.studioCardTitle}>
                    Bìa mở đầu &amp; Tên hiển thị ({isGroom ? 'Chú rể' : 'Cô dâu'})
                  </h3>
                  <p className={styles.studioCardHint}>
                    Hiển thị ngay trên trang đầu tiên của thiệp và mặt ngoài phong bì sáp.
                  </p>
                </div>
              </div>

              <div className={styles.fieldGrid2}>
                <div className={styles.fieldGroup}>
                  <label>Tên hiển thị ngắn (trên bìa mở đầu)</label>
                  <input
                    type="text"
                    className={styles.textInput}
                    value={sideObj.shortName || ''}
                    onChange={(e) => updateSideField(sideKey, 'shortName', e.target.value)}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label>Ngày cưới trên bìa (dd.mm.yyyy)</label>
                  <input
                    type="text"
                    className={styles.textInput}
                    value={sideObj.dateShort || ''}
                    onChange={(e) => updateSideField(sideKey, 'dateShort', e.target.value)}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label>Tên nghi lễ (trên phong bì)</label>
                  <input
                    type="text"
                    className={styles.textInput}
                    value={sideObj.ceremonyTitle || ''}
                    onChange={(e) => updateSideField(sideKey, 'ceremonyTitle', e.target.value)}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label>Tiêu đề thiệp</label>
                  <input
                    type="text"
                    className={styles.textInput}
                    value={sideObj.cardTitle || ''}
                    onChange={(e) => updateSideField(sideKey, 'cardTitle', e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* 2. COUNTDOWN (#countdown) */}
            <section
              data-preview-section="countdown"
              className={`${styles.studioCard} ${
                activeSection === 'countdown' ? styles.studioCardActive : ''
              }`}
            >
              <div className={styles.studioCardHeader}>
                <span className={styles.studioStepNum}>2</span>
                <div>
                  <h3 className={styles.studioCardTitle}>Khung Đếm ngược ngày cưới</h3>
                  <p className={styles.studioCardHint}>
                    Nhập theo định dạng dễ đọc <strong>yyyy-mm-dd</strong> và{' '}
                    <strong>giờ-phút-giây</strong> (tự động tính theo múi giờ Việt Nam).
                  </p>
                </div>
              </div>

              <CountdownDateTimeFields
                isoDate={sideObj.isoDate}
                isGroom={isGroom}
                onChangeIso={(nextIso) => updateSideField(sideKey, 'isoDate', nextIso)}
              />
            </section>

            {/* 3. FORMAL INVITATION & FAMILY (#invitation) */}
            <section
              data-preview-section="invitation"
              className={`${styles.studioCard} ${
                activeSection === 'invitation' ? styles.studioCardActive : ''
              }`}
            >
              <div className={styles.studioCardHeader}>
                <span className={styles.studioStepNum}>3</span>
                <div>
                  <h3 className={styles.studioCardTitle}>
                    Thiệp mời chính &amp; Gia đình {isGroom ? 'Nhà Trai' : 'Nhà Gái'}
                  </h3>
                  <p className={styles.studioCardHint}>
                    Thông tin song thân, họ tên đầy đủ, bộ lịch 3 ô, ngày âm lịch và địa điểm trên thiệp.
                  </p>
                </div>
              </div>

              <div className={styles.fieldGrid2}>
                <div className={styles.fieldGroup}>
                  <label>Họ và tên đầy đủ ({isGroom ? 'Chú rể' : 'Cô dâu'})</label>
                  <input
                    type="text"
                    className={styles.textInput}
                    value={sideObj.fullName || ''}
                    onChange={(e) => updateSideField(sideKey, 'fullName', e.target.value)}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label>Dòng Giờ &amp; Thứ trên thiệp chính</label>
                  <input
                    type="text"
                    className={styles.textInput}
                    value={sideObj.timeDayHeader || ''}
                    onChange={(e) => updateSideField(sideKey, 'timeDayHeader', e.target.value)}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label>Thông tin Cha</label>
                  <input
                    type="text"
                    className={styles.textInput}
                    value={sideObj.father || ''}
                    onChange={(e) => updateSideField(sideKey, 'father', e.target.value)}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label>Thông tin Mẹ</label>
                  <input
                    type="text"
                    className={styles.textInput}
                    value={sideObj.mother || ''}
                    onChange={(e) => updateSideField(sideKey, 'mother', e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.fieldGrid3}>
                <div className={styles.fieldGroup}>
                  <label>Ô Tháng (trái)</label>
                  <input
                    type="text"
                    className={styles.textInput}
                    value={sideObj.monthBox || ''}
                    onChange={(e) => updateSideField(sideKey, 'monthBox', e.target.value)}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label>Số Ngày lớn (giữa)</label>
                  <input
                    type="text"
                    className={styles.textInput}
                    value={sideObj.dayNumber || ''}
                    onChange={(e) => updateSideField(sideKey, 'dayNumber', e.target.value)}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label>Ô Năm (phải)</label>
                  <input
                    type="text"
                    className={styles.textInput}
                    value={sideObj.yearBox || ''}
                    onChange={(e) => updateSideField(sideKey, 'yearBox', e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.fieldGrid2}>
                <div className={styles.fieldGroup} style={{ marginBottom: 0 }}>
                  <label>Dòng Ngày Âm lịch</label>
                  <input
                    type="text"
                    className={styles.textInput}
                    value={sideObj.lunarDate || ''}
                    onChange={(e) => updateSideField(sideKey, 'lunarDate', e.target.value)}
                  />
                </div>
                <div className={styles.fieldGroup} style={{ marginBottom: 0 }}>
                  <label>Tên địa điểm in hoa (cuối thiệp chính)</label>
                  <input
                    type="text"
                    className={styles.textInput}
                    value={sideObj.venueHostName || ''}
                    onChange={(e) => updateSideField(sideKey, 'venueHostName', e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* 4. SCHEDULE / TIMELINE (#schedule) */}
            <section
              data-preview-section="schedule"
              className={`${styles.studioCard} ${
                activeSection === 'schedule' ? styles.studioCardActive : ''
              }`}
            >
              <div className={styles.panelHeaderFlex}>
                <div className={styles.studioCardHeader} style={{ marginBottom: 0 }}>
                  <span className={styles.studioStepNum}>4</span>
                  <div>
                    <h3 className={styles.studioCardTitle}>
                      Lịch trình buổi lễ ({(sideObj.scheduleItems || []).length} khung giờ)
                    </h3>
                    <p className={styles.studioCardHint}>
                      Hiển thị bên trong khung rèm nhung phần Lịch Trình.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.btnSmallOutline}
                  onClick={() => addScheduleItem(sideKey)}
                >
                  <Plus size={13} />
                  <span>Thêm mốc giờ</span>
                </button>
              </div>

              <div className={styles.scheduleEditorList}>
                {(sideObj.scheduleItems || []).map((item, idx) => (
                  <div key={idx} className={styles.scheduleEditorItem}>
                    <div className={styles.scheduleRowTop}>
                      <span className={styles.scheduleStepBadge}>Mốc #{idx + 1}</span>
                      {(sideObj.scheduleItems || []).length > 1 && (
                        <button
                          type="button"
                          className={styles.iconDangerBtn}
                          title="Xoá mốc giờ này"
                          onClick={() => removeScheduleItem(sideKey, idx)}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                    <div className={styles.fieldGrid2}>
                      <div className={styles.fieldGroup}>
                        <label>Giờ (VD: 10:30 AM / 17:30 PM)</label>
                        <input
                          type="text"
                          className={styles.textInput}
                          value={item.time || ''}
                          onChange={(e) => updateScheduleItem(sideKey, idx, 'time', e.target.value)}
                        />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label>Hoạt động</label>
                        <input
                          type="text"
                          className={styles.textInput}
                          value={item.title || ''}
                          onChange={(e) =>
                            updateScheduleItem(sideKey, idx, 'title', e.target.value)
                          }
                        />
                      </div>
                    </div>
                    <div className={styles.fieldGroup} style={{ marginBottom: 0 }}>
                      <label>Mô tả ngắn</label>
                      <input
                        type="text"
                        className={styles.textInput}
                        value={item.detail || ''}
                        onChange={(e) => updateScheduleItem(sideKey, idx, 'detail', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 5. VENUE, MAP & CONTACT (#venue) */}
            <section
              data-preview-section="venue"
              className={`${styles.studioCard} ${
                activeSection === 'venue' ? styles.studioCardActive : ''
              }`}
            >
              <div className={styles.studioCardHeader}>
                <span className={styles.studioStepNum}>5</span>
                <div>
                  <h3 className={styles.studioCardTitle}>Địa điểm, Bản đồ &amp; Liên hệ</h3>
                  <p className={styles.studioCardHint}>
                    Tiêu đề nghệ thuật phần Địa Điểm, khung bản đồ Google Maps và số Gọi điện nhanh.
                  </p>
                </div>
              </div>

              <div className={styles.fieldGrid2}>
                <div className={styles.fieldGroup}>
                  <label>Tên sảnh / Tư gia (chữ nghệ thuật)</label>
                  <input
                    type="text"
                    className={styles.textInput}
                    value={sideObj.venueHall || ''}
                    onChange={(e) => updateSideField(sideKey, 'venueHall', e.target.value)}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label>Số điện thoại liên hệ (nút Gọi điện)</label>
                  <input
                    type="text"
                    className={styles.textInput}
                    value={sideObj.phone || ''}
                    onChange={(e) => updateSideField(sideKey, 'phone', e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label>Dòng khu vực in hoa (dưới tiêu đề Địa Điểm)</label>
                <textarea
                  rows={2}
                  className={styles.textareaInput}
                  value={sideObj.regionCaps || ''}
                  onChange={(e) => updateSideField(sideKey, 'regionCaps', e.target.value)}
                />
              </div>

              <div className={styles.fieldGrid2}>
                <div className={styles.fieldGroup}>
                  <label>Địa chỉ đầy đủ</label>
                  <input
                    type="text"
                    className={styles.textInput}
                    value={sideObj.address || ''}
                    onChange={(e) => updateSideField(sideKey, 'address', e.target.value)}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label>Ngày sinh ({isGroom ? 'Chú rể' : 'Cô dâu'})</label>
                  <input
                    type="text"
                    className={styles.textInput}
                    value={sideObj.dob || ''}
                    onChange={(e) => updateSideField(sideKey, 'dob', e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.fieldGrid2}>
                <div className={styles.fieldGroup} style={{ marginBottom: 0 }}>
                  <label>Link nút Chỉ đường Google Maps</label>
                  <input
                    type="text"
                    className={styles.textInput}
                    value={sideObj.googleMapsUrl || ''}
                    onChange={(e) => updateSideField(sideKey, 'googleMapsUrl', e.target.value)}
                  />
                </div>
                <div className={styles.fieldGroup} style={{ marginBottom: 0 }}>
                  <label>Link nhúng bản đồ (Embed URL)</label>
                  <input
                    type="text"
                    className={styles.textInput}
                    value={sideObj.embedMapUrl || ''}
                    onChange={(e) => updateSideField(sideKey, 'embedMapUrl', e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* 6. RSVP DEADLINE (#rsvp) */}
            <section
              data-preview-section="rsvp"
              className={`${styles.studioCard} ${
                activeSection === 'rsvp' ? styles.studioCardActive : ''
              }`}
            >
              <div className={styles.studioCardHeader}>
                <span className={styles.studioStepNum}>6</span>
                <div>
                  <h3 className={styles.studioCardTitle}>Phiếu Xác nhận tham dự (RSVP)</h3>
                  <p className={styles.studioCardHint}>
                    Lời nhắc hạn chót xác nhận hiển thị ở đầu phiếu RSVP của khách.
                  </p>
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label>Lời nhắc hạn xác nhận tham dự</label>
                <textarea
                  rows={2}
                  className={styles.textareaInput}
                  value={sideObj.rsvpSubtitle || ''}
                  onChange={(e) => updateSideField(sideKey, 'rsvpSubtitle', e.target.value)}
                />
              </div>

              <div className={styles.panelFooterRight}>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  onClick={() => handleSaveSettings(isGroom ? 'Thiệp Chú rể' : 'Thiệp Cô dâu')}
                >
                  <Save size={15} />
                  <span>Lưu toàn bộ thông tin {isGroom ? 'Chú rể' : 'Cô dâu'}</span>
                </button>
              </div>
            </section>
          </div>
        </div>

        {/* RIGHT PANE: Sticky / Full-Height Scroll-Synced Live Preview */}
        <aside className={styles.studioPreviewPane}>
          <div className={styles.studioPreviewBar}>
            <div className={styles.syncStatusPill}>
              <span className={styles.syncLiveDot} />
              <span>
                {sideEnvelopeSealed
                  ? 'Phong bì ngoài'
                  : SECTION_LABELS[activeSection] || 'Xem trước'}
              </span>
            </div>

            <div className={styles.studioPreviewActions}>
              <button
                type="button"
                className={`${styles.envelopeToggleBtn} ${
                  sideEnvelopeSealed ? styles.envelopeToggleActive : ''
                }`}
                title="Chuyển đổi xem Phong bì đóng / Mở thiệp tự cuộn"
                onClick={toggleEnvelopePreview}
              >
                {sideEnvelopeSealed ? <BookOpen size={13} /> : <Mail size={13} />}
                <span>{sideEnvelopeSealed ? 'Mở thiệp' : 'Phong bì'}</span>
              </button>

              <div className={styles.langPillGroup}>
                {LANGUAGE_OPTIONS.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    className={`${styles.smallLangPill} ${
                      sidePreviewLang === l.code ? styles.smallLangPillActive : ''
                    }`}
                    onClick={() => setSidePreviewLang(l.code)}
                  >
                    {l.code.toUpperCase()}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className={`${styles.iconToggle} ${
                  sidePreviewDevice === 'mobile' ? styles.iconToggleActive : ''
                }`}
                title="Khung Điện thoại"
                onClick={() => setSidePreviewDevice('mobile')}
              >
                <Smartphone size={13} />
              </button>
              <button
                type="button"
                className={`${styles.iconToggle} ${
                  sidePreviewDevice === 'desktop' ? styles.iconToggleActive : ''
                }`}
                title="Khung Rộng"
                onClick={() => setSidePreviewDevice('desktop')}
              >
                <Monitor size={13} />
              </button>
              <button
                type="button"
                className={styles.iconBtn}
                title="Tải lại khung xem trước"
                onClick={() => setPreviewKey((k) => k + 1)}
              >
                <RefreshCw size={13} />
              </button>
            </div>
          </div>

          <div className={styles.studioPreviewStage}>
            <ScaledDeviceFrame
              device={sidePreviewDevice}
              src={sideIframeSrc}
              iframeKey={`${sideKey}-${sidePreviewLang}-${previewKey}`}
              iframeRef={sideIframeRef}
              title={`Preview ${sideKey}`}
              routeLabel={livePath}
            />
          </div>
        </aside>
      </div>
    );
  };

  return (
    <div className={`${styles.cmsLayout} ${isStudioTab ? styles.cmsLayoutLocked : ''}`}>
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div className={styles.sidebarOverlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* ═══════════════════════════════════════════════════
          COMPACT ROYAL NAVY SIDEBAR
          ═══════════════════════════════════════════════════ */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.brandBlock}>
          <div className={styles.monogramCrest}>
            <span>H</span>
            <span className={styles.monogramAmp}>&amp;</span>
            <span>H</span>
          </div>
          <div className={styles.brandSubtitle}>Thiệp cưới Hiền &amp; Huy</div>
          <div className={styles.brandDivider}>
            <span />
            <i>∞</i>
            <span />
          </div>
        </div>

        <nav className={styles.sidebarNav} aria-label="Điều hướng quản trị">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            if (item.children) {
              const isGroupActive = item.children.some((c) => c.id === activeTab);
              return (
                <div key={item.id} className={styles.navGroup}>
                  <button
                    type="button"
                    className={`${styles.navItem} ${
                      isGroupActive ? styles.navItemParentActive : ''
                    }`}
                    onClick={() => {
                      if (!isGroupActive) {
                        setGuestsMenuOpen(true);
                        switchTab(item.children[0].id);
                      } else {
                        setGuestsMenuOpen((o) => !o);
                      }
                    }}
                  >
                    <Icon size={17} className={styles.navIcon} />
                    <span>{item.label}</span>
                    {invitations.length > 0 && (
                      <span className={styles.navCountPill}>{invitations.length}</span>
                    )}
                    <ChevronDown
                      size={14}
                      className={`${styles.navChevron} ${
                        guestsMenuOpen ? styles.navChevronOpen : ''
                      }`}
                    />
                  </button>

                  {guestsMenuOpen && (
                    <div className={styles.subNavList}>
                      {item.children.map((sub) => {
                        const isSubActive = activeTab === sub.id;
                        const subCount =
                          sub.id === 'guests-groom' ? groomInvCount : brideInvCount;
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            className={`${styles.subNavItem} ${
                              isSubActive ? styles.subNavItemActive : ''
                            }`}
                            onClick={() => switchTab(sub.id)}
                          >
                            <span className={styles.subNavEmoji}>{sub.emoji}</span>
                            <span>{sub.label}</span>
                            <span className={styles.subNavCount}>{subCount}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                onClick={() => switchTab(item.id)}
              >
                <Icon size={17} className={styles.navIcon} />
                <span>{item.label}</span>
                {item.id === 'rsvp' && rsvps.length > 0 && (
                  <span className={styles.navCountPill}>{rsvps.length}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Compact Botanical Ginkgo Artwork */}
        <div className={styles.sidebarBotanical} aria-hidden="true">
          <svg viewBox="0 0 220 120" fill="none" className={styles.ginkgoSvg}>
            <path
              d="M66 118 C68 88, 82 64, 102 44 C86 24, 60 18, 34 26 C42 46, 58 60, 84 66"
              stroke="rgba(186, 224, 255, 0.4)"
              strokeWidth="1.3"
              fill="rgba(130, 196, 255, 0.11)"
            />
            <path
              d="M92 119 C98 86, 118 60, 148 38 C134 16, 104 10, 78 22 C86 42, 104 56, 132 58"
              stroke="rgba(186, 224, 255, 0.48)"
              strokeWidth="1.3"
              fill="rgba(148, 212, 255, 0.14)"
            />
            <path
              d="M0 102 Q68 80 138 98 T220 92 L220 120 L0 120 Z"
              fill="url(#sidebarWaveGrad)"
            />
            <defs>
              <linearGradient
                id="sidebarWaveGrad"
                x1="0"
                y1="76"
                x2="220"
                y2="120"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#1ca7ec" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#0b2447" stopOpacity="0.05" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════════
          MAIN WORKSPACE AREA
          ═══════════════════════════════════════════════════ */}
      <div className={`${styles.mainArea} ${isStudioTab ? styles.mainAreaLocked : ''}`}>
        {/* Sleek Single-Line Top Bar (52px) */}
        <header className={styles.topHeader}>
          <div className={styles.headerLeft}>
            <button
              type="button"
              className={styles.mobileMenuBtn}
              onClick={() => setSidebarOpen(true)}
              aria-label="Mở menu quản trị"
            >
              <Menu size={18} />
            </button>
            <h1 className={styles.pageHeading}>{headerMeta.title}</h1>
            <span className={styles.headerContextPill}>{headerMeta.badge}</span>
            {isDirty && <span className={styles.unsavedBadge}>● Chưa lưu</span>}
          </div>

          <div className={styles.headerRight}>
            {activeTab === 'bride' && (
              <>
                <a href="/" target="_blank" rel="noopener noreferrer" className={styles.quickHeaderLink}>
                  Mở Thiệp Cô dâu ↗
                </a>
                <button
                  type="button"
                  className={styles.btnHeaderSave}
                  onClick={() => handleSaveSettings('Thiệp Cô dâu')}
                >
                  <Save size={14} />
                  <span>Lưu thay đổi</span>
                </button>
              </>
            )}

            {activeTab === 'groom' && (
              <>
                <a
                  href="/chu-re"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.quickHeaderLink}
                >
                  Mở Thiệp Chú rể ↗
                </a>
                <button
                  type="button"
                  className={styles.btnHeaderSave}
                  onClick={() => handleSaveSettings('Thiệp Chú rể')}
                >
                  <Save size={14} />
                  <span>Lưu thay đổi</span>
                </button>
              </>
            )}

            {activeTab === 'dashboard' && (
              <>
                <a href="/" target="_blank" rel="noopener noreferrer" className={styles.quickHeaderLink}>
                  👰 Cô dâu ↗
                </a>
                <a
                  href="/chu-re"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.quickHeaderLink}
                >
                  🤵 Chú rể ↗
                </a>
                <button
                  type="button"
                  className={styles.btnHeaderSave}
                  onClick={() => handleSaveSettings('nội dung chung & Footer')}
                >
                  <Save size={14} />
                  <span>Lưu thay đổi</span>
                </button>
              </>
            )}

            {!isStudioTab && activeTab !== 'dashboard' && (
              <>
                <a href="/" target="_blank" rel="noopener noreferrer" className={styles.quickHeaderLink}>
                  👰 Cô dâu ↗
                </a>
                <a
                  href="/chu-re"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.quickHeaderLink}
                >
                  🤵 Chú rể ↗
                </a>
              </>
            )}

            <button
              type="button"
              className={styles.notifBtn}
              title="Đồng bộ dữ liệu mới nhất"
              onClick={() => {
                void syncCmsFromServer(true);
                showToast('✓ Đã đồng bộ dữ liệu mới nhất!');
              }}
            >
              <Bell size={16} />
              {rsvps.length > 0 && <span className={styles.notifDot} />}
            </button>

            <div className={styles.adminProfile}>
              <div className={styles.adminAvatar}>HH</div>
              <div className={styles.adminMeta}>
                <strong>Hoàng Huynh</strong>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className={`${styles.contentBody} ${isStudioTab ? styles.contentBodyStudio : ''}`}>
          {/* ═══════════════════════════════════════════════════
              1. DASHBOARD (TỔNG QUAN)
              ═══════════════════════════════════════════════════ */}
          {activeTab === 'dashboard' && (
            <div className={styles.sectionStack}>
              {/* Compact 4 KPI Summary Cards */}
              <div className={styles.kpiGrid}>
                <div
                  className={`${styles.kpiCard} ${styles.kpiWaveBlue} ${styles.kpiClickable}`}
                  onClick={() => switchTab('guests')}
                >
                  <div className={styles.kpiIconBox}>
                    <Users size={19} />
                  </div>
                  <div className={styles.kpiMeta}>
                    <span className={styles.kpiLabel}>Tổng thiệp đã tạo</span>
                    <strong className={styles.kpiValue}>{invitations.length}</strong>
                    <span className={styles.kpiSub}>
                      Cô dâu: {brideInvCount} • Chú rể: {groomInvCount}
                    </span>
                  </div>
                </div>

                <div
                  className={`${styles.kpiCard} ${styles.kpiWaveMint} ${styles.kpiClickable}`}
                  onClick={() => switchTab('music')}
                >
                  <div className={styles.kpiIconBox}>
                    <Music size={19} />
                  </div>
                  <div className={styles.kpiMeta}>
                    <span className={styles.kpiLabel}>Kho nhạc nền</span>
                    <strong className={styles.kpiValue}>{playlist.length}</strong>
                    <span className={styles.kpiSub}>
                      Mặc định: {globalDefaultSong?.title || 'Young and Beautiful'}
                    </span>
                  </div>
                </div>

                <div
                  className={`${styles.kpiCard} ${styles.kpiWaveCyan} ${styles.kpiClickable}`}
                  onClick={() => switchTab('rsvp')}
                >
                  <div className={styles.kpiIconBox}>
                    <MailCheck size={19} />
                  </div>
                  <div className={styles.kpiMeta}>
                    <span className={styles.kpiLabel}>Xác nhận tham dự</span>
                    <strong className={styles.kpiValue}>{rsvps.length}</strong>
                    <span className={styles.kpiSub}>
                      Cô dâu: {brideRsvpCount} • Chú rể: {groomRsvpCount}
                    </span>
                  </div>
                </div>

                <div className={`${styles.kpiCard} ${styles.kpiWaveBlue}`}>
                  <div className={styles.kpiIconBox}>
                    <Calendar size={19} />
                  </div>
                  <div className={styles.kpiMeta}>
                    <span className={styles.kpiLabel}>Lịch cưới 2 bên</span>
                    <strong className={styles.kpiValueSmall}>
                      {settings?.bride?.dateShort} &amp; {settings?.groom?.dateShort}
                    </strong>
                    <span className={styles.kpiSub}>Cập nhật: {lastUpdatedLabel}</span>
                  </div>
                </div>
              </div>

              {/* Dashboard 2-Column Split: Shared Content & Footer | Scroll-Synced Preview */}
              <div className={styles.twoColWorkspace}>
                <div
                  ref={dashFormColRef}
                  className={styles.formColumn}
                  onFocusCapture={handleDashFocusCapture}
                >
                  {/* Shared Invitation Proclamation & Quotes */}
                  <div data-preview-section="invitation" className={styles.panelCard}>
                    <div className={styles.panelHeaderFlex}>
                      <div>
                        <h3 className={styles.panelTitle} style={{ marginBottom: 2 }}>
                          Nội dung chung trên Thiệp cưới
                        </h3>
                        <p className={styles.panelHint}>
                          Áp dụng cho cả thiệp Cô dâu và Chú rể — nhấp vào ô sửa để khung phải cuộn tới đúng vị trí.
                        </p>
                      </div>
                      <div className={styles.langPillGroup}>
                        {LANGUAGE_OPTIONS.map((l) => (
                          <button
                            key={l.code}
                            type="button"
                            className={`${styles.smallLangPill} ${
                              sharedEditLang === l.code ? styles.smallLangPillActive : ''
                            }`}
                            onClick={() => setSharedEditLang(l.code)}
                          >
                            {l.flag} {l.code.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className={styles.fieldGrid2}>
                      <div className={styles.fieldGroup}>
                        <label>Tiêu đề lời mời — Dòng 1</label>
                        <input
                          type="text"
                          data-preview-focus="invitation"
                          className={styles.textInput}
                          value={draft?.shared?.[sharedEditLang]?.announcementLine1 || ''}
                          onChange={(e) =>
                            updateSharedField(sharedEditLang, 'announcementLine1', e.target.value)
                          }
                        />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label>Tiêu đề lời mời — Dòng 2</label>
                        <input
                          type="text"
                          data-preview-focus="invitation"
                          className={styles.textInput}
                          value={draft?.shared?.[sharedEditLang]?.announcementLine2 || ''}
                          onChange={(e) =>
                            updateSharedField(sharedEditLang, 'announcementLine2', e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className={styles.fieldGroup}>
                      <label>Câu trích dẫn tình yêu — Dòng 1</label>
                      <input
                        type="text"
                        data-preview-focus="invitation"
                        className={styles.textInput}
                        value={draft?.shared?.[sharedEditLang]?.quoteLine1 || ''}
                        onChange={(e) =>
                          updateSharedField(sharedEditLang, 'quoteLine1', e.target.value)
                        }
                      />
                    </div>

                    <div className={styles.fieldGroup}>
                      <label>Câu trích dẫn tình yêu — Dòng 2</label>
                      <input
                        type="text"
                        data-preview-focus="invitation"
                        className={styles.textInput}
                        value={draft?.shared?.[sharedEditLang]?.quoteLine2 || ''}
                        onChange={(e) =>
                          updateSharedField(sharedEditLang, 'quoteLine2', e.target.value)
                        }
                      />
                    </div>

                    <div className={styles.fieldGrid2}>
                      <div className={styles.fieldGroup} style={{ marginBottom: 0 }}>
                        <label>Chữ ký dưới khung Đếm ngược</label>
                        <input
                          type="text"
                          data-preview-focus="countdown"
                          className={styles.textInput}
                          value={draft?.shared?.[sharedEditLang]?.countdownScript || ''}
                          onChange={(e) =>
                            updateSharedField(sharedEditLang, 'countdownScript', e.target.value)
                          }
                        />
                      </div>
                      <div className={styles.fieldGroup} style={{ marginBottom: 0 }}>
                        <label>Câu trích dẫn mở đầu phần RSVP</label>
                        <input
                          type="text"
                          data-preview-focus="rsvp"
                          className={styles.textInput}
                          value={draft?.shared?.[sharedEditLang]?.rsvpQuote || ''}
                          onChange={(e) =>
                            updateSharedField(sharedEditLang, 'rsvpQuote', e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Shared Footer Content Editor */}
                  <div data-preview-section="footer" className={styles.panelCard}>
                    <div className={styles.panelHeaderFlex}>
                      <div>
                        <h3 className={styles.panelTitle} style={{ marginBottom: 2 }}>
                          Nội dung Chân trang (Footer — {sharedEditLang.toUpperCase()})
                        </h3>
                        <p className={styles.panelHint}>
                          Hai câu cảm ơn và chữ ký hiển thị trên nền rèm nhung ở cuối thiệp.
                        </p>
                      </div>
                    </div>

                    <div className={styles.fieldGroup}>
                      <label>Câu cảm ơn 1</label>
                      <textarea
                        rows={2}
                        data-preview-focus="footer"
                        className={styles.textareaInput}
                        value={draft?.shared?.[sharedEditLang]?.footerLine1 || ''}
                        onChange={(e) =>
                          updateSharedField(sharedEditLang, 'footerLine1', e.target.value)
                        }
                      />
                    </div>

                    <div className={styles.fieldGroup}>
                      <label>Câu cảm ơn 2</label>
                      <textarea
                        rows={2}
                        data-preview-focus="footer"
                        className={styles.textareaInput}
                        value={draft?.shared?.[sharedEditLang]?.footerLine2 || ''}
                        onChange={(e) =>
                          updateSharedField(sharedEditLang, 'footerLine2', e.target.value)
                        }
                      />
                    </div>

                    <div className={styles.fieldGroup}>
                      <label>Chữ ký nghệ thuật (ví dụ: Thank you!)</label>
                      <input
                        type="text"
                        data-preview-focus="footer"
                        className={styles.textInput}
                        value={draft?.shared?.[sharedEditLang]?.footerThankYou || ''}
                        onChange={(e) =>
                          updateSharedField(sharedEditLang, 'footerThankYou', e.target.value)
                        }
                      />
                    </div>

                    <div className={styles.panelFooterBetween}>
                      <button
                        type="button"
                        className={styles.btnGhostDanger}
                        onClick={handleResetAllSettings}
                      >
                        <RotateCcw size={14} />
                        <span>Khôi phục mặc định</span>
                      </button>

                      <button
                        type="button"
                        className={styles.btnPrimary}
                        onClick={() => handleSaveSettings('nội dung chung & Footer')}
                      >
                        <Save size={15} />
                        <span>Lưu nội dung chung &amp; Footer</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Sticky Live Card Preview */}
                <div className={styles.previewStickyCol}>
                  <div className={styles.panelCardCompact}>
                    <div className={styles.previewSwitchRow}>
                      <div className={styles.segmentedTabs}>
                        <button
                          type="button"
                          className={previewSide === 'bride' ? styles.segActive : ''}
                          onClick={() => setPreviewSide('bride')}
                        >
                          👰 Cô dâu
                        </button>
                        <button
                          type="button"
                          className={previewSide === 'groom' ? styles.segActive : ''}
                          onClick={() => setPreviewSide('groom')}
                        >
                          🤵 Chú rể
                        </button>
                      </div>

                      <div className={styles.previewToolbar}>
                        <span className={styles.syncMiniTag}>
                          {SECTION_LABELS[dashActiveSection] || 'Xem trước'}
                        </span>
                        <button
                          type="button"
                          className={`${styles.iconToggle} ${
                            previewDevice === 'mobile' ? styles.iconToggleActive : ''
                          }`}
                          title="Điện thoại"
                          onClick={() => setPreviewDevice('mobile')}
                        >
                          <Smartphone size={13} />
                        </button>
                        <button
                          type="button"
                          className={`${styles.iconToggle} ${
                            previewDevice === 'desktop' ? styles.iconToggleActive : ''
                          }`}
                          title="Máy tính"
                          onClick={() => setPreviewDevice('desktop')}
                        >
                          <Monitor size={13} />
                        </button>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          title="Làm mới"
                          onClick={() => setPreviewKey((k) => k + 1)}
                        >
                          <RefreshCw size={13} />
                        </button>
                      </div>
                    </div>

                    <div className={styles.dashPreviewStageWrap}>
                      <ScaledDeviceFrame
                        device={previewDevice}
                        src={previewUrl}
                        iframeKey={`${previewUrl}-${previewKey}`}
                        iframeRef={dashIframeRef}
                        title="Xem trước thiệp cưới"
                        routeLabel={previewSide === 'groom' ? '/chu-re' : '/'}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════
              2 & 3. THIỆP CÔ DÂU & THIỆP CHÚ RỂ (SPLIT STUDIO)
              ═══════════════════════════════════════════════════ */}
          {activeTab === 'bride' && renderSideStudio('bride')}
          {activeTab === 'groom' && renderSideStudio('groom')}

          {/* ═══════════════════════════════════════════════════
              4. NHẠC NỀN (DEFAULT MUSIC & 285-TRACK LIBRARY)
              ═══════════════════════════════════════════════════ */}
          {activeTab === 'music' && (
            <div className={styles.sectionStack}>
              <div className={styles.defaultMusicGrid}>
                <div className={styles.defaultMusicCard}>
                  <div className={styles.defaultBadgeRow}>
                    <span className={styles.defaultPillPrimary}>🎵 Mặc định chung (Cả 2 thiệp)</span>
                  </div>
                  <h4 className={styles.defaultSongTitle}>{globalDefaultSong?.title}</h4>
                  <p className={styles.defaultSongArtist}>
                    {globalDefaultSong?.artist} • {globalDefaultSong?.country}
                  </p>
                </div>

                <div className={styles.defaultMusicCard}>
                  <div className={styles.defaultBadgeRow}>
                    <span className={styles.defaultPillSub}>👰 Thiệp Cô dâu (/)</span>
                    {brideDefaultSong && (
                      <button
                        type="button"
                        className={styles.linkResetBtn}
                        onClick={() => handleSetDefaultMusic('', 'bride')}
                      >
                        Dùng chung
                      </button>
                    )}
                  </div>
                  <h4 className={styles.defaultSongTitle}>
                    {(brideDefaultSong || globalDefaultSong)?.title}
                  </h4>
                  <p className={styles.defaultSongArtist}>
                    {brideDefaultSong
                      ? `${brideDefaultSong.artist} (Riêng Nhà Gái)`
                      : `${globalDefaultSong?.artist} (Theo mặc định chung)`}
                  </p>
                </div>

                <div className={styles.defaultMusicCard}>
                  <div className={styles.defaultBadgeRow}>
                    <span className={styles.defaultPillSub}>🤵 Thiệp Chú rể (/chu-re)</span>
                    {groomDefaultSong && (
                      <button
                        type="button"
                        className={styles.linkResetBtn}
                        onClick={() => handleSetDefaultMusic('', 'groom')}
                      >
                        Dùng chung
                      </button>
                    )}
                  </div>
                  <h4 className={styles.defaultSongTitle}>
                    {(groomDefaultSong || globalDefaultSong)?.title}
                  </h4>
                  <p className={styles.defaultSongArtist}>
                    {groomDefaultSong
                      ? `${groomDefaultSong.artist} (Riêng Nhà Trai)`
                      : `${globalDefaultSong?.artist} (Theo mặc định chung)`}
                  </p>
                </div>
              </div>

              <div className={styles.panelCard}>
                <div className={styles.musicPickerTopRow} style={{ marginBottom: 8 }}>
                  <span className={styles.musicCountBadge}>
                    Hiển thị <strong>{filteredPlaylist.length}</strong> / {playlist.length} bài hát
                  </span>
                  {(musicCategory !== 'all' || musicSearch.trim() !== '' || musicSort !== 'default') && (
                    <button
                      type="button"
                      className={styles.resetFilterMiniBtn}
                      onClick={() => {
                        setMusicCategory('all');
                        setMusicSearch('');
                        setMusicSort('default');
                      }}
                    >
                      Đặt lại bộ lọc
                    </button>
                  )}
                </div>

                <div className={styles.musicSearchSortRow}>
                  <div className={styles.searchInputWrap} style={{ flex: 1 }}>
                    <Search size={15} className={styles.searchIcon} />
                    <input
                      type="text"
                      className={styles.searchBarInput}
                      placeholder={`Tìm trong đủ ${playlist.length} bài hát (số #1–${playlist.length}, tên bài, ca sĩ, quốc gia, gõ không dấu)...`}
                      value={musicSearch}
                      onChange={(e) => setMusicSearch(e.target.value)}
                    />
                    {musicSearch && (
                      <button
                        type="button"
                        className={styles.clearInputBtn}
                        onClick={() => setMusicSearch('')}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <select
                    className={styles.musicSortSelect}
                    value={musicSort}
                    onChange={(e) => setMusicSort(e.target.value)}
                    aria-label="Sắp xếp danh sách nhạc"
                  >
                    <option value="default">Thứ tự #1 → #{playlist.length}</option>
                    <option value="title">Tên bài hát (A → Z)</option>
                    <option value="artist">Nghệ sĩ (A → Z)</option>
                  </select>
                </div>

                <div className={styles.catFilterPills}>
                  {musicCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`${styles.catPill} ${
                        musicCategory === cat.id ? styles.catPillActive : ''
                      }`}
                      onClick={() => setMusicCategory(cat.id)}
                    >
                      <span>{cat.label}</span>
                      <span className={styles.catPillCount}>{cat.count}</span>
                    </button>
                  ))}
                </div>

                <div className={styles.tableWrap}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th style={{ width: 56 }}>#</th>
                        <th>Tên bài hát &amp; Nghệ sĩ</th>
                        <th>Quốc gia / Phân loại</th>
                        <th style={{ width: 86 }}>Thời lượng</th>
                        <th style={{ width: 280 }}>Thao tác đặt mặc định</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPlaylist.map((song, idx) => {
                        const isGlobalDef =
                          globalDefaultSong?.id === song.id && !brideDefaultSong && !groomDefaultSong;
                        const isCommonDef = settings?.music?.defaultSongId === song.id;
                        const isBrideDef = settings?.music?.brideDefaultSongId === song.id;
                        const isGroomDef = settings?.music?.groomDefaultSongId === song.id;
                        const isPlayingThis = previewSongId === song.id;

                        return (
                          <tr key={song.id} className={isCommonDef ? styles.rowHighlight : ''}>
                            <td>{song.stt || idx + 1}</td>
                            <td>
                              <div className={styles.songCellMain}>
                                <strong>{song.title}</strong>
                                <span>{song.artist}</span>
                              </div>
                            </td>
                            <td>
                              <span className={styles.tagBadge}>{song.tag || song.country}</span>
                            </td>
                            <td>
                              <span className={styles.monoBadge}>{song.duration || '1:06'}</span>
                            </td>
                            <td>
                              <div className={styles.rowActions}>
                                <button
                                  type="button"
                                  className={`${styles.actionIconPill} ${
                                    isPlayingThis ? styles.actionIconPlaying : ''
                                  }`}
                                  onClick={(e) => handleTogglePreview(e, song)}
                                  title="Nghe thử (cao trào ở giây thứ 6)"
                                >
                                  {isPlayingThis ? <Pause size={14} /> : <Play size={14} />}
                                </button>

                                <button
                                  type="button"
                                  className={`${styles.miniSetBtn} ${
                                    isCommonDef || isGlobalDef ? styles.miniSetBtnActive : ''
                                  }`}
                                  onClick={() => handleSetDefaultMusic(song.id, 'all')}
                                >
                                  <Star size={12} />
                                  <span>{isCommonDef ? 'Mặc định' : 'Đặt mặc định'}</span>
                                </button>

                                <button
                                  type="button"
                                  className={`${styles.miniSideBtn} ${
                                    isBrideDef ? styles.miniSideBtnActive : ''
                                  }`}
                                  title="Đặt làm nhạc mặc định riêng cho Thiệp Cô dâu"
                                  onClick={() => handleSetDefaultMusic(song.id, 'bride')}
                                >
                                  👰
                                </button>
                                <button
                                  type="button"
                                  className={`${styles.miniSideBtn} ${
                                    isGroomDef ? styles.miniSideBtnActive : ''
                                  }`}
                                  title="Đặt làm nhạc mặc định riêng cho Thiệp Chú rể"
                                  onClick={() => handleSetDefaultMusic(song.id, 'groom')}
                                >
                                  🤵
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════
              5. KHÁCH MỜI — TÁCH RIÊNG CÔ DÂU & CHÚ RỂ
              ═══════════════════════════════════════════════════ */}
          {isGuestTab && (
            <div className={styles.sectionStack}>
              {/* Clear Side Banner so Admin Immediately Sees Bride vs Groom Context */}
              <div
                className={`${styles.guestSideBanner} ${
                  guestCardSide === 'groom'
                    ? styles.guestSideBannerGroom
                    : styles.guestSideBannerBride
                }`}
              >
                <div className={styles.guestSideBannerLeft}>
                  <span className={styles.guestSideAvatar}>
                    {guestCardSide === 'groom' ? '🤵' : '👰'}
                  </span>
                  <div>
                    <h2 className={styles.guestSideBannerTitle}>
                      {guestCardSide === 'groom'
                        ? `Tạo thiệp mời Khách Chú rể • Lễ Thành Hôn (${settings?.groom?.dateShort || '24.01.2027'})`
                        : `Tạo thiệp mời Khách Cô dâu • Lễ Vu Quy (${settings?.bride?.dateShort || '17.01.2027'})`}
                    </h2>
                    <p className={styles.guestSideBannerSub}>
                      {guestCardSide === 'groom'
                        ? `${settings?.groom?.venueHall || 'Nhà hàng White Palace'} — Đã tạo ${groomInvCount} thiệp bên Nhà Trai`
                        : `${settings?.bride?.venueHall || 'Tư gia Nhà Gái'} — Đã tạo ${brideInvCount} thiệp bên Nhà Gái`}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.btnSmallOutline}
                  onClick={() =>
                    switchTab(guestCardSide === 'groom' ? 'guests-bride' : 'guests-groom')
                  }
                >
                  <span>
                    {guestCardSide === 'groom'
                      ? '👰 Chuyển sang Khách Cô dâu →'
                      : '🤵 Chuyển sang Khách Chú rể →'}
                  </span>
                </button>
              </div>

              <div className={styles.panelCard}>
                {/* STEP 1 UP FRONT: Guest Name + Honorifics + Instant Link/QR Result (Zero Scrolling Needed!) */}
                <div className={styles.fieldGroup}>
                  <label>
                    1. Nhập Tên Khách Mời {guestCardSide === 'groom' ? '(Nhà Trai)' : '(Nhà Gái)'}{' '}
                    — nhấn Enter hoặc bấm Sao chép link để tạo thiệp ngay
                  </label>
                  <div className={styles.searchInputWrap}>
                    <UserPlus size={16} className={styles.searchIcon} />
                    <input
                      ref={guestInputRef}
                      type="text"
                      className={`${styles.textInputLarge} ${styles.guestNameInputWithIcon}`}
                      placeholder={
                        selectedLang === 'en'
                          ? 'Ví dụ: Mr. David & Mrs. Sarah, Ms. Emily...'
                          : selectedLang === 'zh'
                            ? 'Ví dụ: 王伟先生, 亲爱的陈明, 李总阖家...'
                            : 'Ví dụ: Anh Hoàng & Chị Lan, Bạn Minh, Gia đình Bác Hùng...'
                      }
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && generatedUrl) {
                          e.preventDefault();
                          void handleCreateAndCopyLink();
                        }
                      }}
                    />
                    {guestName && (
                      <button
                        type="button"
                        className={styles.clearInputBtn}
                        title="Xoá tên để nhập khách mới"
                        onClick={() => {
                          setGuestName('');
                          guestInputRef.current?.focus();
                        }}
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>

                  <div className={styles.prefixRow}>
                    <span className={styles.prefixHint}>
                      Danh xưng nhanh ({selectedLang.toUpperCase()}):
                    </span>
                    {(PREFIXES_BY_LANG[selectedLang] || PREFIXES_BY_LANG.vi).map((prefix) => {
                      const isZhSuffix =
                        selectedLang === 'zh' && ZH_SUFFIX_HONORIFICS.has(prefix);
                      return (
                        <button
                          key={prefix}
                          type="button"
                          className={styles.prefixChip}
                          onClick={() => handleAddPrefix(prefix)}
                        >
                          {isZhSuffix ? `+…${prefix}` : `+${prefix}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Instant Generated Link + QR Right Under Guest Name for 1-Click Creation */}
                {generatedUrl ? (
                  <div className={styles.generatedBox} style={{ marginBottom: 14 }}>
                    <div className={styles.generatedLeft}>
                      <span className={styles.generatedLabel}>
                        ✨ Thiệp đã sẵn sàng ({guestCardSide === 'groom' ? '🤵 Khách Chú rể' : '👰 Khách Cô dâu'} •{' '}
                        {activeLangObj.flag} {activeLangObj.name} • 🎵 {activeSong?.title}):
                      </span>
                      <div className={styles.generatedUrlText}>{generatedUrl}</div>
                      <div className={styles.generatedActions}>
                        <button
                          type="button"
                          className={styles.btnPrimary}
                          onClick={handleCreateAndCopyLink}
                        >
                          <Copy size={15} />
                          <span>Sao chép link mời (Tạo thiệp)</span>
                        </button>
                        <button
                          type="button"
                          className={styles.btnOutline}
                          onClick={handleCopyMessage}
                        >
                          <Share2 size={14} />
                          <span>Sao chép lời mời mẫu</span>
                        </button>
                        <a
                          href={generatedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.btnOutline}
                        >
                          <ExternalLink size={14} />
                          <span>Mở xem thử</span>
                        </a>
                        <button
                          type="button"
                          className={styles.btnSmallOutline}
                          onClick={() => {
                            setGuestName('');
                            guestInputRef.current?.focus();
                          }}
                        >
                          <Plus size={13} />
                          <span>Khách tiếp theo</span>
                        </button>
                      </div>
                    </div>

                    <div className={styles.generatedQrBox} ref={qrRef}>
                      <QRCodeCanvas value={generatedUrl} size={98} level="H" includeMargin />
                      <button
                        type="button"
                        className={styles.btnSmallOutline}
                        onClick={handleDownloadQr}
                      >
                        <Download size={13} />
                        <span>Tải QR</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.emptyPrompt} style={{ marginBottom: 14, padding: '0.85rem' }}>
                    Gõ tên khách mời vào ô số 1 ở trên — link thiệp online &amp; mã QR sẽ hiện ngay tại đây để bạn sao chép liền tay.
                  </div>
                )}

                {/* STEP 2 & 3: Inviter & Language */}
                <div className={styles.fieldGrid2}>
                  <div className={styles.fieldGroup}>
                    <label>2. Danh nghĩa người mời ({guestCardSide === 'groom' ? 'Nhà Trai' : 'Nhà Gái'})</label>
                    <div className={styles.chipWrap}>
                      {activePresets.map((p) => (
                        <button
                          key={p}
                          type="button"
                          className={`${styles.choiceChip} ${
                            !isCustomInviter && inviter === p ? styles.choiceChipActive : ''
                          }`}
                          onClick={() => {
                            setIsCustomInviter(false);
                            setInviter(p);
                          }}
                        >
                          {p}
                        </button>
                      ))}
                      <button
                        type="button"
                        className={`${styles.choiceChip} ${
                          isCustomInviter ? styles.choiceChipActive : ''
                        }`}
                        onClick={() => setIsCustomInviter(true)}
                      >
                        + Tự nhập...
                      </button>
                    </div>
                    {isCustomInviter && (
                      <input
                        type="text"
                        className={styles.textInput}
                        style={{ marginTop: 8 }}
                        placeholder="Nhập tên người mời (ví dụ: Cô Lan, Ba Mẹ...)"
                        value={customInviter}
                        onChange={(e) => setCustomInviter(e.target.value)}
                      />
                    )}
                  </div>

                  <div className={styles.fieldGroup}>
                    <label>3. Ngôn ngữ hiển thị thiệp cho khách</label>
                    <div className={styles.langChoiceRow}>
                      {LANGUAGE_OPTIONS.map((l) => (
                        <button
                          key={l.code}
                          type="button"
                          className={`${styles.langOptionBtn} ${
                            selectedLang === l.code ? styles.langOptionBtnActive : ''
                          }`}
                          onClick={() => setSelectedLang(l.code)}
                        >
                          <span className={styles.langFlagBig}>{l.flag}</span>
                          <div>
                            <strong>{l.name}</strong>
                            <small>{l.badge}</small>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* STEP 4: Full 285-Track Music Selector */}
                <div className={styles.fieldGroup} style={{ marginBottom: 0 }}>
                  <div className={styles.musicPickerTopRow}>
                    <label style={{ marginBottom: 0 }}>
                      4. Nhạc nền cho khách này — Đang chọn:{' '}
                      <button
                        type="button"
                        className={styles.selectedSongJumpBtn}
                        title="Nhấp để cuộn tới bài đang chọn"
                        onClick={() => {
                          setMusicCategory('all');
                          setMusicSearch('');
                          window.requestAnimationFrame(() => {
                            const el = guestMusicListRef.current?.querySelector(
                              `[data-song-id="${selectedSongId}"]`
                            );
                            el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
                          });
                        }}
                      >
                        {activeSong?.title} ({activeSong?.artist})
                      </button>
                    </label>

                    <div className={styles.musicPickerMetaRight}>
                      <span className={styles.musicCountBadge}>
                        Hiển thị <strong>{filteredPlaylist.length}</strong> / {playlist.length} bài hát
                      </span>
                      {(musicCategory !== 'all' || musicSearch.trim() !== '' || musicSort !== 'default') && (
                        <button
                          type="button"
                          className={styles.resetFilterMiniBtn}
                          onClick={() => {
                            setMusicCategory('all');
                            setMusicSearch('');
                            setMusicSort('default');
                          }}
                        >
                          Đặt lại bộ lọc
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Preset Country & Genre Filter Pills */}
                  <div className={styles.catFilterPills} style={{ marginBottom: 6 }}>
                    {musicCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        className={`${styles.catPill} ${
                          musicCategory === cat.id ? styles.catPillActive : ''
                        }`}
                        onClick={() => setMusicCategory(cat.id)}
                      >
                        <span>{cat.label}</span>
                        <span className={styles.catPillCount}>{cat.count}</span>
                      </button>
                    ))}
                  </div>

                  {/* Search Input + Quick Sort Selector */}
                  <div className={styles.musicSearchSortRow}>
                    <div className={styles.searchInputWrap} style={{ flex: 1 }}>
                      <Search size={15} className={styles.searchIcon} />
                      <input
                        type="text"
                        className={styles.searchBarInput}
                        placeholder={`Tìm trong đủ ${playlist.length} bài hát (số #1–${playlist.length}, tên bài, ca sĩ, quốc gia, không dấu)...`}
                        value={musicSearch}
                        onChange={(e) => setMusicSearch(e.target.value)}
                      />
                      {musicSearch && (
                        <button
                          type="button"
                          className={styles.clearInputBtn}
                          onClick={() => setMusicSearch('')}
                          title="Xoá từ khoá"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    <select
                      className={styles.musicSortSelect}
                      value={musicSort}
                      onChange={(e) => setMusicSort(e.target.value)}
                      aria-label="Sắp xếp danh sách nhạc"
                    >
                      <option value="default">Thứ tự #1 → #{playlist.length}</option>
                      <option value="title">Tên bài hát (A → Z)</option>
                      <option value="artist">Nghệ sĩ (A → Z)</option>
                    </select>
                  </div>

                  {/* Full 285-Track Scrollable Grid (Zero Truncation) */}
                  {filteredPlaylist.length === 0 ? (
                    <div className={styles.emptyPrompt}>
                      Không tìm thấy bài hát phù hợp. Hãy thử từ khoá khác hoặc bấm Đặt lại bộ lọc.
                    </div>
                  ) : (
                    <div ref={guestMusicListRef} className={styles.compactMusicList}>
                      {filteredPlaylist.map((song, idx) => {
                        const isSel = selectedSongId === song.id;
                        const isPlay = previewSongId === song.id;
                        const num = song.stt || playlist.indexOf(song) + 1 || idx + 1;
                        return (
                          <div
                            key={song.id}
                            data-song-id={song.id}
                            className={`${styles.compactSongItem} ${
                              isSel ? styles.compactSongItemActive : ''
                            }`}
                            onClick={() => setSelectedSongId(song.id)}
                          >
                            <span className={styles.compactSongStt}>#{num}</span>
                            <div className={styles.compactSongMeta}>
                              <strong>{song.title}</strong>
                              <span>
                                {song.artist} • {song.country}
                              </span>
                            </div>
                            <div className={styles.compactSongBtns}>
                              <button
                                type="button"
                                className={`${styles.actionIconPill} ${
                                  isPlay ? styles.actionIconPlaying : ''
                                }`}
                                title="Nghe thử"
                                onClick={(e) => handleTogglePreview(e, song)}
                              >
                                {isPlay ? <Pause size={13} /> : <Play size={13} />}
                              </button>
                              {isSel && <Check size={15} color="#0f5ec9" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Side-Dedicated Created Invitations Table */}
              <div className={styles.panelCard}>
                <div className={styles.tableHeaderBar}>
                  <div>
                    <h3 className={styles.panelTitle} style={{ marginBottom: 2 }}>
                      {guestCardSide === 'groom'
                        ? `🤵 Danh sách thiệp Khách Chú rể đã tạo (${filteredInvitations.length})`
                        : `👰 Danh sách thiệp Khách Cô dâu đã tạo (${filteredInvitations.length})`}
                    </h3>
                    <p className={styles.panelHint}>
                      Chỉ hiển thị riêng khách mời bên {guestCardSide === 'groom' ? 'Nhà Trai (24.01.2027)' : 'Nhà Gái (17.01.2027)'}.
                    </p>
                  </div>

                  <div className={styles.tableHeaderControls}>
                    <button
                      type="button"
                      className={styles.btnOutline}
                      disabled={filteredInvitations.length === 0}
                      onClick={() =>
                        downloadCsv(
                          guestCardSide === 'groom'
                            ? 'danh-sach-thiep-khach-chu-re.csv'
                            : 'danh-sach-thiep-khach-co-dau.csv',
                          [
                            'STT',
                            'Tên khách mời',
                            'Bên thiệp',
                            'Người mời',
                            'Ngôn ngữ',
                            'Nhạc nền',
                            'Thời gian tạo',
                            'Link thiệp',
                          ],
                          filteredInvitations.map((x, idx) => [
                            idx + 1,
                            x.guestName,
                            guestCardSide === 'groom' ? 'Nhà Trai (24/01)' : 'Nhà Gái (17/01)',
                            x.inviter,
                            x.langLabel || x.lang,
                            `${x.songTitle || ''} - ${x.songArtist || ''}`,
                            x.createdDisplay || x.createdAt,
                            x.url,
                          ])
                        )
                      }
                    >
                      <FileSpreadsheet size={14} />
                      <span>Xuất Excel ({guestCardSide === 'groom' ? 'Chú rể' : 'Cô dâu'})</span>
                    </button>

                    {filteredInvitations.length > 0 && (
                      <button
                        type="button"
                        className={styles.btnGhostDanger}
                        onClick={() => {
                          const sideLabel =
                            guestCardSide === 'groom' ? 'Khách Chú rể' : 'Khách Cô dâu';
                          if (window.confirm(`Xoá toàn bộ danh sách thiệp đã tạo của ${sideLabel}?`)) {
                            void clearCreatedInvitations(guestCardSide);
                          }
                        }}
                      >
                        <Trash2 size={14} />
                        <span>Xoá danh sách</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className={styles.searchInputWrap} style={{ marginBottom: 12 }}>
                  <Search size={15} className={styles.searchIcon} />
                  <input
                    type="text"
                    className={styles.searchBarInput}
                    placeholder="Tìm khách mời theo tên, người mời hoặc tên bài hát..."
                    value={invSearch}
                    onChange={(e) => {
                      setInvSearch(e.target.value);
                      setInvPage(1);
                    }}
                  />
                </div>

                {pagedInvitations.length === 0 ? (
                  <div className={styles.emptyPrompt}>Chưa có thiệp mời nào trong danh sách.</div>
                ) : (
                  <>
                    <div className={styles.tableWrap}>
                      <table className={styles.dataTable}>
                        <thead>
                          <tr>
                            <th style={{ width: 52 }}>#</th>
                            <th>Khách mời</th>
                            <th>Bên thiệp</th>
                            <th>Người mời</th>
                            <th>Ngôn ngữ</th>
                            <th>Nhạc nền</th>
                            <th>Tạo lúc</th>
                            <th style={{ width: 124 }}>Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pagedInvitations.map((item, idx) => {
                            const rowNum = (safeInvPage - 1) * INV_PAGE_SIZE + idx + 1;
                            return (
                              <tr key={item.id}>
                                <td>{rowNum}</td>
                                <td>
                                  <strong>{item.guestName}</strong>
                                </td>
                                <td>
                                  <span
                                    className={
                                      item.side === 'groom'
                                        ? styles.sideBadgeGroom
                                        : styles.sideBadgeBride
                                    }
                                  >
                                    {item.side === 'groom' ? '🤵 Nhà Trai' : '👰 Nhà Gái'}
                                  </span>
                                </td>
                                <td>{item.inviter}</td>
                                <td>
                                  <span className={styles.langBadge}>
                                    <Globe size={12} />
                                    {item.langFlag || '🇻🇳'} {(item.lang || 'vi').toUpperCase()}
                                  </span>
                                </td>
                                <td>
                                  <span className={styles.songTruncate}>{item.songTitle}</span>
                                </td>
                                <td>{item.createdDisplay || item.createdAt}</td>
                                <td>
                                  <div className={styles.rowActions}>
                                    <button
                                      type="button"
                                      className={styles.tableIconBtn}
                                      title="Sao chép lại link"
                                      onClick={() =>
                                        handleReCopyExistingLink(item.url, item.guestName)
                                      }
                                    >
                                      <Copy size={14} />
                                    </button>
                                    <a
                                      href={item.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={styles.tableIconBtn}
                                      title="Mở xem thiệp"
                                    >
                                      <ExternalLink size={14} />
                                    </a>
                                    <button
                                      type="button"
                                      className={`${styles.tableIconBtn} ${styles.tableIconDanger}`}
                                      title="Xoá thiệp này"
                                      onClick={() => void deleteCreatedInvitation(item.id)}
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className={styles.paginationFooter}>
                      <span>
                        Hiển thị {(safeInvPage - 1) * INV_PAGE_SIZE + 1}–
                        {Math.min(safeInvPage * INV_PAGE_SIZE, filteredInvitations.length)} /{' '}
                        {filteredInvitations.length} thiệp
                      </span>
                      <div className={styles.pageBtns}>
                        <button
                          type="button"
                          disabled={safeInvPage <= 1}
                          onClick={() => setInvPage((p) => Math.max(1, p - 1))}
                        >
                          ‹
                        </button>
                        {Array.from({ length: totalInvPages }, (_, i) => i + 1)
                          .slice(Math.max(0, safeInvPage - 3), safeInvPage + 2)
                          .map((num) => (
                            <button
                              key={num}
                              type="button"
                              className={num === safeInvPage ? styles.pageBtnActive : ''}
                              onClick={() => setInvPage(num)}
                            >
                              {num}
                            </button>
                          ))}
                        <button
                          type="button"
                          disabled={safeInvPage >= totalInvPages}
                          onClick={() => setInvPage((p) => Math.min(totalInvPages, p + 1))}
                        >
                          ›
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════
              6. XÁC NHẬN THAM DỰ (RSVP — CONFIRMATION ONLY, NO MESSAGE)
              ═══════════════════════════════════════════════════ */}
          {activeTab === 'rsvp' && (
            <div className={styles.sectionStack}>
              <div className={styles.kpiGrid}>
                <div className={`${styles.kpiCard} ${styles.kpiWaveBlue}`}>
                  <div className={styles.kpiIconBox}>
                    <MailCheck size={19} />
                  </div>
                  <div className={styles.kpiMeta}>
                    <span className={styles.kpiLabel}>Tổng lượt xác nhận</span>
                    <strong className={styles.kpiValue}>{rsvps.length}</strong>
                  </div>
                </div>

                <div className={`${styles.kpiCard} ${styles.kpiWaveMint}`}>
                  <div className={styles.kpiIconBox}>
                    <Heart size={19} />
                  </div>
                  <div className={styles.kpiMeta}>
                    <span className={styles.kpiLabel}>Thiệp Cô dâu (17.01.2027)</span>
                    <strong className={styles.kpiValue}>{brideRsvpCount}</strong>
                  </div>
                </div>

                <div className={`${styles.kpiCard} ${styles.kpiWaveCyan}`}>
                  <div className={styles.kpiIconBox}>
                    <UserCheck size={19} />
                  </div>
                  <div className={styles.kpiMeta}>
                    <span className={styles.kpiLabel}>Thiệp Chú rể (24.01.2027)</span>
                    <strong className={styles.kpiValue}>{groomRsvpCount}</strong>
                  </div>
                </div>

                <div className={`${styles.kpiCard} ${styles.kpiWaveBlue}`}>
                  <div className={styles.kpiIconBox}>
                    <Sparkles size={19} />
                  </div>
                  <div className={styles.kpiMeta}>
                    <span className={styles.kpiLabel}>Đồng bộ Make.com</span>
                    <strong className={styles.kpiValueSmall}>Hoạt động song song</strong>
                    <span className={styles.kpiSub}>Website không lưu lời chúc khách</span>
                  </div>
                </div>
              </div>

              <div className={styles.panelCard}>
                <div className={styles.tableHeaderBar}>
                  <div>
                    <h3 className={styles.panelTitle} style={{ marginBottom: 2 }}>
                      Danh sách khách xác nhận tham dự ({filteredRsvps.length})
                    </h3>
                    <p className={styles.panelHint}>
                      Website chỉ lưu trạng thái xác nhận tham dự (không lưu lời chúc); dữ liệu đầy đủ gửi đồng thời qua Make.com.
                    </p>
                  </div>

                  <div className={styles.tableHeaderControls}>
                    <div className={styles.segmentedTabs}>
                      <button
                        type="button"
                        className={rsvpFilter === 'all' ? styles.segActive : ''}
                        onClick={() => {
                          setRsvpFilter('all');
                          setRsvpPage(1);
                        }}
                      >
                        Tất cả ({rsvps.length})
                      </button>
                      <button
                        type="button"
                        className={rsvpFilter === 'bride' ? styles.segActive : ''}
                        onClick={() => {
                          setRsvpFilter('bride');
                          setRsvpPage(1);
                        }}
                      >
                        👰 Cô dâu ({brideRsvpCount})
                      </button>
                      <button
                        type="button"
                        className={rsvpFilter === 'groom' ? styles.segActive : ''}
                        onClick={() => {
                          setRsvpFilter('groom');
                          setRsvpPage(1);
                        }}
                      >
                        🤵 Chú rể ({groomRsvpCount})
                      </button>
                    </div>

                    <button
                      type="button"
                      className={styles.btnOutline}
                      onClick={() => {
                        void syncCmsFromServer(true);
                        showToast('✓ Đã làm mới danh sách xác nhận tham dự!');
                      }}
                    >
                      <RefreshCw size={14} />
                      <span>Làm mới</span>
                    </button>

                    <button
                      type="button"
                      className={styles.btnOutline}
                      disabled={filteredRsvps.length === 0}
                      onClick={() =>
                        downloadCsv(
                          'danh-sach-xac-nhan-tham-du.csv',
                          [
                            'STT',
                            'Họ và tên khách',
                            'Thiệp xác nhận',
                            'Khách của',
                            'Ngôn ngữ',
                            'Trạng thái',
                            'Thời gian xác nhận',
                          ],
                          filteredRsvps.map((r, idx) => [
                            idx + 1,
                            r.fullName,
                            r.invitationType === 'groom'
                              ? 'Nhà Trai (24/01/2027)'
                              : 'Nhà Gái (17/01/2027)',
                            r.side,
                            (r.language || 'vi').toUpperCase(),
                            'Đã xác nhận tham dự',
                            r.dateFormatted || r.submittedAt,
                          ])
                        )
                      }
                    >
                      <FileSpreadsheet size={14} />
                      <span>Xuất Excel</span>
                    </button>

                    {rsvps.length > 0 && (
                      <button
                        type="button"
                        className={styles.btnGhostDanger}
                        onClick={() => {
                          if (
                            window.confirm('Xoá danh sách xác nhận tham dự đang lọc trên website?')
                          ) {
                            void clearRsvpConfirmations(rsvpFilter === 'all' ? '' : rsvpFilter);
                          }
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div className={styles.searchInputWrap} style={{ marginBottom: 12 }}>
                  <Search size={15} className={styles.searchIcon} />
                  <input
                    type="text"
                    className={styles.searchBarInput}
                    placeholder="Tìm khách xác nhận theo họ tên hoặc bên khách..."
                    value={rsvpSearch}
                    onChange={(e) => {
                      setRsvpSearch(e.target.value);
                      setRsvpPage(1);
                    }}
                  />
                </div>

                {pagedRsvps.length === 0 ? (
                  <div className={styles.emptyPrompt}>
                    Chưa có lượt xác nhận tham dự nào trên website.
                  </div>
                ) : (
                  <>
                    <div className={styles.tableWrap}>
                      <table className={styles.dataTable}>
                        <thead>
                          <tr>
                            <th style={{ width: 52 }}>#</th>
                            <th>Họ và tên khách mời</th>
                            <th>Thiệp xác nhận</th>
                            <th>Khách của</th>
                            <th>Ngôn ngữ</th>
                            <th>Trạng thái</th>
                            <th>Thời gian</th>
                            <th style={{ width: 68 }}>Xoá</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pagedRsvps.map((r, idx) => {
                            const rowNum = (safeRsvpPage - 1) * RSVP_PAGE_SIZE + idx + 1;
                            return (
                              <tr key={r.id || rowNum}>
                                <td>{rowNum}</td>
                                <td>
                                  <strong>{r.fullName}</strong>
                                </td>
                                <td>
                                  <span
                                    className={
                                      r.invitationType === 'groom'
                                        ? styles.sideBadgeGroom
                                        : styles.sideBadgeBride
                                    }
                                  >
                                    {r.invitationType === 'groom'
                                      ? '🤵 Nhà Trai (24.01)'
                                      : '👰 Nhà Gái (17.01)'}
                                  </span>
                                </td>
                                <td>{r.side}</td>
                                <td>
                                  <span className={styles.monoBadge}>
                                    {(r.language || 'vi').toUpperCase()}
                                  </span>
                                </td>
                                <td>
                                  <span className={styles.statusActivePill}>
                                    ● Đã xác nhận tham dự
                                  </span>
                                </td>
                                <td>{r.dateFormatted || r.submittedAt}</td>
                                <td>
                                  <button
                                    type="button"
                                    className={`${styles.tableIconBtn} ${styles.tableIconDanger}`}
                                    title="Xoá bản ghi xác nhận"
                                    onClick={() => void deleteRsvpConfirmation(r.id)}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className={styles.paginationFooter}>
                      <span>
                        Hiển thị {(safeRsvpPage - 1) * RSVP_PAGE_SIZE + 1}–
                        {Math.min(safeRsvpPage * RSVP_PAGE_SIZE, filteredRsvps.length)} /{' '}
                        {filteredRsvps.length} lượt xác nhận
                      </span>
                      <div className={styles.pageBtns}>
                        <button
                          type="button"
                          disabled={safeRsvpPage <= 1}
                          onClick={() => setRsvpPage((p) => Math.max(1, p - 1))}
                        >
                          ‹
                        </button>
                        {Array.from({ length: totalRsvpPages }, (_, i) => i + 1)
                          .slice(Math.max(0, safeRsvpPage - 3), safeRsvpPage + 2)
                          .map((num) => (
                            <button
                              key={num}
                              type="button"
                              className={num === safeRsvpPage ? styles.pageBtnActive : ''}
                              onClick={() => setRsvpPage(num)}
                            >
                              {num}
                            </button>
                          ))}
                        <button
                          type="button"
                          disabled={safeRsvpPage >= totalRsvpPages}
                          onClick={() => setRsvpPage((p) => Math.min(totalRsvpPages, p + 1))}
                        >
                          ›
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating Feedback Toast */}
      {toastMessage && (
        <div className={styles.toast} role="status">
          <Check size={15} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
