import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import styles from './LanguageToggle.module.css';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <aside className={styles.toggleWrapper} aria-label="Language switch">
      <div className={styles.toggleButton} role="group" aria-label="Language selector">
        <button
          type="button"
          onClick={() => setLanguage('vi')}
          className={`${styles.optionPill} ${language === 'vi' ? styles.active : ''}`}
          aria-label="Chuyển sang Tiếng Việt"
          aria-pressed={language === 'vi'}
          title="Tiếng Việt"
        >
          <span className={styles.langText}>VI</span>
        </button>
        <span className={styles.divider}>•</span>
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`${styles.optionPill} ${language === 'en' ? styles.active : ''}`}
          aria-label="Switch to English"
          aria-pressed={language === 'en'}
          title="English"
        >
          <span className={styles.langText}>EN</span>
        </button>
        <span className={styles.divider}>•</span>
        <button
          type="button"
          onClick={() => setLanguage('zh')}
          className={`${styles.optionPill} ${language === 'zh' ? styles.active : ''}`}
          aria-label="切换至中文"
          aria-pressed={language === 'zh'}
          title="中文"
        >
          <span className={styles.langText}>中文</span>
        </button>
      </div>
    </aside>
  );
}
