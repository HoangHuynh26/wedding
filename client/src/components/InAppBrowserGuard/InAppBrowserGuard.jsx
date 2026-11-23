import React, { useEffect, useMemo, useState } from 'react';
import { ExternalLink, Copy, Check, Compass, MoreHorizontal, MoreVertical } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { buildAsciiSafeHandoffUrl } from '../../utils/invitationCodec';
import styles from './InAppBrowserGuard.module.css';

/**
 * Detect mobile in-app WebViews (Zalo, Facebook, Messenger, Instagram, TikTok, WeChat, LINE, Android WebView)
 * so guests are guided/redirected to open the wedding invitation in Safari or Google Chrome.
 */
export function detectMobileInAppBrowser(userAgent = '') {
  const ua = String(userAgent || '');
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);
  const isMobile = isIOS || isAndroid || /Mobile/i.test(ua);

  if (!isMobile) {
    return { isInApp: false, appName: '', isIOS: false, isAndroid: false };
  }

  if (/Zalo/i.test(ua)) {
    return { isInApp: true, appName: 'Zalo', isIOS, isAndroid };
  }
  if (/FBAN|FBAV|FB_IAB|FBIOS|Messenger/i.test(ua)) {
    return { isInApp: true, appName: 'Facebook / Messenger', isIOS, isAndroid };
  }
  if (/Instagram/i.test(ua)) {
    return { isInApp: true, appName: 'Instagram', isIOS, isAndroid };
  }
  if (/TikTok|musical_ly|BytedanceWebview|Trill/i.test(ua)) {
    return { isInApp: true, appName: 'TikTok', isIOS, isAndroid };
  }
  if (/MicroMessenger/i.test(ua)) {
    return { isInApp: true, appName: 'WeChat', isIOS, isAndroid };
  }
  if (/\bLine\//i.test(ua)) {
    return { isInApp: true, appName: 'LINE', isIOS, isAndroid };
  }
  // Generic Android embedded WebView (excludes standalone Chrome/Firefox/Edge/Samsung)
  if (isAndroid && /;\s*wv\)/i.test(ua)) {
    return { isInApp: true, appName: 'ứng dụng', isIOS: false, isAndroid: true };
  }
  // Generic iOS WKWebView (embedded app browsers that strip Safari/ from UA)
  const isStandaloneIOS = typeof window !== 'undefined' && window.navigator?.standalone === true;
  if (isIOS && !isStandaloneIOS && /AppleWebKit/i.test(ua) && !/Safari\//i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua)) {
    return { isInApp: true, appName: 'ứng dụng', isIOS: true, isAndroid: false };
  }

  return { isInApp: false, appName: '', isIOS, isAndroid };
}

