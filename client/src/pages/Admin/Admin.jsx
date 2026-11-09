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
import weddingConfig from '../../config/weddingConfig';
import styles from './Admin.module.css';

const INVITER_PRESETS = [
  'Cô dâu Thu Hiền',
  'Gia đình Nhà Gái',
  'Thu Hiền & Đình Huy',
  'Chú rể Đình Huy',
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

const STORAGE_KEY = 'wedding_invitation_links_history';

export default function Admin() {
  const [inviter, setInviter] = useState(INVITER_PRESETS[0]);
  const [customInviter, setCustomInviter] = useState('');
  const [isCustomInviter, setIsCustomInviter] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [selectedLang, setSelectedLang] = useState('vi');

  const playlist = weddingConfig.playlist || [];
  const [selectedSongId, setSelectedSongId] = useState(playlist[0]?.id || 'crush-love-you-with-all-my-heart');
  const [previewSongId, setPreviewSongId] = useState(null);
  const previewAudioRef = useRef(null);
  const [musicCategory, setMusicCategory] = useState('all');
  const [musicSearch, setMusicSearch] = useState('');

  const [toastMessage, setToastMessage] = useState('');
  const [history, setHistory] = useState([]);
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

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const activeInviter = isCustomInviter ? customInviter.trim() || 'Gia đình Nhà Gái' : inviter;
  const activeSong =
    playlist.find((s) => s.id === selectedSongId) || playlist[0] || weddingConfig.music;
  const activeLangObj =
    LANGUAGE_OPTIONS.find((l) => l.code === selectedLang) || LANGUAGE_OPTIONS[0];

  const musicCategories = React.useMemo(() => [
    { id: 'all', label: 'Tất Cả', count: playlist.length },
    { id: 'don-khach', label: `🎧 Nhạc Mở Thiệp & Đón Khách (${playlist.filter((s) => s.category === 'don-khach').length} Bài)`, count: playlist.filter((s) => s.category === 'don-khach').length },
    { id: 'han-quoc', label: '🇰🇷 Hàn Quốc', count: playlist.filter((s) => s.country === 'Hàn Quốc').length },
    { id: 'trung-quoc', label: '🇨🇳 Trung Quốc', count: playlist.filter((s) => s.country === 'Trung Quốc').length },
    { id: 'vietnam', label: '🇻🇳 Việt Nam', count: playlist.filter((s) => s.country === 'Việt Nam').length },
    { id: 'au-my', label: '🇺🇸 Âu - Mỹ', count: playlist.filter((s) => s.country === 'Âu - Mỹ').length },
    { id: 'classic', label: '✨ Kinh Điển', count: playlist.filter((s) => s.category === 'classic').length },
  ], [playlist]);

  const filteredPlaylist = React.useMemo(() => {
    return playlist.filter((song) => {
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
    params.set('to', guestName.trim());
    if (activeInviter) {
      params.set('from', activeInviter);
    }
    if (selectedSongId) {
      params.set('music', selectedSongId);
    }
    // Default is Vietnamese ('vi'); embed lang param when English ('en') or Chinese ('zh') is chosen
    if (selectedLang && selectedLang !== 'vi') {
      params.set('lang', selectedLang);
    }
    return `${baseUrl}/?${params.toString()}`;
  }, [guestName, activeInviter, selectedSongId, selectedLang, baseUrl]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleTogglePreview = (e, song) => {
    e.stopPropagation();
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

    if (selectedLang === 'en') {
      msg = `Dear ${cleanGuest},

Together with our families, Thu Hiền & Đình Huy joyfully invite you to celebrate our Wedding Ceremony on Sunday, January 17, 2027!

🎵 Dedicated melody for you: "${activeSong.title}" - ${activeSong.artist}
✨ Open your personalized English wedding invitation here:
${generatedUrl}

Your presence and warm blessings would mean the world to us!`;
    } else if (selectedLang === 'zh') {
      msg = `${cleanGuest} 您好：

谨以满怀喜悦之心，Thu Hiền 与 Đình Huy 诚挚邀请您莅临参加我们的归宁婚礼喜宴（2027年01月17日 星期日）！

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
    a.download = `QR-Thiep-Cuoi-${guestName.trim().replace(/\s+/g, '-') || 'Khach'}-${selectedLang.toUpperCase()}.png`;
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
      const updated = [item, ...filtered].slice(0, 50);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleDeleteHistoryItem = (id) => {
    setHistory((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast('Đã xoá link khỏi lịch sử');
  };

  const handleClearHistory = () => {
    if (window.confirm('Bạn có chắc muốn xoá toàn bộ danh sách khách mời đã tạo?')) {
      setHistory([]);
      try {
        localStorage.removeItem(STORAGE_KEY);
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
          <Link to="/" className={styles.backHomeLink}>
            <ArrowLeft size={14} />
            <span>Xem trang web thiệp cưới</span>
          </Link>
          <span className={styles.badge}>Quản Trị Thiệp Lễ Vu Quy • VIP</span>
          <h1 className={styles.title}>Tạo Link Mời Khách Cá Nhân Hoá</h1>
          <p className={styles.subtitle}>
            Tạo liên kết thiệp mời Lễ Vu Quy cho từng khách quý — hỗ trợ chọn ngôn ngữ tự động (Tiếng Việt, Tiếng Anh, Tiếng Trung), giai điệu riêng và mã QR.
          </p>
        </div>

        {/* Generator Card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <UserPlus size={22} className={styles.titleIcon} />
            <span>Thông Tin Lời Mời</span>
          </h2>

          {/* Step 1: Select Inviter */}
          <div className={styles.formGroup}>
            <label className={styles.label}>1. Người Mời (Đại diện gửi thiệp)</label>
            <div className={styles.presetGroup}>
              {INVITER_PRESETS.map((item) => (
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

            <div className={styles.historyList}>
              {history.map((item) => (
                <div key={item.id} className={styles.historyItem}>
                  <div className={styles.itemMain}>
                    <div className={styles.itemGuestName}>{item.guestName}</div>
                    <div className={styles.itemInviter}>
                      {item.inviter} • {item.createdAt}
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
              ))}
            </div>
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
