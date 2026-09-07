import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AudioProvider } from './context/AudioContext';
import { LanguageProvider } from './context/LanguageContext';
import Home from './pages/Home/Home';
import Admin from './pages/Admin/Admin';
import NotFound from './pages/NotFound/NotFound';

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AudioProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/invitation" element={<Home />} />
            <Route path="/rsvp" element={<Home />} />
            <Route path="/story" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AudioProvider>
      </BrowserRouter>
    </LanguageProvider>
  );
}
