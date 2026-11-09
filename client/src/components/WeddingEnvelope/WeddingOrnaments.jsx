import React from 'react';

export function WeddingMonogram({ className, alt = 'Monogram Logo HH' }) {
  return (
    <img
      src="/logo.png"
      alt={alt}
      className={className}
      draggable={false}
    />
  );
}

export function BotanicalSprig({ className }) {
  return (
    <svg className={className} viewBox="0 0 120 165" aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1.05" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 161c32-24 47-50 55-86 5-20 10-35 22-53M29 138c21-17 48-31 71-45M41 120c0-12-5-22-14-34M51 102c12-13 29-24 48-31M59 79c-2-16-6-24-12-34M65 59c10-12 20-19 32-24M19 151c-1-12-3-20-10-29" />
        <path d="M80 26c-3-12 0-20 9-24 3 10-1 18-9 24ZM67 52c-8-7-10-15-6-24 7 6 10 15 6 24ZM93 36c4-9 12-13 21-12-3 8-10 12-21 12ZM46 46c-11-2-16-10-17-20 10 2 17 10 17 20ZM54 66c-11-3-17-10-18-19 10 2 17 9 18 19ZM69 84c3-12 11-17 21-19-2 10-9 16-21 19ZM96 72c4-9 12-13 22-12-4 8-12 12-22 12ZM26 87c-11-2-18-9-19-19 10 2 17 9 19 19ZM36 106c-10-4-15-10-15-19 9 4 15 10 15 19ZM49 124c4-10 11-14 22-14-4 9-12 14-22 14ZM77 107c4-9 13-13 22-12-5 9-13 13-22 12ZM97 95c4-7 11-10 21-10-5 7-12 11-21 10ZM32 137c9-3 19 0 24 7-10 2-18-1-24-7ZM10 123c-7-3-10-9-9-16 7 3 10 9 9 16Z" fill="currentColor" fillOpacity=".15" />
        <path d="M80 25l6-16M67 51l-4-16m31 1 14-8M46 46l-12-14m20 33L41 53m28 31 15-14m14 1 14-8M26 87 12 75m24 31-11-14m24 32 16-11m13-6 14-8m6-4 14-7m-80 49 16 5m-39-19-5-12" opacity=".56" />
      </g>
    </svg>
  );
}
