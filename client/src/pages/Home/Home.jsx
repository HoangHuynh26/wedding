import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Contact from '../../components/Contact/Contact';
import Countdown from '../../components/Countdown/Countdown';
import CursorEffect from '../../components/CursorEffect/CursorEffect';
import Footer from '../../components/Footer/Footer';
import FormalInvitation from '../../components/FormalInvitation/FormalInvitation';
import Gallery from '../../components/Gallery/Gallery';
import LoveStory from '../../components/LoveStory/LoveStory';
import MobileQuickActions from '../../components/MobileQuickActions/MobileQuickActions';
import MusicButton from '../../components/MusicButton/MusicButton';
import RSVP from '../../components/RSVP/RSVP';
import ScratchReveal from '../../components/ScratchReveal/ScratchReveal';
import Venue from '../../components/Venue/Venue';
import WeddingEnvelope from '../../components/WeddingEnvelope/WeddingEnvelope';
import { WRAP_CLEAR_MS } from '../../components/WeddingEnvelope/openingTiming';
import WeddingHero from '../../components/WeddingHero/WeddingHero';
import WeddingSchedule from '../../components/WeddingSchedule/WeddingSchedule';
import { schedulePaper, scheduleVelvet } from '../../components/WeddingSchedule/scheduleCurtains';
import weddingConfig from '../../config/weddingConfig';
import { useAudio } from '../../context/AudioContext';
import { validateInvitationSearch } from '../../utils/invitationCodec';
import NotFound from '../NotFound/NotFound';
import './Home.css';

const motionPreference = '(prefers-reduced-motion: reduce)';
const sectionIds = new Set([
  'hero',
  'countdown',
  'scratch-photo',
  'venue',
  'schedule',
  'transportation',
  'invitation',
  'gallery',
  'story',
  'rsvp',
  'contact',
  'footer',
]);

const { theme } = weddingConfig;
const themeStyle = {
  '--wedding-ivory': theme.ivory,
  '--wedding-champagne': theme.champagne,
  '--wedding-pearl': theme.pearl,
  '--wedding-navy': theme.navy,
  '--wedding-gold': theme.gold,
  '--wedding-slate': theme.slate,
};

