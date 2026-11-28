import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function NotFound() {
  const location = useLocation();
  const { t, language, isGroomSide } = useLanguage();
  const nf = t.notFound || {};

  const params = new URLSearchParams(location.search);
  if (
    language &&
    language !== 'vi' &&
    !params.get('lang') &&
    !params.get('language') &&
    !params.get('locale')
  ) {
    params.set('lang', language);
  }
  const queryString = params.toString();
  const backToPath = `${isGroomSide ? '/chu-re' : '/'}${queryString ? `?${queryString}` : ''}`;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: 'var(--bg-light)',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          border: '1.5px solid var(--gold-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
          color: 'var(--gold-primary)',
        }}
      >
        <Heart size={32} />
      </div>

      <h1
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '3rem',
          color: 'var(--text-dark)',
          marginBottom: '0.5rem',
        }}
      >
        404
      </h1>

      <p
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.4rem',
          color: 'var(--text-dark)',
          marginBottom: '1rem',
        }}
      >
        {nf.title || 'Trang Không Tồn Tại'}
      </p>

      <p
        style={{
          color: 'var(--text-dark-secondary)',
          maxWidth: '420px',
          marginBottom: '2rem',
          fontSize: '0.95rem',
        }}
      >
        {nf.description || 'Trang bạn tìm kiếm không tồn tại hoặc đã được chuyển hướng. Mời bạn trở về trang thiệp cưới chính.'}
      </p>

      <Link
        to={backToPath}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.85rem 1.8rem',
          backgroundColor: 'var(--gold-primary)',
          color: '#ffffff',
          borderRadius: 'var(--border-radius-pill)',
          fontWeight: '600',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontSize: '0.82rem',
        }}
      >
        {nf.backHome || 'Về Trang Thiệp Cưới'}
      </Link>
    </div>
  );
}
