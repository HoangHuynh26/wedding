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
import Venue from '../../components/Venue/Venue';
import WeddingEnvelope from '../../components/WeddingEnvelope/WeddingEnvelope';
import WeddingHero from '../../components/WeddingHero/WeddingHero';
import WeddingVideo from '../../components/WeddingVideo/WeddingVideo';
import weddingConfig from '../../config/weddingConfig';
import { useAudio } from '../../context/AudioContext';
import './Home.css';

const openingDuration = 1850;
const revealDuration = 1800;
const motionPreference = '(prefers-reduced-motion: reduce)';
const sectionIds = new Set(['hero', 'invitation', 'story', 'countdown', 'gallery', 'venue', 'rsvp', 'contact']);
const { theme } = weddingConfig;
const themeStyle = {
  '--wedding-ivory': theme.ivory,
  '--wedding-champagne': theme.champagne,
  '--wedding-pearl': theme.pearl,
  '--wedding-navy': theme.navy,
  '--wedding-gold': theme.gold,
};

export default function WeddingExperience() {
  const { pathname, hash } = useLocation();
  const { playAudio } = useAudio();
  const fragment = hash.slice(1);
  const pathSection = pathname.replace(/^\/|\/$/g, '');
  const destination = sectionIds.has(fragment)
    ? fragment
    : (pathSection === 'rsvp' || pathSection === 'story' ? pathSection : '');
  const [phase, setPhase] = useState(() => destination ? 'open' : 'sealed');
  const openedByGuest = useRef(false);
  const locked = phase !== 'open';

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

  useEffect(() => {
    if (phase !== 'opening' && phase !== 'reveal') return undefined;

    const opening = phase === 'opening';
    const timer = window.setTimeout(
      () => setPhase(opening ? 'reveal' : 'open'),
      opening ? openingDuration : revealDuration,
    );
    return () => window.clearTimeout(timer);
  }, [phase]);

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
    // Start playback while the browser still has the guest's click or key press.
    void playAudio();
    setPhase(window.matchMedia(motionPreference).matches ? 'open' : 'opening');
  }

  return (
    <main className="wedding-home">
      <div className="wedding-front" style={themeStyle}>
        <div inert={locked}>
          <WeddingHero phase={phase} />
        </div>
        {locked && <WeddingEnvelope phase={phase} onOpen={openInvitation} />}
      </div>
      {!locked && (
        <>
          <CursorEffect />
          <MusicButton />
          <MobileQuickActions />
          <FormalInvitation />
          <LoveStory />
          <Countdown />
          {/* <WeddingVideo /> — Ẩn tạm thời, sẽ hoàn thiện sau */}
          <Gallery />
          <Venue />
          <RSVP />
          <Contact />
          <Footer />
        </>
      )}
    </main>
  );
}