export default function WeddingExperience() {
  const { pathname, search, hash } = useLocation();
  const { playAudio, getPlaybackTime } = useAudio();
  const isQueryValid = validateInvitationSearch(search, weddingConfig.playlist).isValid;
  const fragment = hash.slice(1);
  const pathSegments = pathname.replace(/^\/|\/$/g, '').split('/');
  const lastSegment = pathSegments[pathSegments.length - 1] || '';
  const destination = sectionIds.has(fragment)
    ? fragment
    : (lastSegment === 'rsvp' || lastSegment === 'story' || lastSegment === 'invitation'
        ? lastSegment
        : '');

  const isPreviewEmbed =
    typeof window !== 'undefined' &&
    window.self !== window.top &&
    new URLSearchParams(search).get('preview') === '1';

  const [phase, setPhase] = useState(() => (destination || isPreviewEmbed ? 'open' : 'sealed'));
  const [belowFoldMounted, setBelowFoldMounted] = useState(() =>
    Boolean(destination || isPreviewEmbed)
  );
  const openedByGuest = useRef(false);
  const locked = isQueryValid && phase !== 'open';
  const previewGoalYRef = useRef(null);
  const previewRafRef = useRef(0);

  // Live Admin Studio Scroll-Sync & Envelope Toggle Bridge (?preview=1 inside Admin iframe)
  useEffect(() => {
    if (!isPreviewEmbed) return undefined;

    const stepScroll = () => {
      const goal = previewGoalYRef.current;
      if (typeof goal !== 'number') {
        previewRafRef.current = 0;
        return;
      }
      const current = window.scrollY || window.pageYOffset || 0;
      const diff = goal - current;
      if (Math.abs(diff) < 1.2) {
        window.scrollTo({ top: goal, behavior: 'instant' });
        previewGoalYRef.current = null;
        previewRafRef.current = 0;
        return;
      }
      window.scrollTo({ top: current + diff * 0.24, behavior: 'instant' });
      previewRafRef.current = window.requestAnimationFrame(stepScroll);
    };

    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'WEDDING_CMS_PREVIEW_ENVELOPE') {
        if (data.sealed) {
          previewGoalYRef.current = null;
          window.scrollTo({ top: 0, behavior: 'instant' });
          setPhase('sealed');
        } else {
          setBelowFoldMounted(true);
          setPhase('open');
        }
        return;
      }

      if (data.type === 'WEDDING_CMS_SYNC_SCROLL') {
        setBelowFoldMounted(true);
        setPhase((prev) => (prev === 'sealed' ? 'open' : prev));

        const sectionId = data.sectionId || 'hero';
        const progress = Math.max(0, Math.min(1, Number(data.progress) || 0));

        const computeAndDrive = () => {
          const el = document.getElementById(sectionId);
          if (!el) return;
          const vh = window.innerHeight || 600;
          const topOffset =
            sectionId === 'hero'
              ? 0
              : sectionId === 'schedule'
                ? 12
                : Math.min(36, Math.round(vh * 0.06));
          const rect = el.getBoundingClientRect();
          const sectionTop = Math.max(0, rect.top + (window.scrollY || 0) - topOffset);
          const visibleBudget = Math.max(180, vh - topOffset - 20);
          const scrollableSpan = Math.max(0, el.offsetHeight - visibleBudget);
          const maxDocScroll = Math.max(
            0,
            document.documentElement.scrollHeight - vh
          );
          const targetY = Math.min(
            maxDocScroll,
            Math.max(0, sectionTop + scrollableSpan * progress)
          );
          previewGoalYRef.current = targetY;
          if (!previewRafRef.current) {
            previewRafRef.current = window.requestAnimationFrame(stepScroll);
          }
        };

        window.requestAnimationFrame(computeAndDrive);
      }
    };

    window.addEventListener('message', handleMessage);
    try {
      window.parent.postMessage({ type: 'WEDDING_PREVIEW_READY' }, window.location.origin);
    } catch {
      // ignore
    }

    return () => {
      window.removeEventListener('message', handleMessage);
      if (previewRafRef.current) {
        window.cancelAnimationFrame(previewRafRef.current);
        previewRafRef.current = 0;
      }
    };
  }, [isPreviewEmbed]);

  useEffect(() => {
    if (!locked) return undefined;

    const { style: rootStyle } = document.documentElement;
    const { style: bodyStyle } = document.body;
    const rootOverflow = rootStyle.overflow;
    const bodyOverflow = bodyStyle.overflow;
    window.scrollTo({ top: 0, behavior: 'instant' });
    rootStyle.overflow = 'hidden';
    bodyStyle.overflow = 'hidden';

    return () => {
      rootStyle.overflow = rootOverflow;
      bodyStyle.overflow = bodyOverflow;
    };
  }, [locked]);

  // Preload & decode critical below-the-fold images as soon as the envelope starts opening
  // so every section renders instantly with zero scroll lag or pop-in flash
  useEffect(() => {
    if (phase === 'sealed') return undefined;
    const criticalAssets = [
      weddingConfig.formalPhoto || '/photos/tuan-0992.webp',
      '/mauve-theme/mother-of-pearl.webp',
      '/mauve-theme/jeweled-frame-cutout.webp?v=4',
      schedulePaper,
      scheduleVelvet,
      '/mauve-theme/wax-seal-hh.webp',
    ];
    const imgs = criticalAssets.map((src) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = src;
      if (typeof img.decode === 'function') {
        img.decode().catch(() => {});
      }
      return img;
    });
    return () => {
      imgs.length = 0;
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'opening') return undefined;
    const preference = window.matchMedia(motionPreference);
    const startedAt = performance.now();
    const targetSec = WRAP_CLEAR_MS / 1000;
    let rafId = 0;

    const finish = () => {
      window.cancelAnimationFrame(rafId);
      setPhase('open');
    };

    // Lock Hero name reveal directly to the audio playback clock (~5.42s veil clear -> 6.00s chorus climax)
    // with safe wall-clock bounds [WRAP_CLEAR_MS, WRAP_CLEAR_MS + 650ms] if audio is muted or blocked.
    const checkSync = (now) => {
      const wallElapsedMs = now - startedAt;
      if (wallElapsedMs >= WRAP_CLEAR_MS) {
        const audioSec = getPlaybackTime ? getPlaybackTime() : null;
        if (
          audioSec === null ||
          audioSec < 0.1 ||
          audioSec >= targetSec ||
          wallElapsedMs >= WRAP_CLEAR_MS + 650
        ) {
          finish();
          return;
        }
      }
      rafId = window.requestAnimationFrame(checkSync);
    };

    rafId = window.requestAnimationFrame(checkSync);
    preference.addEventListener('change', finish);
    return () => {
      window.cancelAnimationFrame(rafId);
      preference.removeEventListener('change', finish);
    };
  }, [phase, getPlaybackTime]);

  // Mount below-the-fold sections right after the Hero couple names have cleanly bloomed on the 6.00s climax
  // so React never drops frames during the 5.42s -> 6.05s calligraphy reveal!
  useEffect(() => {
    if (phase !== 'open') return undefined;
    if (destination || belowFoldMounted) {
      setBelowFoldMounted(true);
      return undefined;
    }
    const timer = window.setTimeout(() => {
      setBelowFoldMounted(true);
    }, 520);
    return () => window.clearTimeout(timer);
  }, [phase, destination, belowFoldMounted]);

  useEffect(() => {
    if (destination && locked) setPhase('open');
  }, [destination, locked]);

  useEffect(() => {
    if (locked) return undefined;

    if (openedByGuest.current && !destination) {
      document.getElementById('wedding-title')?.focus({ preventScroll: true });
      openedByGuest.current = false;
      return undefined;
    }

    if (!destination) return undefined;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(destination)?.scrollIntoView();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [destination, locked]);

  function openInvitation() {
    if (phase !== 'sealed') return;
    openedByGuest.current = true;
    const reducedMotion = window.matchMedia(motionPreference).matches;
    void playAudio({
      fromStart: true,
      startAtSec: reducedMotion ? 5.2 : 0,
      fadeMs: 350,
      syncWithTimestamp: reducedMotion ? null : performance.now(),
    });
    setPhase(reducedMotion ? 'open' : 'opening');
  }

  if (!isQueryValid) {
    return <NotFound />;
  }

  return (
    <main className="wedding-home">
      <div className="wedding-front" style={themeStyle}>
        <WeddingHero phase={phase}>
          {locked && (
            <WeddingEnvelope
              phase={phase}
              onOpen={openInvitation}
            />
          )}
        </WeddingHero>
      </div>

      {!locked && belowFoldMounted && (
        <>
          <CursorEffect />
          <MusicButton />
          <MobileQuickActions />

          {/* Step 5A: Twilight Dusty Slate-Lavender Countdown Band (Images 9–11) */}
          <Countdown />

          {/* Formal Family Invitation (Nhà Gái / Nhà Trai / Kính Mời) directly below Countdown */}
          <FormalInvitation />

          {/* Step 5B: Mother-of-Pearl Interactive Scratch-to-Reveal Couple Portrait (Images 9–11) */}
          <ScratchReveal />

          {/* Wedding schedule with scroll-linked velvet curtains */}
          <WeddingSchedule />

          {/* Step 6: Pale Mauve-Lilac Location & Directions Section + Villa Etching + Double-Border CTA (Image 12) */}
          <Venue />

          {/* Wedding Album, RSVP & Footer (harmonized in Mauve Couture Palette) */}
          <Gallery />
          <RSVP />
          <Footer />
        </>
      )}
    </main>
  );
}
