import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Share2 } from 'lucide-react';
import weddingConfig from '../../config/weddingConfig';
import { useLanguage } from '../../context/LanguageContext';
import NeonButton from '../NeonButton/NeonButton';
import styles from './QRCode.module.css';

export default function QRCode() {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const targetUrl = weddingConfig.invitationUrl;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Wedding Invitation - ${weddingConfig.groom.name} & ${weddingConfig.bride.name}`,
          text: t.envelope.invitation,
          url: targetUrl,
        });
      } catch {
        // User dismissed
      }
    } else {
      handleCopy();
    }
  };

  return (
    <section className={`section ${styles.qrSection}`} id="qrcode" aria-label="QR Code Invitation">
      <div className="container">
        <motion.div
          className={styles.qrCard}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8 }}
        >
          <span className={styles.qrNotice}>{t.qrcode.notice}</span>
          
          <h2 className="section-title" style={{ fontSize: '2rem', marginTop: '0.5rem' }}>
            {t.qrcode.title}
          </h2>

          <div className={styles.qrContainer}>
            <QRCodeSVG
              value={targetUrl}
              size={180}
              bgColor="#ffffff"
              fgColor="#241c1a"
              level="M"
              includeMargin={false}
            />
          </div>

          <p className={styles.qrSubtext}>
            {t.qrcode.subtext}
          </p>

          <div className={styles.actionRow}>
            <NeonButton
              variant="primary"
              onClick={handleCopy}
              aria-label={t.qrcode.copyBtn}
              thickness={2.4}
              borderSize={35}
              glow={75}
              speed={15}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? t.qrcode.copiedToast : t.qrcode.copyBtn}</span>
            </NeonButton>

            <NeonButton
              variant="secondary"
              onClick={handleNativeShare}
              aria-label={t.qrcode.shareBtn}
              thickness={2.4}
              borderSize={35}
              glow={65}
              speed={15}
            >
              <Share2 size={16} />
              <span>{t.qrcode.shareBtn}</span>
            </NeonButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
