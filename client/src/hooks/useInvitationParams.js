import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import weddingConfig from '../config/weddingConfig';

/**
 * Hook to extract and sanitize personalized invitation query parameters.
 * Supported query keys:
 * - to / guest / name: Recipient / Guest Name (e.g., "Anh Tuấn & Chị Lan")
 * - from / inviter / sender: Inviter Name (e.g., "Chú rể Đình Huy")
 * - music / song / track: Specific background song id (e.g., "until-i-found-you")
 */
export function useInvitationParams() {
  const location = useLocation();

  return useMemo(() => {
    try {
      const searchParams = new URLSearchParams(location.search);
      
      const to = (
        searchParams.get('to') ||
        searchParams.get('guest') ||
        searchParams.get('name') ||
        ''
      ).trim();

      const from = (
        searchParams.get('from') ||
        searchParams.get('inviter') ||
        searchParams.get('sender') ||
        ''
      ).trim();

      const songId = (
        searchParams.get('music') ||
        searchParams.get('song') ||
        searchParams.get('track') ||
        ''
      ).trim().toLowerCase();

      // Find song in playlist if specified
      const playlist = weddingConfig.playlist || [];
      const foundSong = playlist.find((s) => s.id.toLowerCase() === songId);
      const selectedSong = foundSong || playlist[0] || weddingConfig.music;

      return {
        guestName: to,
        inviterName: from,
        songId: foundSong ? foundSong.id : '',
        selectedSong,
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

