import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import {
  Copy,
  Check,
  ExternalLink,
  Download,
  Trash2,
  UserPlus,
  ArrowLeft,
  Share2,
  Users,
  Music,
  Play,
  Pause,
  Globe,
  Search,
} from 'lucide-react';
import { chineseNames } from '../../config/chineseInvitation';
import weddingConfig from '../../config/weddingConfig';
import { useLanguage } from '../../context/LanguageContext';
import { setSafeInvitationParams } from '../../utils/invitationCodec';
import styles from './Admin.module.css';

const BRIDE_INVITER_PRESETS = [
  'Cô dâu Thu Hiền',
  'Gia đình Nhà Gái',
  'Thu Hiền & Đình Huy',
  'Chú rể Đình Huy',
];

const GROOM_INVITER_PRESETS = [
  'Chú rể Đình Huy',
  'Gia đình Nhà Trai',
  'Đình Huy & Thu Hiền',
  'Cô dâu Thu Hiền',
];

const LANGUAGE_OPTIONS = [
  {
    code: 'vi',
    flag: '🇻🇳',
    name: 'Tiếng Việt',
    badge: 'Mặc định',
    desc: 'Hiển thị thiệp chuẩn Tiếng Việt truyền thống',
  },
  {
    code: 'en',
    flag: '🇬🇧',
    name: 'Tiếng Anh (English)',
    badge: 'Auto Translate',
    desc: 'Khách bấm vào link sẽ tự động mở thiệp bằng Tiếng Anh',
  },
  {
    code: 'zh',
    flag: '🇨🇳',
    name: 'Tiếng Trung (中文)',
    badge: '自动翻译',
    desc: 'Khách bấm vào link sẽ tự động mở thiệp bằng Tiếng Trung',
  },
];

const PREFIXES_BY_LANG = {
  vi: ['Bạn', 'Anh', 'Chị', 'Em', 'Gia đình', 'Cô & Chú', 'Bác'],
  en: ['Dear', 'Mr.', 'Ms.', 'Mrs.', 'Mr. & Mrs.', 'Family of'],
  zh: ['亲爱的', '尊敬的', '先生', '女士', '阖家'],
};

const STORAGE_KEY_BRIDE = 'wedding_invitation_links_history';
const STORAGE_KEY_GROOM = 'wedding_invitation_links_history_groom';
const HISTORY_PAGE_SIZE = 20;

function classifyInviterGroup(inviterStr = '') {
  const norm = inviterStr.trim().toLowerCase();
  if (
    norm === 'thu hiền & đình huy' ||
    norm === 'đình huy & thu hiền' ||
    (norm.includes('thu hiền') && norm.includes('đình huy'))
  ) {
    return 'couple';
  }
  if (norm.includes('cô dâu') || norm === 'thu hiền') {
    return 'bride';
  }
  if (norm.includes('chú rể') || norm.includes('chú rễ') || norm === 'đình huy') {
    return 'groom';
  }
  return 'family';
}

