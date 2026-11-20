import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AudioProvider } from './context/AudioContext';
import { LanguageProvider } from './context/LanguageContext';
import Home from './pages/Home/Home';
import Admin from './pages/Admin/Admin';
import NotFound from './pages/NotFound/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AudioProvider>
          <Routes>
            {/* Trang Thiệp Mời Cô Dâu (Lễ Vu Quy • 17/01/2027) */}
            <Route path="/" element={<Home />} />
            <Route path="/co-dau" element={<Home />} />
            <Route path="/nha-gai" element={<Home />} />
            <Route path="/bride" element={<Home />} />
            <Route path="/invitation" element={<Home />} />
            <Route path="/rsvp" element={<Home />} />
            <Route path="/story" element={<Home />} />

            {/* Trang Thiệp Mời Chú Rể (Lễ Tân Hôn • 24/01/2027) */}
            <Route path="/chu-re" element={<Home />} />
            <Route path="/chu-re/invitation" element={<Home />} />
            <Route path="/chu-re/rsvp" element={<Home />} />
            <Route path="/chu-re/story" element={<Home />} />
            <Route path="/nha-trai" element={<Home />} />
            <Route path="/groom" element={<Home />} />

            {/* Trang Admin Riêng Cho 2 Bên (Cô Dâu & Chú Rể) */}
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/co-dau" element={<Admin />} />
            <Route path="/co-dau/admin" element={<Admin />} />
            <Route path="/admin/nha-gai" element={<Admin />} />
            <Route path="/admin/bride" element={<Admin />} />

            <Route path="/admin/chu-re" element={<Admin />} />
            <Route path="/chu-re/admin" element={<Admin />} />
            <Route path="/admin/nha-trai" element={<Admin />} />
            <Route path="/admin/groom" element={<Admin />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AudioProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
