import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Components
import EnvelopeIntro from '../../components/EnvelopeIntro/EnvelopeIntro';
import Hero from '../../components/Hero/Hero';
import FormalInvitation from '../../components/FormalInvitation/FormalInvitation';
import Intro from '../../components/Intro/Intro';
import LoveStory from '../../components/LoveStory/LoveStory';
import Countdown from '../../components/Countdown/Countdown';
import WeddingVideo from '../../components/WeddingVideo/WeddingVideo';
import Gallery from '../../components/Gallery/Gallery';
import Venue from '../../components/Venue/Venue';
import QRCode from '../../components/QRCode/QRCode';
import RSVP from '../../components/RSVP/RSVP';
import Contact from '../../components/Contact/Contact';
import Footer from '../../components/Footer/Footer';
import MusicButton from '../../components/MusicButton/MusicButton';
import CursorEffect from '../../components/CursorEffect/CursorEffect';
import LanguageToggle from '../../components/LanguageToggle/LanguageToggle';
import "./Home.css"

export default function Home() {
  const location = useLocation();
  // Sealed envelope gate displayed on initial visit
  const [showEnvelope, setShowEnvelope] = useState(true);

  // Position viewport directly at Hero section from the beginning and lock background scrolling
  useEffect(() => {
    if (showEnvelope) {
      window.scrollTo(0, 0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showEnvelope]);

  useEffect(() => {
    // Handle direct hash or route shortcuts like /rsvp or /story
    if (location.pathname === '/rsvp') {
      setShowEnvelope(false);
      const rsvpEl = document.getElementById('rsvp');
      if (rsvpEl) {
        setTimeout(() => rsvpEl.scrollIntoView({ behavior: 'smooth' }), 300);
      }
    } else if (location.pathname === '/story') {
      setShowEnvelope(false);
      const storyEl = document.getElementById('story');
      if (storyEl) {
        setTimeout(() => storyEl.scrollIntoView({ behavior: 'smooth' }), 300);
      }
    }
  }, [location.pathname]);

  return (
    <main style={{ position: 'relative', width: '100%', overflowX: 'hidden' }}>

      {/* 0. Sealed Envelope Opening Gate & Opening Animation */}
      <EnvelopeIntro
        isVisible={showEnvelope}
        onOpenComplete={() => {
          setShowEnvelope(false);
          document.body.style.overflow = '';
          // Ensure fullscreen hero video starts playback
          const heroVideo = document.querySelector('#hero video');
          if (heroVideo) {
            heroVideo.play().catch(() => {});
          }
        }}
      />

      {/* Desktop Custom Cursor */}
      <CursorEffect />

      {/* Floating Background Music Player */}
      <MusicButton />

      {/* 1. Fullscreen Cinematic Hero with Video */}
      <Hero />

      {/* 2. Formal Luxury Wedding Invitation Card */}
      <FormalInvitation />


      {/* 3. Vertical Love Story Timeline (2021 - 2026) */}
      <LoveStory />

      {/* 4. Wedding Countdown Timer */}
      <Countdown />

      {/* 5. "Our Memories" Video Section */}
      <WeddingVideo />

      {/* 6. Photo Gallery with Interactive Lightbox */}
      <Gallery />

      {/* 7. Venue Details & Google Maps Integration */}
      <Venue />


      {/* 9. Cinematic RSVP Reveal & Form (Dispatches to Make.com for Excel) */}
      <RSVP />

      {/* 10. Direct Contact Cards & Support */}
      <Contact />

      {/* 11. Warm Romantic Footer */}
      <Footer />
    </main>
  );
}