export default function Admin() {
  const { isGroomSide } = useLanguage();
  const activePresets = isGroomSide ? GROOM_INVITER_PRESETS : BRIDE_INVITER_PRESETS;
  const activeStorageKey = isGroomSide ? STORAGE_KEY_GROOM : STORAGE_KEY_BRIDE;

  const [inviter, setInviter] = useState(() => activePresets[0]);
  const [customInviter, setCustomInviter] = useState('');
  const [isCustomInviter, setIsCustomInviter] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [selectedLang, setSelectedLang] = useState('vi');

  const playlist = weddingConfig.playlist || [];
  const [selectedSongId, setSelectedSongId] = useState(
    weddingConfig.music?.id || playlist[0]?.id || 'wildest-dreams-piano'
  );
  const [previewSongId, setPreviewSongId] = useState(null);
  const [showOnlyCPreview, setShowOnlyCPreview] = useState(false);
  const previewAudioRef = useRef(null);
  const [musicCategory, setMusicCategory] = useState('all');
  const [musicSearch, setMusicSearch] = useState('');

  const [toastMessage, setToastMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [historyFilter, setHistoryFilter] = useState('all');
  const [historySearch, setHistorySearch] = useState('');
  const [historyPage, setHistoryPage] = useState(1);
  const qrRef = useRef(null);

  // Stop preview audio when leaving page
  useEffect(() => {
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current.src = '';
      }
    };
  }, []);

  // Sync default inviter preset & load isolated history when switching between Bride Admin and Groom Admin
  useEffect(() => {
    setInviter(isGroomSide ? GROOM_INVITER_PRESETS[0] : BRIDE_INVITER_PRESETS[0]);
    setIsCustomInviter(false);
    setHistoryFilter('all');
    setHistoryPage(1);
    try {
      const saved = localStorage.getItem(activeStorageKey);
      setHistory(saved ? JSON.parse(saved) : []);
    } catch {
      setHistory([]);
    }
  }, [isGroomSide, activeStorageKey]);

  const activeInviter = isCustomInviter
    ? customInviter.trim() || (isGroomSide ? 'Gia đình Nhà Trai' : 'Gia đình Nhà Gái')
    : inviter;
  const activeSong =
    playlist.find((s) => s.id === selectedSongId) || playlist[0] || weddingConfig.music;
  const activeLangObj =
    LANGUAGE_OPTIONS.find((l) => l.code === selectedLang) || LANGUAGE_OPTIONS[0];

  const musicCategories = React.useMemo(() => [
    { id: 'all', label: 'Tất Cả', count: playlist.length },
    { id: 'hoa-tau', label: '🎻 Hòa Tấu (Piano / Sax / Violin)', count: playlist.filter((s) => s.category === 'hoa-tau').length },
    { id: 'don-khach', label: `🎧 Nhạc Mở Thiệp & Đón Khách (${playlist.filter((s) => s.category === 'don-khach').length} Bài)`, count: playlist.filter((s) => s.category === 'don-khach').length },
    { id: 'han-quoc', label: '🇰🇷 Hàn Quốc', count: playlist.filter((s) => s.country === 'Hàn Quốc').length },
    { id: 'trung-quoc', label: '🇨🇳 Trung Quốc', count: playlist.filter((s) => s.country === 'Trung Quốc').length },
    { id: 'vietnam', label: '🇻🇳 Việt Nam', count: playlist.filter((s) => s.country === 'Việt Nam').length },
    { id: 'au-my', label: '🇺🇸 Âu - Mỹ', count: playlist.filter((s) => s.country === 'Âu - Mỹ').length },
    { id: 'classic', label: '✨ Kinh Điển', count: playlist.filter((s) => s.category === 'classic').length },
  ], [playlist]);

  const filteredPlaylist = React.useMemo(() => {
    return playlist.filter((song) => {
      if (musicCategory === 'hoa-tau' && song.category !== 'hoa-tau') return false;
      if (musicCategory === 'don-khach' && song.category !== 'don-khach') return false;
      if (musicCategory === 'han-quoc' && song.country !== 'Hàn Quốc') return false;
      if (musicCategory === 'trung-quoc' && song.country !== 'Trung Quốc') return false;
      if (musicCategory === 'vietnam' && song.country !== 'Việt Nam') return false;
      if (musicCategory === 'au-my' && song.country !== 'Âu - Mỹ') return false;
      if (musicCategory === 'classic' && song.category !== 'classic') return false;

      if (musicSearch.trim()) {
        const q = musicSearch.trim().toLowerCase();
        const matchTitle = song.title.toLowerCase().includes(q);
        const matchArtist = song.artist.toLowerCase().includes(q);
        const matchTag = song.tag?.toLowerCase().includes(q);
        const matchStt = song.stt?.toString().includes(q);
        return matchTitle || matchArtist || matchTag || matchStt;
      }
      return true;
    });
  }, [playlist, musicCategory, musicSearch]);

  // Build the complete URL
  const baseUrl =
    typeof window !== 'undefined' ? window.location.origin : 'https://wedding.dinhhuy-thuhien.love';

  const generatedUrl = React.useMemo(() => {
    if (!guestName.trim()) return '';
    const params = new URLSearchParams();
    setSafeInvitationParams(params, {
      guestName: guestName.trim(),
      inviter: activeInviter,
      songId: selectedSongId,
      lang: selectedLang,
    });
    const routePath = isGroomSide ? '/chu-re' : '/';
    return `${baseUrl}${routePath}?${params.toString()}`;
  }, [guestName, activeInviter, selectedSongId, selectedLang, baseUrl, isGroomSide]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleTogglePreview = (e, song) => {
    e.stopPropagation();
    setShowOnlyCPreview(false);
    if (previewSongId === song.id) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      setPreviewSongId(null);
    } else {
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
        .then(() => {
          setPreviewSongId(song.id);
        })
        .catch(() => {
          setPreviewSongId(null);
        });
      previewAudioRef.current = audio;
    }
  };

  const handleCopyLink = async (urlToCopy = generatedUrl, guestLabel = guestName) => {
    if (!urlToCopy) return;
    try {
      await navigator.clipboard.writeText(urlToCopy);
      showToast(
        `✓ Đã sao chép link mời (${activeLangObj.name}) ${guestLabel ? `cho "${guestLabel}"` : ''}!`
      );

      if (guestLabel && urlToCopy === generatedUrl) {
        saveToHistory({
          id: Date.now(),
          guestName: guestLabel.trim(),
          inviter: activeInviter,
          lang: selectedLang,
          langLabel: activeLangObj.name,
          langFlag: activeLangObj.flag,
          songId: activeSong.id,
          songTitle: activeSong.title,
          songArtist: activeSong.artist,
          url: urlToCopy,
          createdAt: new Date().toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
        });
      }
    } catch {
      showToast('Không thể tự động sao chép. Vui lòng chọn và sao chép link bằng tay.');
    }
  };

  const handleCopyMessage = async () => {
    if (!generatedUrl || !guestName.trim()) return;
    const cleanGuest = guestName.trim();
    let msg = '';

    if (isGroomSide) {
      if (selectedLang === 'en') {
        msg = `Dear ${cleanGuest},

Together with our families, Dinh Huy & Thu Hien joyfully invite you to celebrate our Evening Wedding Banquet at White Palace (588 Pham Van Dong, Thu Duc, Ho Chi Minh City) on Sunday, January 24, 2027 (Welcome at 05:30 PM, Ceremony at 07:00 PM, Banquet at 07:30 PM)!

🎵 Dedicated melody for you: "${activeSong.title}" - ${activeSong.artist}
✨ Open your personalized English wedding invitation here:
${generatedUrl}

Your presence and warm blessings would mean the world to us!`;
      } else if (selectedLang === 'zh') {
        msg = `${cleanGuest} 您好：

谨以满怀喜悦之心，${chineseNames.groom.shortName}与${chineseNames.bride.shortName}诚挚邀请您莅临 White Palace 宴会厅（胡志明市守德市范文同街 588 号）参加我们的新婚晚宴（2027年01月24日 星期日 17:30迎宾 · 19:00典礼 · 19:30开席）！

🎵 为您专属挑选的旋律：《${activeSong.title}》- ${activeSong.artist}
✨ 点击开启您的专属中文电子婚礼请柬：
${generatedUrl}

衷心期待您的光临，与我们共享这份珍贵的幸福时刻！`;
      } else {
        msg = `Trân trọng kính mời ${cleanGuest} đến tham dự tiệc tối mừng Lễ Tân Hôn của Đình Huy & Thu Hiền tại Nhà Hàng White Palace — 588 Phạm Văn Đồng, TP. Thủ Đức, TP. Hồ Chí Minh (17:30 đón khách, 19:00 làm lễ, 19:30 khai tiệc — tối Chủ Nhật, ngày 24/01/2027)!

🎵 Giai điệu dành riêng cho ${cleanGuest}: "${activeSong.title}" - ${activeSong.artist}
✨ Xem thiệp mời cưới online tại đây:
${generatedUrl}

Sự hiện diện của ${cleanGuest} là niềm vinh hạnh và hạnh phúc lớn của gia đình chúng mình!`;
      }
    } else if (selectedLang === 'en') {
      msg = `Dear ${cleanGuest},

Together with our families, Thu Hien & Dinh Huy joyfully invite you to celebrate our Wedding Ceremony on Sunday, January 17, 2027!

🎵 Dedicated melody for you: "${activeSong.title}" - ${activeSong.artist}
✨ Open your personalized English wedding invitation here:
${generatedUrl}

Your presence and warm blessings would mean the world to us!`;
    } else if (selectedLang === 'zh') {
      msg = `${cleanGuest} 您好：

谨以满怀喜悦之心，${chineseNames.bride.shortName}与${chineseNames.groom.shortName}诚挚邀请您莅临参加我们的归宁婚礼喜宴（2027年01月17日 星期日）！

🎵 为您专属挑选的旋律：《${activeSong.title}》- ${activeSong.artist}
✨ 点击开启您的专属中文电子婚礼请柬：
${generatedUrl}

衷心期待您的光临，与我们共享这份珍贵的幸福时刻！`;
    } else {
      msg = `Trân trọng kính mời ${cleanGuest} đến tham dự tiệc mừng Lễ Vu Quy của Thu Hiền & Đình Huy!

🎵 Giai điệu dành riêng cho ${cleanGuest}: "${activeSong.title}" - ${activeSong.artist}
✨ Xem thiệp mời cưới online tại đây:
${generatedUrl}

Sự hiện diện của ${cleanGuest} là niềm vinh hạnh và hạnh phúc lớn của gia đình chúng mình!`;
    }

    try {
      await navigator.clipboard.writeText(msg);
      showToast(`✓ Đã sao chép lời mời mẫu (${activeLangObj.name})!`);
    } catch {
      showToast('Không thể sao chép văn bản.');
    }
  };

  const handleDownloadQr = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    const sideSlug = isGroomSide ? 'ChuRe' : 'CoDau';
    a.download = `QR-Thiep-${sideSlug}-${guestName.trim().replace(/\s+/g, '-') || 'Khach'}-${selectedLang.toUpperCase()}.png`;
    a.click();
    showToast('✓ Đã tải mã QR về máy!');
  };

  const saveToHistory = (item) => {
    setHistory((prev) => {
      const filtered = prev.filter(
        (i) =>
          !(
            i.guestName.toLowerCase() === item.guestName.toLowerCase() &&
            (i.lang || 'vi') === (item.lang || 'vi')
          )
      );
      const updated = [item, ...filtered].slice(0, 1000);
      try {
        localStorage.setItem(activeStorageKey, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setHistoryPage(1);
  };

  const historyFilterTabs = React.useMemo(() => {
    const counts = { all: history.length, bride: 0, groom: 0, family: 0, couple: 0 };
    history.forEach((item) => {
      const grp = classifyInviterGroup(item.inviter);
      counts[grp] = (counts[grp] || 0) + 1;
    });
    return [
      { id: 'all', label: 'Tất cả', count: counts.all },
      { id: 'bride', label: '👰 Cô dâu', count: counts.bride },
      { id: 'groom', label: '🤵 Chú rể', count: counts.groom },
      { id: 'family', label: '👨‍👩‍👧 Người nhà / Gia đình', count: counts.family },
      { id: 'couple', label: '💑 Cô dâu & Chú rể', count: counts.couple },
    ];
  }, [history]);

  const filteredHistory = React.useMemo(() => {
    return history.filter((item) => {
      if (historyFilter !== 'all') {
        const grp = classifyInviterGroup(item.inviter);
        if (grp !== historyFilter) return false;
      }
      if (historySearch.trim()) {
        const q = historySearch.trim().toLowerCase();
        const matchGuest = item.guestName?.toLowerCase().includes(q);
        const matchInviter = item.inviter?.toLowerCase().includes(q);
        return matchGuest || matchInviter;
      }
      return true;
    });
  }, [history, historyFilter, historySearch]);

  const totalHistoryPages = Math.max(1, Math.ceil(filteredHistory.length / HISTORY_PAGE_SIZE));
  const currentHistoryPage = Math.min(historyPage, totalHistoryPages);
  const paginatedHistory = React.useMemo(() => {
    const start = (currentHistoryPage - 1) * HISTORY_PAGE_SIZE;
    return filteredHistory.slice(start, start + HISTORY_PAGE_SIZE);
  }, [filteredHistory, currentHistoryPage]);

  const handleDeleteHistoryItem = (id) => {
    setHistory((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      try {
        localStorage.setItem(activeStorageKey, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast('Đã xoá link khỏi lịch sử');
  };

  const handleClearHistory = () => {
    if (window.confirm('Bạn có chắc muốn xoá toàn bộ danh sách khách mời đã tạo của bên này?')) {
      setHistory([]);
      try {
        localStorage.removeItem(activeStorageKey);
      } catch {}
      showToast('Đã dọn sạch lịch sử');
    }
  };

  const handleAddPrefix = (prefix) => {
    setGuestName((prev) => {
      const trimmed = prev.trim();
      const sep = selectedLang === 'zh' ? '' : ' ';
      if (!trimmed) return `${prefix}${sep}`;
      if (trimmed.startsWith(prefix)) return trimmed;
      return `${prefix}${sep}${trimmed}`;
    });
  };

  const activePrefixes = PREFIXES_BY_LANG[selectedLang] || PREFIXES_BY_LANG.vi;

  return (
    <div className={styles.adminPage}>
      <div className={styles.container}>
        {/* Navigation & Header */}
        <div className={styles.header}>
          {/* Dedicated Side Switcher Bar: Bride Admin vs Groom Admin */}
          <div className={styles.sideSwitcherBar}>
            <Link
              to="/admin/co-dau"
              className={`${styles.sideSwitchTab} ${!isGroomSide ? styles.sideSwitchTabActive : ''}`}
            >
              👰 Admin Nhà Gái (Cô Dâu • 17/01/2027)
            </Link>
            <Link
              to="/admin/chu-re"
              className={`${styles.sideSwitchTab} ${isGroomSide ? styles.sideSwitchTabActive : ''}`}
            >
              🤵 Admin Nhà Trai (Chú Rể • 24/01/2027)
            </Link>
          </div>

          <Link to={isGroomSide ? '/chu-re' : '/'} className={styles.backHomeLink}>
            <ArrowLeft size={14} />
            <span>
              {isGroomSide
                ? 'Xem trang thiệp cưới Chú Rể (24/01/2027)'
                : 'Xem trang thiệp cưới Cô Dâu (17/01/2027)'}
            </span>
          </Link>
          <span className={styles.badge}>
            {isGroomSide
              ? 'Quản Trị Thiệp Nhà Trai (Lễ Tân Hôn • 24.01.2027)'
              : 'Quản Trị Thiệp Nhà Gái (Lễ Vu Quy • 17.01.2027)'}
          </span>
          <h1 className={styles.title}>
            {isGroomSide
              ? 'Tạo Link Mời Khách Bên Chú Rể'
              : 'Tạo Link Mời Khách Bên Cô Dâu'}
          </h1>
          <p className={styles.subtitle}>
            {isGroomSide
              ? 'Tạo liên kết thiệp mời Lễ Tân Hôn (Đình Huy & Thu Hiền — Tiệc tối 24/01/2027 tại Nhà Hàng White Palace) riêng cho khách nhà trai — hỗ trợ 3 ngôn ngữ, giai điệu riêng và mã QR.'
              : 'Tạo liên kết thiệp mời Lễ Vu Quy (Thu Hiền & Đình Huy — 11:20 ngày 17/01/2027) riêng cho khách nhà gái — hỗ trợ 3 ngôn ngữ, giai điệu riêng và mã QR.'}
          </p>
        </div>

        {/* Generator Card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <UserPlus size={22} className={styles.titleIcon} />
            <span>
              {isGroomSide
                ? 'Thông Tin Lời Mời (Đám Cưới Chú Rể • 24/01/2027)'
                : 'Thông Tin Lời Mời (Đám Cưới Cô Dâu • 17/01/2027)'}
            </span>
          </h2>

          {/* Step 1: Select Inviter */}
          <div className={styles.formGroup}>
            <label className={styles.label}>1. Người Mời (Đại diện gửi thiệp)</label>
            <div className={styles.presetGroup}>
              {activePresets.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`${styles.presetBtn} ${!isCustomInviter && inviter === item ? styles.active : ''}`}
                  onClick={() => {
                    setIsCustomInviter(false);
                    setInviter(item);
                  }}
                >
                  {item}
                </button>
              ))}
              <button
                type="button"
                className={`${styles.presetBtn} ${isCustomInviter ? styles.active : ''}`}
                onClick={() => setIsCustomInviter(true)}
              >
                + Tự nhập người mời
              </button>
            </div>

            {isCustomInviter && (
              <input
                type="text"
                className={styles.input}
                placeholder="Nhập đại diện người mời (ví dụ: Cô dâu Thu Hiền, Gia đình Nhà Gái...)"
                value={customInviter}
                onChange={(e) => setCustomInviter(e.target.value)}
              />
            )}
          </div>

          {/* Step 2: Select Language for Guest */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              2. Ngôn Ngữ Hiển Thị Cho Khách (Tự Động Dịch Khi Khách Bấm Vào Link)
            </label>
            <div className={styles.langGrid}>
              {LANGUAGE_OPTIONS.map((langOpt) => {
                const isSelected = selectedLang === langOpt.code;
                return (
                  <div
                    key={langOpt.code}
                    className={`${styles.langCard} ${isSelected ? styles.langCardActive : ''}`}
                    onClick={() => setSelectedLang(langOpt.code)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedLang(langOpt.code)}
                  >
                    <div className={styles.langCardHeader}>
                      <span className={styles.langFlag}>{langOpt.flag}</span>
                      <span className={styles.langName}>{langOpt.name}</span>
                      <span className={styles.langBadgePill}>{langOpt.badge}</span>
                    </div>
                    <p className={styles.langDesc}>{langOpt.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3: Guest Name */}
          <div className={styles.formGroup}>
            <label className={styles.label}>3. Tên Khách Mời (Hiển thị nổi bật trên bì thư & thiệp)</label>
            <input
              type="text"
              className={styles.input}
              placeholder={
                selectedLang === 'en'
                  ? 'Ví dụ: Mr. David & Mrs. Sarah, Dear Emily...'
                  : selectedLang === 'zh'
                    ? 'Ví dụ: 王伟先生, 亲爱的陈明, 李总阖家...'
                    : 'Ví dụ: Anh Hoàng & Chị Lan, Bạn Minh, Gia đình Bác Hùng...'
              }
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              autoFocus
            />

            <div className={styles.quickPrefixes}>
              <span className={styles.prefixLabel}>Thêm nhanh danh xưng ({activeLangObj.code.toUpperCase()}):</span>
              {activePrefixes.map((prefix) => (
                <button
                  key={prefix}
                  type="button"
                  className={styles.prefixPill}
                  onClick={() => handleAddPrefix(prefix)}
                >
                  +{prefix}
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: Background Song Selection */}
          <div className={styles.formGroup}>
            <div className={styles.musicHeaderRow}>
              <label className={styles.label} style={{ marginBottom: 0 }}>
                4. Chọn Giai Điệu Cho Lời Mời ({playlist.length} Bản Nhạc Hot Hit Đón Khách & Tình Yêu)
              </label>
            </div>

            {/* Category Filter Pills */}
            <div className={styles.musicCategoryBar}>
              {musicCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`${styles.musicCatPill} ${musicCategory === cat.id ? styles.musicCatPillActive : ''}`}
                  onClick={() => setMusicCategory(cat.id)}
                >
                  {cat.label} <span className={styles.catCount}>({cat.count})</span>
                </button>
              ))}
            </div>

            {/* Quick Search */}
            <div className={styles.musicSearchRow}>
              <Search size={15} className={styles.searchIcon} />
              <input
                type="text"
                className={styles.musicSearchInput}
                placeholder="Tìm nhanh bài hát (Yêu Là Tha Thu, Secrets, Paul Kim, Cascada, Ed Sheeran...)"
                value={musicSearch}
                onChange={(e) => setMusicSearch(e.target.value)}
              />
              {musicSearch && (
                <button
                  type="button"
                  className={styles.clearSearchBtn}
                  onClick={() => setMusicSearch('')}
                  title="Xóa tìm kiếm"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Song Grid */}
            <div className={styles.musicGrid}>
              {filteredPlaylist.length === 0 ? (
                <div className={styles.noMusicFound}>
                  Không tìm thấy bài hát nào phù hợp với từ khóa "{musicSearch}".
                </div>
              ) : (
                filteredPlaylist.map((song) => {
                  const isSelected = selectedSongId === song.id;
                  const isPreviewing = previewSongId === song.id;
                  return (
                    <div
                      key={song.id}
                      className={`${styles.songCard} ${isSelected ? styles.songCardActive : ''}`}
                      onClick={() => setSelectedSongId(song.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && setSelectedSongId(song.id)}
                    >
                      <div className={styles.songCardInfo}>
                        <div className={styles.songCardTop}>
                          <span className={styles.songCardTitle}>{song.title}</span>
                          {song.stt && (
                            <span className={styles.sttBadge}>STT {song.stt < 10 ? `0${song.stt}` : song.stt}</span>
                          )}
                          {song.tag && <span className={styles.songCardTag}>{song.tag}</span>}
                          {song.duration && <span className={styles.songDurationBadge}>{song.duration}</span>}
                        </div>
                        <div className={styles.songCardArtist}>{song.artist}</div>
                      </div>

                      <div className={styles.songCardActions}>
                        {song.youtubeUrl && (
                          <a
                            href={song.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.ytLinkBtn}
                            title="Mở video gốc trên YouTube"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink size={13} />
                          </a>
                        )}

                        <button
                          type="button"
                          className={`${styles.previewBtn} ${isPreviewing ? styles.previewBtnPlaying : ''}`}
                          title={isPreviewing ? 'Tạm dừng nghe thử' : 'Bấm nghe thử đoạn nhạc'}
                          onClick={(e) => handleTogglePreview(e, song)}
                          aria-label={`Nghe thử bài ${song.title}`}
                        >
                          {isPreviewing ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: 2 }} />}
                        </button>

                        {isSelected ? (
                          <div className={styles.checkIndicator} title="Đã chọn cho khách này">
                            <Check size={13} />
                          </div>
                        ) : (
                          <div className={styles.emptyCheck} />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className={styles.receptionPreview}>
              <span className={styles.songCardTitle}>08. Yêu Là Tha Thu · OnlyC</span>
              <p className={styles.songCardArtist}>Đoạn nghe thử 30 giây từ MV gốc.</p>
              <div className={styles.actionGrid}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  aria-expanded={showOnlyCPreview}
                  onClick={() => {
                    previewAudioRef.current?.pause();
                    setPreviewSongId(null);
                    setShowOnlyCPreview(!showOnlyCPreview);
                  }}
                >
                  {showOnlyCPreview ? 'Đóng trình phát' : 'Nghe thử'}
                </button>
                <a className={styles.secondaryBtn} href="https://www.youtube.com/watch?v=-nnWBhKZeg0&t=60s" target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={16} aria-hidden="true" />
                  Mở YouTube
                </a>
              </div>
              {showOnlyCPreview && (
                <iframe
                  className={styles.receptionPlayer}
                  src="https://www.youtube-nocookie.com/embed/-nnWBhKZeg0?start=60&end=90&autoplay=1&playsinline=1"
                  title="Yêu Là Tha Thu – OnlyC"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>

            <div className={styles.selectedSongBanner}>
              <Music size={15} style={{ color: 'var(--silver-primary)' }} />
              <span>
                Đang chọn: <strong>{activeLangObj.flag} {activeLangObj.name}</strong> • Nhạc nền: <strong>{activeSong.title}</strong> — {activeSong.artist} {activeSong.duration ? `(${activeSong.duration})` : ''}
              </span>
            </div>
          </div>

          {/* Result Box */}
          {generatedUrl ? (
            <div className={styles.resultBox}>
              <label className={styles.label}>
                5. Link Thiệp Mời Được Tạo ({activeLangObj.flag} {activeLangObj.name})
              </label>
              <div className={styles.urlDisplay}>{generatedUrl}</div>

              <div className={styles.actionGrid}>
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={() => handleCopyLink()}
                >
                  <Copy size={16} />
                  <span>Sao Chép Link Mời</span>
                </button>

                <a
                  href={generatedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.secondaryBtn}
                >
                  <ExternalLink size={16} />
                  <span>Mở Xem Thử ({activeLangObj.code.toUpperCase()})</span>
                </a>
              </div>

              {/* Message Template Button */}
              <div style={{ marginTop: '0.75rem' }}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  style={{ width: '100%' }}
                  onClick={handleCopyMessage}
                >
                  <Share2 size={16} />
                  <span>
                    Sao Chép Mẫu Tin Nhắn Mời ({activeLangObj.flag} {activeLangObj.name})
                  </span>
                </button>
              </div>

              {/* Dynamic QR Code Card */}
              <div className={styles.qrCardSection}>
                <div className={styles.qrPreviewWrapper} ref={qrRef}>
                  <QRCodeCanvas
                    value={generatedUrl}
                    size={140}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <div className={styles.qrInfo}>
                  <h4 className={styles.qrTitle}>Mã QR Thiệp Cá Nhân Hoá</h4>
                  <p className={styles.qrSubtitle}>
                    Khách quét mã sẽ mở thiệp dành riêng cho <strong>{guestName.trim()}</strong> bằng ngôn ngữ <strong>{activeLangObj.name}</strong> với nhạc nền <em>"{activeSong.title}"</em>.
                  </p>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={handleDownloadQr}
                  >
                    <Download size={14} />
                    <span>Tải Ảnh Mã QR</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Hãy chọn ngôn ngữ và nhập tên khách mời ở trên để hệ thống tự động tạo link & mã QR mời cưới.
            </div>
          )}
        </div>

        {/* History of Generated Links */}
        {history.length > 0 && (
          <div className={styles.card}>
            <div className={styles.historyHeader}>
              <h3 className={styles.cardTitle} style={{ marginBottom: 0 }}>
                <Users size={20} className={styles.titleIcon} />
                <span>Danh Sách Khách Đã Tạo Link ({history.length})</span>
              </h3>
              <button
                type="button"
                className={styles.clearBtn}
                onClick={handleClearHistory}
              >
                Xoá tất cả
              </button>
            </div>

            {/* Filter by Inviter Group (Cô dâu / Chú rể / Người nhà / Cô dâu & Chú rể) + Quick Search */}
            <div className={styles.historyFilterSection}>
              <div className={styles.historyFilterPills}>
                {historyFilterTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`${styles.historyFilterBtn} ${
                      historyFilter === tab.id ? styles.historyFilterBtnActive : ''
                    }`}
                    onClick={() => {
                      setHistoryFilter(tab.id);
                      setHistoryPage(1);
                    }}
                  >
                    <span>{tab.label}</span>
                    <span className={styles.historyFilterCount}>{tab.count}</span>
                  </button>
                ))}
              </div>

              <div className={styles.historySearchBox}>
                <Search size={14} className={styles.searchIcon} />
                <input
                  type="text"
                  className={styles.historySearchInput}
                  placeholder="Tìm tên khách mời hoặc người mời..."
                  value={historySearch}
                  onChange={(e) => {
                    setHistorySearch(e.target.value);
                    setHistoryPage(1);
                  }}
                />
                {historySearch && (
                  <button
                    type="button"
                    className={styles.clearSearchBtn}
                    onClick={() => {
                      setHistorySearch('');
                      setHistoryPage(1);
                    }}
                    title="Xóa tìm kiếm"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {filteredHistory.length === 0 ? (
              <div className={styles.noMusicFound}>
                Không có khách mời nào trong mục lọc này.
              </div>
            ) : (
              <>
                <div className={styles.historyList}>
                  {paginatedHistory.map((item, idx) => {
                    const globalIdx = (currentHistoryPage - 1) * HISTORY_PAGE_SIZE + idx + 1;
                    return (
                      <div key={item.id} className={styles.historyItem}>
                        <div className={styles.itemMain}>
                          <div className={styles.itemGuestName}>
                            <span className={styles.itemIndexBadge}>#{globalIdx}</span>
                            {item.guestName}
                          </div>
                          <div className={styles.itemInviter}>
                            <strong>{item.inviter}</strong> • {item.createdAt}
                          </div>
                          <div className={styles.itemBadgesRow}>
                            <div className={styles.itemLangBadge}>
                              <Globe size={11} />
                              <span>{item.langFlag || '🇻🇳'} {item.langLabel || 'Tiếng Việt'}</span>
                            </div>
                            <div className={styles.itemSongBadge}>
                              <Music size={11} />
                              <span>
                                {item.songTitle
                                  ? `${item.songTitle} - ${item.songArtist || ''}`
                                  : 'Young and Beautiful'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className={styles.itemActions}>
                          <button
                            type="button"
                            className={styles.iconActionBtn}
                            title="Sao chép link"
                            onClick={() => handleCopyLink(item.url, item.guestName)}
                          >
                            <Copy size={15} />
                          </button>

                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.iconActionBtn}
                            title="Xem trước thiệp"
                          >
                            <ExternalLink size={15} />
                          </a>

                          <button
                            type="button"
                            className={`${styles.iconActionBtn} ${styles.deleteActionBtn}`}
                            title="Xoá khỏi danh sách"
                            onClick={() => handleDeleteHistoryItem(item.id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Bar (20 guests per page) */}
                <div className={styles.paginationBar}>
                  <span className={styles.paginationInfo}>
                    Hiển thị{' '}
                    <strong>
                      {(currentHistoryPage - 1) * HISTORY_PAGE_SIZE + 1}–
                      {Math.min(currentHistoryPage * HISTORY_PAGE_SIZE, filteredHistory.length)}
                    </strong>{' '}
                    / <strong>{filteredHistory.length}</strong> khách mời ({HISTORY_PAGE_SIZE} người/trang)
                  </span>

                  <div className={styles.paginationControls}>
                    <button
                      type="button"
                      className={styles.pageBtn}
                      disabled={currentHistoryPage <= 1}
                      onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                    >
                      ← Trước
                    </button>

                    {Array.from({ length: totalHistoryPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        className={`${styles.pageBtn} ${
                          pageNum === currentHistoryPage ? styles.pageBtnActive : ''
                        }`}
                        onClick={() => setHistoryPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    ))}

                    <button
                      type="button"
                      className={styles.pageBtn}
                      disabled={currentHistoryPage >= totalHistoryPages}
                      onClick={() => setHistoryPage((p) => Math.min(totalHistoryPages, p + 1))}
                    >
                      Sau →
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Toast feedback */}
        {toastMessage && (
          <div className={styles.toast}>
            <Check size={16} />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
