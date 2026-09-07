import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import {
  Link as LinkIcon,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Download,
  Trash2,
  UserPlus,
  ArrowLeft,
  Share2,
  Sparkles,
  Users,
  Music,
  Play,
  Pause,
  Volume2
} from 'lucide-react';
import weddingConfig from '../../config/weddingConfig';
import styles from './Admin.module.css';

const INVITER_PRESETS = [
  'Chú rể Đình Huy',
  'Cô dâu Thu Hiền',
  'Hai bên Gia đình',
  'Đình Huy & Thu Hiền',
];

const PREFIX_QUICK_PILLS = [
  'Bạn',
  'Anh',
  'Chị',
  'Em',
  'Gia đình',
  'Cô & Chú',
  'Bác',
];

const STORAGE_KEY = 'wedding_invitation_links_history';

export default function Admin() {
  const [inviter, setInviter] = useState(INVITER_PRESETS[0]);
  const [customInviter, setCustomInviter] = useState('');
  const [isCustomInviter, setIsCustomInviter] = useState(false);
  const [guestName, setGuestName] = useState('');
  
  const playlist = weddingConfig.playlist || [];
  const [selectedSongId, setSelectedSongId] = useState(playlist[0]?.id || 'young-and-beautiful');
  const [previewSongId, setPreviewSongId] = useState(null);
  const previewAudioRef = useRef(null);

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

  const activeInviter = isCustomInviter ? customInviter.trim() || 'Người mời' : inviter;
  const activeSong = playlist.find((s) => s.id === selectedSongId) || playlist[0] || weddingConfig.music;

  // Build the complete URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://wedding.dinhhuy-thuhien.love';
  
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
    return `${baseUrl}/?${params.toString()}`;
  }, [guestName, activeInviter, selectedSongId, baseUrl]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleTogglePreview = (e, song) => {
    e.stopPropagation(); // prevent card selection trigger
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

      audio.play().then(() => {
        setPreviewSongId(song.id);
      }).catch(() => {
        setPreviewSongId(null);
      });
      previewAudioRef.current = audio;
    }
  };

  const handleCopyLink = async (urlToCopy = generatedUrl, guestLabel = guestName) => {
    if (!urlToCopy) return;
    try {
      await navigator.clipboard.writeText(urlToCopy);
      showToast(`✓ Đã sao chép link mời ${guestLabel ? `cho "${guestLabel}"` : ''}!`);

      // Save to history if not already present
      if (guestLabel && urlToCopy === generatedUrl) {
        saveToHistory({
          id: Date.now(),
          guestName: guestLabel.trim(),
          inviter: activeInviter,
          songId: activeSong.id,
          songTitle: activeSong.title,
          songArtist: activeSong.artist,
          url: urlToCopy,
          createdAt: new Date().toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })
        });
      }
    } catch {
      showToast('Không thể tự động sao chép. Vui lòng chọn và sao chép link bằng tay.');
    }
  };

  const handleCopyMessage = async () => {
    if (!generatedUrl || !guestName.trim()) return;
    const msg = 
`Trân trọng kính mời ${guestName.trim()} đến tham dự lễ thành hôn cùng chúng mình!

🎵 Giai điệu dành riêng cho ${guestName.trim()}: "${activeSong.title}" - ${activeSong.artist}
✨ Xem thiệp mời cưới online tại đây:
${generatedUrl}

Sự hiện diện của ${guestName.trim()} là niềm vinh hạnh và hạnh phúc lớn của chúng mình!`;

    try {
      await navigator.clipboard.writeText(msg);
      showToast('✓ Đã sao chép lời mời Zalo/Messenger mẫu!');
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
    a.download = `QR-Thiep-Cuoi-${guestName.trim().replace(/\s+/g, '-') || 'Khach'}.png`;
    a.click();
    showToast('✓ Đã tải mã QR về máy!');
  };

  const saveToHistory = (item) => {
    setHistory((prev) => {
      // Remove duplicate if same guest name
      const filtered = prev.filter((i) => i.guestName.toLowerCase() !== item.guestName.toLowerCase());
      const updated = [item, ...filtered].slice(0, 50); // Keep max 50
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
      if (!trimmed) return `${prefix} `;
      if (trimmed.startsWith(prefix)) return trimmed;
      return `${prefix} ${trimmed}`;
    });
  };

  return (
    <div className={styles.adminPage}>
      <div className={styles.container}>
        {/* Navigation & Header */}
        <div className={styles.header}>
          <Link to="/" className={styles.backHomeLink}>
            <ArrowLeft size={14} />
            <span>Xem trang web thiệp cưới</span>
          </Link>
          <span className={styles.badge}>Quản Trị Thiệp Cưới • VIP</span>
          <h1 className={styles.title}>Tạo Link Mời Khách Cá Nhân Hoá</h1>
          <p className={styles.subtitle}>
            Nhập tên khách mời, đại diện người gửi và bài hát nền riêng để tạo liên kết thiệp cưới trang trọng với thiệp mở và mã QR riêng biệt.
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
                placeholder="Nhập đại diện người mời (ví dụ: Chú rể, Gia đình nhà Trai...)"
                value={customInviter}
                onChange={(e) => setCustomInviter(e.target.value)}
              />
            )}
          </div>

          {/* Step 2: Guest Name */}
          <div className={styles.formGroup}>
            <label className={styles.label}>2. Tên Khách Mời (Hiển thị nổi bật trên bì thư & thiệp)</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Ví dụ: Anh Hoàng & Chị Lan, Bạn Minh, Gia đình Bác Hùng..."
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              autoFocus
            />

            <div className={styles.quickPrefixes}>
              <span className={styles.prefixLabel}>Thêm nhanh danh xưng:</span>
              {PREFIX_QUICK_PILLS.map((prefix) => (
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

          {/* Step 3: Background Song Selection */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              3. Chọn Giai Điệu Cho Lời Mời (Nhạc Nền Phát Khi Khách Mở Thiệp)
            </label>
            <div className={styles.musicGrid}>
              {playlist.map((song) => {
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
                        {song.tag && <span className={styles.songCardTag}>{song.tag}</span>}
                      </div>
                      <div className={styles.songCardArtist}>{song.artist}</div>
                    </div>

                    <div className={styles.songCardActions}>
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
              })}
            </div>

            <div className={styles.selectedSongBanner}>
              <Music size={15} style={{ color: 'var(--silver-primary)' }} />
              <span>
                Giai điệu đang chọn: <strong>{activeSong.title}</strong> — {activeSong.artist} ({activeSong.tag || 'Lãng mạn'})
              </span>
            </div>
          </div>

          {/* Result Box */}
          {generatedUrl ? (
            <div className={styles.resultBox}>
              <label className={styles.label}>4. Link Thiệp Mời Được Tạo</label>
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
                  <span>Mở Xem Thử Thiệp</span>
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
                  <span>Sao Chép Mẫu Tin Nhắn Zalo / Messenger</span>
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
                    Khách quét mã này sẽ mở trực tiếp thiệp cưới dành riêng cho <strong>{guestName.trim()}</strong> với bài hát <em>"{activeSong.title}"</em>.
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
              Hãy nhập tên khách mời ở trên để hệ thống tự động xuất bản link và mã QR mời cưới.
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
                    <div className={styles.itemSongBadge}>
                      <Music size={11} />
                      <span>{item.songTitle ? `${item.songTitle} - ${item.songArtist || ''}` : 'Young and Beautiful'}</span>
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
