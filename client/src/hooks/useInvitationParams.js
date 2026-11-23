import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import weddingConfig from '../config/weddingConfig';
import {
  decodeUtf8Base64Url,
  repairCorruptedParam,
  resolveInviterSlug,
} from '../utils/invitationCodec';

/**
 * Hook to extract and sanitize personalized invitation query parameters.
 * Supported query keys:
 * - to / to64 / guest / name: Recipient / Guest Name (ASCII-safe Base64URL or plain UTF-8)
 * - from / from64 / inviter / sender: Inviter Name (ASCII preset slug, Base64URL, or plain UTF-8)
 * - music / song / track: Specific background song id (e.g., "wildest-dreams-piano")
 */
export function useInvitationParams() {
  const location = useLocation();

  return useMemo(() => {
    try {
      const searchParams = new URLSearchParams(location.search);

      const rawTo64 = searchParams.get('to64') || '';
      const decodedTo64 = rawTo64 ? decodeUtf8Base64Url(rawTo64).trim() : '';
      const rawTo = (
        searchParams.get('to') ||
        searchParams.get('guest') ||
        searchParams.get('name') ||
        ''
      ).trim();
      const to =
        decodedTo64 ||
        repairCorruptedParam(rawTo, location.search, ['to', 'guest', 'name']);

      const rawFrom64 = searchParams.get('from64') || '';
      const decodedFrom64 = rawFrom64 ? decodeUtf8Base64Url(rawFrom64).trim() : '';
      const rawFrom = (
        searchParams.get('from') ||
        searchParams.get('inviter') ||
        searchParams.get('sender') ||
        ''
      ).trim();
      const from =
        decodedFrom64 ||
        resolveInviterSlug(rawFrom) ||
        repairCorruptedParam(rawFrom, location.search, ['from', 'inviter', 'sender']);

      const songId = (
        searchParams.get('music') ||
        searchParams.get('song') ||
        searchParams.get('track') ||
        ''
      ).trim().toLowerCase();

      const rawLang = (
        searchParams.get('lang') ||
        searchParams.get('language') ||
        searchParams.get('locale') ||
        ''
      ).trim().toLowerCase();

      let lang = 'vi';
      if (rawLang === 'en' || rawLang === 'english' || rawLang === 'eng') {
        lang = 'en';
      } else if (rawLang === 'zh' || rawLang === 'cn' || rawLang.startsWith('zh-') || rawLang === 'chinese') {
        lang = 'zh';
      }

      // Find song in playlist if specified
      const playlist = weddingConfig.playlist || [];
      const defaultSong =
        playlist.find((s) => s.id === weddingConfig.music?.id) || playlist[0] || weddingConfig.music;
      const foundSong = playlist.find((s) => s.id.toLowerCase() === songId);
      const selectedSong = foundSong || defaultSong;

      return {
        guestName: to,
        inviterName: from,
        songId: foundSong ? foundSong.id : '',
        selectedSong,
        lang,
        hasLangParam: Boolean(rawLang),
        hasPersonalization: Boolean(to || from || songId),
      };
    } catch {
      return {
        guestName: '',
        inviterName: '',
        songId: '',
        selectedSong: weddingConfig.playlist?.[0] || weddingConfig.music,
        hasPersonalization: false,
      };
    }
  }, [location.search]);
}

export default useInvitationParams;

