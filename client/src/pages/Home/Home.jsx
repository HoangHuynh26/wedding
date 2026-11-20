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
import WeddingHero from '../../components/WeddingHero/WeddingHero';
import WeddingSchedule from '../../components/WeddingSchedule/WeddingSchedule';
import weddingConfig from '../../config/weddingConfig';
import { useAudio } from '../../context/AudioContext';
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
  const { pathname, hash } = useLocation();
  const { playAudio } = useAudio();
  const fragment = hash.slice(1);
  const pathSegments = pathname.replace(/^\/|\/$/g, '').split('/');
  const lastSegment = pathSegments[pathSegments.length - 1] || '';
  const destination = sectionIds.has(fragment)
    ? fragment
    : (lastSegment === 'rsvp' || lastSegment === 'story' || lastSegment === 'invitation'
        ? lastSegment
        : '');

  const [phase, setPhase] = useState(() => (destination ? 'open' : 'sealed'));
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
    if (phase !== 'opening') return undefined;
    const preference = window.matchMedia(motionPreference);
    const finish = () => setPhase('open');
    // The veil's transition normally finishes the opening. Allow for a suspended tab.
    const fallback = window.setTimeout(finish, 5350);
    preference.addEventListener('change', finish);
    return () => {
      window.clearTimeout(fallback);
      preference.removeEventListener('change', finish);
    };
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
    void playAudio({ fromStart: true, fadeMs: 1400 });
    setPhase(window.matchMedia(motionPreference).matches ? 'open' : 'opening');
  }

  return (
    <main className="wedding-home">
      <div className="wedding-front" style={themeStyle}>
        <WeddingHero phase={phase}>
          {locked && (
            <WeddingEnvelope
              phase={phase}
              onOpen={openInvitation}
              onOpened={() => setPhase('open')}
            />
          )}
        </WeddingHero>
      </div>

      {!locked && (
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

          {/* Step 7: "The Day / Lịch Trình" with 3D Blind-Embossed Draped Curtains & Tassels (Image 13) */}
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
