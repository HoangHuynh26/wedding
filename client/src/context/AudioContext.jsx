import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import weddingConfig from '../config/weddingConfig';

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const location = useLocation();
  const playlist = weddingConfig.playlist || [];
  const defaultTrack =
    playlist.find((s) => s.id === weddingConfig.music?.id) || playlist[0] || weddingConfig.music;

  // Resolve track from URL or default
  const getTrackFromQuery = useCallback(() => {
    try {
      const searchParams = new URLSearchParams(location.search);
      const songId = (
        searchParams.get('music') ||
        searchParams.get('song') ||
        searchParams.get('track') ||
        ''
      ).trim().toLowerCase();

      if (songId) {
        const matched = playlist.find((s) => s.id.toLowerCase() === songId);
        if (matched) return matched;
      }
    } catch {
      // Fallback
    }
    return defaultTrack;
  }, [location.search, playlist, defaultTrack]);

  const [currentTrack, setCurrentTrack] = useState(getTrackFromQuery);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const fadeRafRef = useRef(null);
  const currentTrackRef = useRef(currentTrack);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const stopFade = useCallback(() => {
    if (fadeRafRef.current) {
      cancelAnimationFrame(fadeRafRef.current);
      fadeRafRef.current = null;
    }
  }, []);

  // Gentle studio volume swell on desktop/Android browsers (iOS uses the file's baked-in qsin fade)
  const rampVolume = useCallback((audio, from = 0.25, to = 1, durationMs = 1100) => {
    stopFade();
    try {
      audio.volume = from;
    } catch {
      return;
    }
    const startedAt = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - startedAt) / durationMs);
      const eased = progress * progress * (3 - 2 * progress);
      try {
        audio.volume = from + (to - from) * eased;
      } catch {
        fadeRafRef.current = null;
        return;
      }
      if (progress < 1 && !audio.paused) {
        fadeRafRef.current = requestAnimationFrame(tick);
      } else {
        fadeRafRef.current = null;
      }
    };
    fadeRafRef.current = requestAnimationFrame(tick);
  }, [stopFade]);

  // Initialize Audio instance once
  useEffect(() => {
    const audio = new Audio();
    const initialTrack = getTrackFromQuery();
    audio.src = initialTrack?.src || defaultTrack.src;
    audio.loop = true;
    audio.preload = 'auto';

    audio.onerror = () => {
      console.warn('Primary music source failed, attempting fallback...');
      const active = currentTrackRef.current;
      const fallback = active?.fallbackSrc || defaultTrack.fallbackSrc;
      if (fallback && audio.src !== fallback) {
        audio.src = fallback;
        audio.load();
        if (isPlayingRef.current) {
          audio.play().catch(() => {});
        }
      }
    };

    audio.onplay = () => setIsPlaying(true);
    audio.onpause = () => setIsPlaying(false);
    audio.onended = () => setIsPlaying(false);

    audioRef.current = audio;

    return () => {
      stopFade();
      audio.pause();
      audio.src = '';
    };
  }, []); // Run once on mount

  // Sync track when query parameter changes (e.g. visiting a link with ?music=...)
  useEffect(() => {
    const targetTrack = getTrackFromQuery();
    if (targetTrack && targetTrack.id !== currentTrack?.id) {
      setCurrentTrack(targetTrack);
      if (audioRef.current) {
        const wasPlaying = isPlaying;
        audioRef.current.src = targetTrack.src;
        audioRef.current.load();
        if (wasPlaying) {
          audioRef.current.play().catch((err) => {
            console.warn('Playback on track change prevented:', err);
          });
        }
      }
    }
  }, [location.search, getTrackFromQuery, currentTrack?.id, isPlaying]);

  const changeTrack = useCallback((trackOrId, autoPlay = true) => {
    let newTrack = trackOrId;
    if (typeof trackOrId === 'string') {
      newTrack = playlist.find((s) => s.id.toLowerCase() === trackOrId.toLowerCase()) || defaultTrack;
    }
    if (!newTrack) return;

    setCurrentTrack(newTrack);
    if (audioRef.current) {
      audioRef.current.src = newTrack.src;
      audioRef.current.load();
      if (autoPlay) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn('Playback prevented by browser policy:', err);
          });
      }
    }
  }, [playlist, defaultTrack]);

  const playAudio = async (options = {}) => {
    const {
      fromStart = false,
      startAtSec = 0,
      fadeMs = 900,
      syncWithTimestamp = null,
    } = options || {};
    if (audioRef.current) {
      try {
        if (fromStart) {
          try {
            audioRef.current.currentTime = Math.max(0, startAtSec);
          } catch {
            // Ignore seek before metadata is loaded
          }
        }
        await audioRef.current.play();
        if (fromStart && typeof syncWithTimestamp === 'number') {
          const driftSec = (performance.now() - syncWithTimestamp) / 1000;
          if (driftSec > 0.18 && driftSec < 3.5) {
            try {
              audioRef.current.currentTime = Math.max(0, startAtSec + driftSec);
            } catch {
              // Ignore seek failure
            }
          }
        }
        rampVolume(audioRef.current, fromStart ? 0.65 : 0.45, 1, fadeMs);
        setIsPlaying(true);
        return true;
      } catch (err) {
        console.warn('Audio playback failed or prevented by browser:', err);
        return false;
      }
    }
    return false;
  };

  const pauseAudio = () => {
    stopFade();
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleAudio = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        currentTrack,
        playlist,
        changeTrack,
        playAudio,
        pauseAudio,
        toggleAudio,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}

export default AudioContext;
