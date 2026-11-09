import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Play, Pause, Maximize2, Minimize2, X } from 'lucide-react';
import weddingConfig from '../../config/weddingConfig';
import { useLanguage } from '../../context/LanguageContext';
import styles from './WeddingVideo.module.css';

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default function WeddingVideo() {
  const videoRef = useRef(null);
  const backdropRef = useRef(null);
  const progressRef = useRef(null);
  const hideControlsTimerRef = useRef(null);
  const enteredNativeFsRef = useRef(false);

  const { t } = useLanguage();

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [viewport, setViewport] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1280,
    height: typeof window !== 'undefined' ? window.innerHeight : 720,
  }));

  // Rotate stage 90deg clockwise whenever expanded in a portrait viewport (mobile portrait / DevTools / portrait lock)
  const isRotatedLandscape = isExpanded && viewport.height > viewport.width;

  const scheduleControlsHide = useCallback(() => {
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    setControlsVisible(true);
    hideControlsTimerRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setControlsVisible(false);
      }
    }, 2800);
  }, []);

  useEffect(() => {
    return () => {
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current);
      }
    };
  }, []);

  // Track viewport size & orientation changes so CSS landscape rotation adapts instantaneously
  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);
    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, []);

  const exitExpanded = useCallback(() => {
    setIsExpanded(false);
    setControlsVisible(true);

    if (typeof screen !== 'undefined' && screen.orientation?.unlock) {
      try {
        screen.orientation.unlock();
      } catch {
        // Ignore on browsers where orientation unlock is unsupported
      }
    }

    const fsEl =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement;
    if (fsEl) {
      enteredNativeFsRef.current = false;
      const exitFn =
        document.exitFullscreen ||
        document.webkitExitFullscreen ||
        document.msExitFullscreen;
      if (exitFn) {
        exitFn.call(document).catch?.(() => {});
      }
    }
  }, []);

  // Sync with Escape key & native Fullscreen API exit (e.g. Android Back button)
  useEffect(() => {
    const handleFsChange = () => {
      const fsEl =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement;
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      if (!fsEl && enteredNativeFsRef.current) {
        enteredNativeFsRef.current = false;
        setIsExpanded(false);
        if (typeof screen !== 'undefined' && screen.orientation?.unlock) {
          try {
            screen.orientation.unlock();
          } catch {
            // Ignore
          }
        }
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isExpanded) {
        exitExpanded();
      }
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpanded, exitExpanded]);

  // Lock page scroll while expanded
  useEffect(() => {
    if (!isExpanded) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isExpanded]);

  const togglePlay = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      const vid = videoRef.current;
      if (!vid) return;
      vid.muted = true;

      if (vid.paused) {
        vid.play().catch(() => {});
        setIsPlaying(true);
        setHasStarted(true);
        scheduleControlsHide();
      } else {
        vid.pause();
        setIsPlaying(false);
        setControlsVisible(true);
      }
    },
    [scheduleControlsHide]
  );

  const enterExpanded = useCallback(
    async (e) => {
      if (e) e.stopPropagation();
      setIsExpanded(true);
      setHasStarted(true);
      scheduleControlsHide();

      if (videoRef.current) {
        videoRef.current.muted = true;
        if (videoRef.current.paused) {
          videoRef.current.play().catch(() => {});
        }
      }

      // Request container fullscreen where available & lock hardware landscape on mobile browsers that support it
      const container = backdropRef.current;
      if (container) {
        const reqFs =
          container.requestFullscreen ||
          container.webkitRequestFullscreen ||
          container.msRequestFullscreen;
        if (reqFs) {
          try {
            await reqFs.call(container);
            enteredNativeFsRef.current = true;
            if (typeof screen !== 'undefined' && screen.orientation?.lock) {
              await screen.orientation.lock('landscape').catch(() => {});
            }
          } catch {
            enteredNativeFsRef.current = false;
          }
        }
      }

      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    },
    [scheduleControlsHide]
  );

  const toggleFullscreen = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      if (isExpanded) {
        exitExpanded();
      } else {
        enterExpanded(e);
      }
    },
    [isExpanded, exitExpanded, enterExpanded]
  );

  const handleStageClick = () => {
    if (!hasStarted) {
      togglePlay();
      return;
    }
    // On touch/mobile, if controls were hidden while playing, first tap reveals controls; otherwise toggle play
    if (!controlsVisible && isPlaying) {
      scheduleControlsHide();
      return;
    }
    togglePlay();
  };

  const seekByClientCoords = useCallback(
    (clientX, clientY) => {
      const bar = progressRef.current;
      const vid = videoRef.current;
      if (!bar || !vid || !duration) return;

      const rect = bar.getBoundingClientRect();
      let ratio = 0;
      if (isRotatedLandscape) {
        ratio = rect.height > 0 ? (clientY - rect.top) / rect.height : 0;
      } else {
        ratio = rect.width > 0 ? (clientX - rect.left) / rect.width : 0;
      }
      const clamped = Math.max(0, Math.min(1, ratio));
      const nextTime = clamped * duration;
      vid.currentTime = nextTime;
      setCurrentTime(nextTime);
    },
    [duration, isRotatedLandscape]
  );

  const handleSeekPointerDown = (e) => {
    e.stopPropagation();
    scheduleControlsHide();
    seekByClientCoords(e.clientX, e.clientY);

    const onMove = (ev) => {
      seekByClientCoords(ev.clientX, ev.clientY);
      scheduleControlsHide();
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <section
      className={`section ${styles.videoSection} ${isExpanded ? styles.videoSectionExpanded : ''}`}
      id="video"
      aria-label="Our Memories Video"
    >
      <div className="container">
        <div className="section-header">
          <span className="section-subtitle">{t.video.tag}</span>
          <h2 className="section-title">{t.video.title}</h2>
          <div className="gold-divider">
            <span>❦</span>
          </div>
        </div>

        <div className={`${styles.videoCard} ${isExpanded ? styles.videoCardExpanded : ''}`}>
          {/* Aspect-ratio slot preserves inline layout height smoothly while fullscreen overlay is active */}
          <div className={styles.videoSlot}>
            <div
              ref={backdropRef}
              className={`${styles.playerBackdrop} ${isExpanded ? styles.playerBackdropExpanded : ''}`}
              onMouseMove={() => hasStarted && scheduleControlsHide()}
            >
              <div
                className={`${styles.videoStage} ${
                  isExpanded ? styles.videoStageExpanded : ''
                } ${isRotatedLandscape ? styles.videoStageRotated : ''}`}
                onClick={handleStageClick}
              >
                <video
                  ref={videoRef}
                  src={weddingConfig.videos.memoriesVideo}
                  className={`${styles.videoElement} ${
                    isExpanded ? styles.videoElementExpanded : ''
                  }`}
                  poster={weddingConfig.videos.memoriesPoster}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  controls={false}
                  disablePictureInPicture
                  onLoadedMetadata={(e) => {
                    setDuration(e.currentTarget.duration || 0);
                  }}
                  onDurationChange={(e) => {
                    setDuration(e.currentTarget.duration || 0);
                  }}
                  onTimeUpdate={(e) => {
                    setCurrentTime(e.currentTarget.currentTime || 0);
                  }}
                  onPlay={() => {
                    setIsPlaying(true);
                    setHasStarted(true);
                    scheduleControlsHide();
                  }}
                  onPause={() => {
                    setIsPlaying(false);
                    setControlsVisible(true);
                  }}
                  onEnded={() => {
                    setIsPlaying(false);
                    setControlsVisible(true);
                  }}
                  onVolumeChange={(e) => {
                    if (!e.currentTarget.muted) {
                      e.currentTarget.muted = true;
                    }
                  }}
                >
                  <source src={weddingConfig.videos.memoriesVideo} type="video/mp4" />
                </video>

                {/* Top-right Close button in Landscape Fullscreen */}
                {isExpanded && (
                  <button
                    type="button"
                    className={`${styles.closeFullscreenBtn} ${
                      controlsVisible || !isPlaying ? styles.uiVisible : styles.uiHidden
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      exitExpanded();
                    }}
                    aria-label={t.video.collapseLabel || 'Exit fullscreen'}
                  >
                    <X size={20} />
                  </button>
                )}

                {/* Initial / Paused Center Play Overlay */}
                {!isPlaying && (
                  <div
                    className={styles.playOverlay}
                    onClick={togglePlay}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && togglePlay(e)}
                    aria-label="Play Video"
                  >
                    <div className={styles.playButton}>
                      <Play size={34} style={{ marginLeft: '4px' }} />
                    </div>
                  </div>
                )}

                {/* Quick Expand Corner Button before playback starts */}
                {!hasStarted && !isExpanded && (
                  <button
                    type="button"
                    className={styles.quickExpandBtn}
                    onClick={enterExpanded}
                    aria-label={t.video.expandLabel || 'Fullscreen'}
                    title={t.video.expandLabel || 'Fullscreen'}
                  >
                    <Maximize2 size={18} />
                  </button>
                )}

                {/* Custom Sleek Player Controls (works seamlessly in inline & rotated horizontal fullscreen) */}
                {(hasStarted || isExpanded) && (
                  <div
                    className={`${styles.controlBar} ${
                      controlsVisible || !isPlaying ? styles.uiVisible : styles.uiHidden
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      className={styles.ctrlIconBtn}
                      onClick={togglePlay}
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    </button>

                    <span className={styles.timeText}>
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>

                    <div
                      ref={progressRef}
                      className={styles.progressHitArea}
                      onPointerDown={handleSeekPointerDown}
                      role="slider"
                      aria-valuemin={0}
                      aria-valuemax={Math.round(duration || 0)}
                      aria-valuenow={Math.round(currentTime || 0)}
                      tabIndex={0}
                    >
                      <div className={styles.progressTrack}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      className={styles.ctrlIconBtn}
                      onClick={toggleFullscreen}
                      aria-label={
                        isExpanded
                          ? t.video.collapseLabel || 'Exit fullscreen'
                          : t.video.expandLabel || 'Watch in landscape fullscreen'
                      }
                      title={
                        isExpanded
                          ? t.video.collapseLabel || 'Exit fullscreen'
                          : t.video.expandLabel || 'Watch in landscape fullscreen'
                      }
                    >
                      {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
