import React, { useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { LockKeyhole } from 'lucide-react';
import styles from './AdminGate.module.css';

const verifier = __ADMIN_PIN_VERIFIER__;
const storageKey = 'wedding.admin.access';
const accessDuration = 24 * 60 * 60 * 1000;

function readAccessExpiry() {
  if (!verifier) return 0;
  try {
    const access = JSON.parse(localStorage.getItem(storageKey));
    const remaining = access?.expiresAt - Date.now();
    if (
      access?.fingerprint === verifier.fingerprint &&
      Number.isSafeInteger(access.expiresAt) &&
      remaining > 0 &&
      remaining <= accessDuration
    ) {
      return access.expiresAt;
    }
  } catch {
    // Treat unavailable or unreadable browser storage as locked.
  }
  return 0;
}

async function matchesPin(pin) {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) return false;

  const encoder = new TextEncoder();
  const key = await subtle.importKey('raw', encoder.encode(pin), 'PBKDF2', false, ['deriveBits']);
  const bits = await subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: encoder.encode(verifier.salt),
      iterations: verifier.iterations,
    },
    key,
    256,
  );

  const fingerprint = Array.from(new Uint8Array(bits), byte =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
  return fingerprint === verifier.fingerprint;
}

function AdminPinForm({ onUnlock }) {
  const pinRef = useRef(null);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const unavailable = !verifier
    ? 'Mã truy cập Admin chưa được cấu hình.'
    : !globalThis.crypto?.subtle
      ? 'Mở trang qua HTTPS hoặc localhost để nhập mã.'
      : '';

  function handlePinChange(event) {
    const input = event.currentTarget;
    input.value = input.value.replace(/[^0-9]/g, '');
    if (error) setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (unavailable || checking) return;

    const input = pinRef.current;
    const pin = input.value;
    if (!pin) {
      setError('Vui lòng nhập mã truy cập.');
      input.focus();
      return;
    }

    setChecking(true);
    setError('');
    let matched;
    try {
      matched = pin.length === verifier.digits && await matchesPin(pin);
    } catch {
      setError('Không thể kiểm tra mã. Vui lòng thử lại.');
    } finally {
      input.value = '';
      setChecking(false);
    }

    if (matched) {
      onUnlock();
      return;
    }
    if (matched === false) setError('Mã truy cập không đúng. Vui lòng thử lại.');
    input.focus();
  }

  return (
    <main className={styles.screen}>
      <form
        className={styles.panel}
        aria-labelledby="admin-unlock-title"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className={styles.lockIcon} aria-hidden="true">
          <LockKeyhole size={22} strokeWidth={1.7} />
        </div>
        <h1 id="admin-unlock-title" className={styles.title}>Mở khóa Admin</h1>
        <p className={styles.subtitle}>Mỗi lần mở khóa có hiệu lực trong 24 giờ.</p>

        <label className={styles.label} htmlFor="admin-pin">Mã truy cập</label>
        <input
          ref={pinRef}
          id="admin-pin"
          className={styles.pinInput}
          type="password"
          inputMode="numeric"
          autoComplete="off"
          aria-describedby={error || unavailable ? 'admin-pin-message' : undefined}
          aria-invalid={error ? true : undefined}
          placeholder="Nhập mã số"
          disabled={Boolean(unavailable)}
          readOnly={checking}
          onChange={handlePinChange}
          required
        />

        {unavailable && (
          <p id="admin-pin-message" className={styles.notice} role="status">{unavailable}</p>
        )}
        {error && (
          <p id="admin-pin-message" className={styles.error} role="alert">{error}</p>
        )}

        <button
          className={styles.submit}
          type="submit"
          disabled={Boolean(unavailable) || checking}
        >
          {checking ? 'Đang kiểm tra…' : 'Mở Admin'}
        </button>
      </form>
    </main>
  );
}

export default function AdminGate() {
  const [expiresAt, setExpiresAt] = useState(readAccessExpiry);

  useEffect(() => {
    function syncAccess(event) {
      if (event.key === storageKey || event.key === null) {
        setExpiresAt(readAccessExpiry());
      }
    }

    window.addEventListener('storage', syncAccess);
    return () => window.removeEventListener('storage', syncAccess);
  }, []);

  useEffect(() => {
    if (!expiresAt) return undefined;

    function checkExpiry() {
      if (Date.now() >= expiresAt) setExpiresAt(0);
    }

    const timer = window.setTimeout(checkExpiry, Math.max(0, expiresAt - Date.now()));
    window.addEventListener('focus', checkExpiry);
    window.addEventListener('pageshow', checkExpiry);
    document.addEventListener('visibilitychange', checkExpiry);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('focus', checkExpiry);
      window.removeEventListener('pageshow', checkExpiry);
      document.removeEventListener('visibilitychange', checkExpiry);
    };
  }, [expiresAt]);

  function grantAccess() {
    const expiry = Date.now() + accessDuration;
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        fingerprint: verifier.fingerprint,
        expiresAt: expiry,
      }));
    } catch {
      // Keep access in memory while this Admin view is open.
    }
    setExpiresAt(expiry);
  }

  return expiresAt ? <Outlet /> : <AdminPinForm onUnlock={grantAccess} />;
}