const COPY = {
  vi: {
    eyebrow: 'THIỆP CƯỚI ĐIỆN TỬ',
    heading: 'Mở Bằng Trình Duyệt',
    descIOS: (app) =>
      `Để xem trọn vẹn thiệp cưới, nghe nhạc và lướt album ảnh mượt mà không bị thoát trang trên ${app}, xin vui lòng mở liên kết bằng Safari hoặc Google Chrome.`,
    descAndroid: (app) =>
      `Để xem trọn vẹn thiệp cưới, nghe nhạc và lướt album ảnh mượt mà không bị thoát trang trên ${app}, xin vui lòng mở liên kết bằng Google Chrome.`,
    primaryIOS: 'Mở Bằng Safari',
    secondaryIOS: 'Mở Bằng Google Chrome',
    primaryAndroid: 'Mở Bằng Google Chrome',
    secondaryAndroid: 'Mở Bằng Trình Duyệt Khác',
    copyBtn: 'Sao Chép Đường Dẫn Thiệp',
    copiedBtn: 'Đã Sao Chép Đường Dẫn ✓',
    copiedHint: 'Hãy mở Safari hoặc Chrome và dán đường dẫn vừa sao chép vào thanh địa chỉ.',
    stepsTitle: 'Hoặc mở nhanh trong 2 bước:',
    step1IOS: 'Chạm vào biểu tượng',
    step1IOSAfter: 'ở góc trên bên phải màn hình',
    step2IOS: 'Chọn “Mở bằng trình duyệt” hoặc “Mở bằng Safari”',
    step1Android: 'Chạm vào biểu tượng',
    step1AndroidAfter: 'ở góc trên bên phải màn hình',
    step2Android: 'Chọn “Mở bằng trình duyệt” hoặc “Mở bằng Chrome”',
    cornerHint: 'Chạm vào đây để mở bằng trình duyệt',
  },
  en: {
    eyebrow: 'DIGITAL WEDDING INVITATION',
    heading: 'Open in Browser',
    descIOS: (app) =>
      `For the smoothest experience with music and photo album swiping (without accidentally leaving the page in ${app}), please open this invitation in Safari or Google Chrome.`,
    descAndroid: (app) =>
      `For the smoothest experience with music and photo album swiping (without accidentally leaving the page in ${app}), please open this invitation in Google Chrome.`,
    primaryIOS: 'Open in Safari',
    secondaryIOS: 'Open in Google Chrome',
    primaryAndroid: 'Open in Google Chrome',
    secondaryAndroid: 'Open in Default Browser',
    copyBtn: 'Copy Invitation Link',
    copiedBtn: 'Invitation Link Copied ✓',
    copiedHint: 'Open Safari or Chrome and paste the link into the address bar.',
    stepsTitle: 'Or open in 2 quick steps:',
    step1IOS: 'Tap the',
    step1IOSAfter: 'icon at the top-right corner',
    step2IOS: 'Select “Open in Browser” or “Open in Safari”',
    step1Android: 'Tap the',
    step1AndroidAfter: 'icon at the top-right corner',
    step2Android: 'Select “Open in Browser” or “Open in Chrome”',
    cornerHint: 'Tap here to open in Safari / Chrome',
  },
  zh: {
    eyebrow: '电子婚礼请柬',
    heading: '请使用浏览器打开',
    descIOS: (app) =>
      `为了流畅欣赏婚礼音乐与滑动浏览婚纱相册（避免在 ${app} 内左滑误退页面），请使用 Safari 或 Google Chrome 打开本请柬。`,
    descAndroid: (app) =>
      `为了流畅欣赏婚礼音乐与滑动浏览婚纱相册（避免在 ${app} 内左滑误退页面），请使用 Google Chrome 浏览器打开本请柬。`,
    primaryIOS: '在 Safari 中打开',
    secondaryIOS: '在 Google Chrome 中打开',
    primaryAndroid: '在 Google Chrome 中打开',
    secondaryAndroid: '使用其他浏览器打开',
    copyBtn: '复制请柬链接',
    copiedBtn: '已复制请柬链接 ✓',
    copiedHint: '请打开 Safari 或 Chrome 浏览器，将链接粘贴至地址栏访问。',
    stepsTitle: '或按以下两步快速打开：',
    step1IOS: '点击屏幕右上角的',
    step1IOSAfter: '按钮',
    step2IOS: '选择“在浏览器中打开”或“在 Safari 中打开”',
    step1Android: '点击屏幕右上角的',
    step1AndroidAfter: '按钮',
    step2Android: '选择“在浏览器中打开”或“在 Chrome 中打开”',
    cornerHint: '点击此处使用浏览器打开',
  },
};

export default function InAppBrowserGuard({ children }) {
  const { language, bride, groom, isGroomSide } = useLanguage();
  const [copied, setCopied] = useState(false);

  const env = useMemo(() => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return { isInApp: false, appName: '', isIOS: false, isAndroid: false };
    }
    return detectMobileInAppBrowser(navigator.userAgent || '');
  }, []);

  const links = useMemo(() => {
    if (typeof window === 'undefined') {
      return { raw: '', chromeIntent: '', genericIntent: '', safariScheme: '', iosChromeScheme: '' };
    }
    const raw = buildAsciiSafeHandoffUrl(window.location.href);
    const scheme = window.location.protocol.replace(':', '') || 'https';
    const withoutScheme = raw.replace(/^https?:\/\//i, '');
    const encodedFallback = encodeURIComponent(raw);

    return {
      raw,
      chromeIntent: `intent://${withoutScheme}#Intent;scheme=${scheme};package=com.android.chrome;S.browser_fallback_url=${encodedFallback};end`,
      genericIntent: `intent://${withoutScheme}#Intent;scheme=${scheme};action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;S.browser_fallback_url=${encodedFallback};end`,
      safariScheme: `x-safari-${raw}`,
      iosChromeScheme: scheme === 'https' ? `googlechromes://${withoutScheme}` : `googlechrome://${withoutScheme}`,
    };
  }, []);

  // Automatically attempt to hand off to Google Chrome on Android in-app WebViews once per session
  useEffect(() => {
    if (!env.isInApp || !env.isAndroid || !links.chromeIntent) return;
    try {
      const key = 'wedding_android_external_tried';
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
      const timer = window.setTimeout(() => {
        window.location.href = links.chromeIntent;
      }, 280);
      return () => window.clearTimeout(timer);
    } catch {
      // Ignore storage / intent restrictions; user still has the 1-tap button below
    }
  }, [env.isInApp, env.isAndroid, links.chromeIntent]);

  if (!env.isInApp) {
    return children;
  }

  const copyPack = COPY[language] || COPY.vi;
  const firstShort = isGroomSide ? groom.shortName : bride.shortName;
  const secondShort = isGroomSide ? bride.shortName : groom.shortName;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(links.raw);
      } else {
        const input = document.createElement('textarea');
        input.value = links.raw;
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 4500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className={styles.guardScreen} role="dialog" aria-modal="true" aria-labelledby="inapp-guard-heading">
      <div className={styles.cardShell}>
        <div className={styles.innerFrame}>
          <span className={`${styles.corner} ${styles.cTL}`} aria-hidden="true" />
          <span className={`${styles.corner} ${styles.cTR}`} aria-hidden="true" />
          <span className={`${styles.corner} ${styles.cBL}`} aria-hidden="true" />
          <span className={`${styles.corner} ${styles.cBR}`} aria-hidden="true" />

          <span className={styles.eyebrow}>{copyPack.eyebrow}</span>
          <p className={styles.coupleScript}>
            {firstShort} &amp; {secondShort}
          </p>

          <div className={styles.divider} aria-hidden="true">
            <span />
            <i>✦</i>
            <span />
          </div>

          <h1 id="inapp-guard-heading" className={styles.heading}>
            {copyPack.heading}
          </h1>

          <p className={styles.description}>
            {env.isIOS ? copyPack.descIOS(env.appName) : copyPack.descAndroid(env.appName)}
          </p>

          {/* Primary 1-tap external browser actions */}
          <div className={styles.actionsGroup}>
            {env.isAndroid ? (
              <>
                <a href={links.chromeIntent} className={styles.primaryBtn}>
                  <span className={styles.primaryBtnInner}>
                    <Compass size={16} />
                    <span>{copyPack.primaryAndroid}</span>
                    <ExternalLink size={14} />
                  </span>
                </a>

                <a href={links.genericIntent} className={styles.secondaryBtn}>
                  <ExternalLink size={14} />
                  <span>{copyPack.secondaryAndroid}</span>
                </a>
              </>
            ) : (
              <>
                <a href={links.safariScheme} className={styles.primaryBtn}>
                  <span className={styles.primaryBtnInner}>
                    <Compass size={16} />
                    <span>{copyPack.primaryIOS}</span>
                    <ExternalLink size={14} />
                  </span>
                </a>

                <a href={links.iosChromeScheme} className={styles.secondaryBtn}>
                  <ExternalLink size={14} />
                  <span>{copyPack.secondaryIOS}</span>
                </a>
              </>
            )}

            <button type="button" onClick={handleCopyLink} className={styles.copyBtn}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? copyPack.copiedBtn : copyPack.copyBtn}</span>
            </button>

            {copied && <p className={styles.copiedHint}>{copyPack.copiedHint}</p>}
          </div>

          {/* 2-step manual fallback guide (essential on iOS Zalo where Apple restricts silent redirects) */}
          <div className={styles.stepsBox}>
            <p className={styles.stepsTitle}>{copyPack.stepsTitle}</p>
            <ol className={styles.stepsList}>
              <li>
                <span className={styles.stepNum}>1</span>
                <span>
                  {env.isIOS ? copyPack.step1IOS : copyPack.step1Android}{' '}
                  <span className={styles.inlineIconPill}>
                    {env.isIOS ? <MoreHorizontal size={14} /> : <MoreVertical size={14} />}
                  </span>{' '}
                  {env.isIOS ? copyPack.step1IOSAfter : copyPack.step1AndroidAfter}
                </span>
              </li>
              <li>
                <span className={styles.stepNum}>2</span>
                <span>{env.isIOS ? copyPack.step2IOS : copyPack.step2Android}</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </main>
  );
}
