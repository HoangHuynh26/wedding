import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, CheckCircle2, MessageSquare, UserCheck } from 'lucide-react';
import rsvpService from '../../services/rsvpService';
import { useLanguage } from '../../context/LanguageContext';
import useInvitationParams from '../../hooks/useInvitationParams';
import { triggerCelebrationFireworks } from '../Fireworks/Fireworks';
import NeonButton from '../NeonButton/NeonButton';
import styles from './RSVP.module.css';

export default function RSVP() {
  const { t, language } = useLanguage();
  const { guestName, inviterName } = useInvitationParams();

  // Determine smart default for side based on inviter parameter
  const defaultSide = useMemo(() => {
    if (inviterName) {
      const lower = inviterName.toLowerCase();
      if (lower.includes('cô dâu') || lower.includes('nhà gái') || lower.includes('bride')) {
        return language === 'en' ? "Bride's Side" : 'Nhà Gái (Cô Dâu)';
      }
    }
    return language === 'en' ? "Groom's Side" : 'Nhà Trai (Chú Rể)';
  }, [inviterName, language]);

  const [formData, setFormData] = useState({
    fullName: guestName || '',
    location: '',
    side: defaultSide,
    message: '',
  });

  useEffect(() => {
    if (guestName && !formData.fullName) {
      setFormData((prev) => ({ ...prev, fullName: guestName }));
    }
  }, [guestName]);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [confirmedGuest, setConfirmedGuest] = useState(null);
  const [serverError, setServerError] = useState('');

  const sideOptions = useMemo(
    () => [
      {
        id: 'groom',
        label: t.rsvp.sideGroom || (language === 'en' ? "Groom's Side" : 'Nhà Trai (Chú Rể)'),
        icon: '🤵',
      },
      {
        id: 'bride',
        label: t.rsvp.sideBride || (language === 'en' ? "Bride's Side" : 'Nhà Gái (Cô Dâu)'),
        icon: '👰',
      },
      {
        id: 'mutual',
        label: t.rsvp.sideMutual || (language === 'en' ? 'Both / Mutual' : 'Cả hai (Bạn chung)'),
        icon: '💍',
      },
    ],
    [t, language]
  );

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = t.rsvp.validationNameRequired || (language === 'en' ? 'Please enter your full name' : 'Vui lòng nhập họ và tên của bạn');
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = t.rsvp.validationNameShort || (language === 'en' ? 'Name must be at least 2 characters' : 'Tên phải có ít nhất 2 ký tự');
    } else if (formData.fullName.trim().length > 80) {
      newErrors.fullName = language === 'en' ? 'Name cannot exceed 80 characters' : 'Tên không được vượt quá 80 ký tự';
    }

    if (!formData.location.trim()) {
      newErrors.location = t.rsvp.validationLocationRequired || (language === 'en' ? 'Please enter your location or city' : 'Vui lòng nhập tỉnh/thành phố bạn đang ở');
    } else if (formData.location.trim().length < 2) {
      newErrors.location = t.rsvp.validationLocationShort || (language === 'en' ? 'Location must be at least 2 characters' : 'Địa điểm phải có ít nhất 2 ký tự');
    } else if (formData.location.trim().length > 100) {
      newErrors.location = language === 'en' ? 'Location cannot exceed 100 characters' : 'Địa điểm không được vượt quá 100 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const handleSelectSide = (selectedLabel) => {
    setFormData((prev) => ({ ...prev, side: selectedLabel }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    setServerError('');

    try {
      const response = await rsvpService.submitRSVP({
        fullName: formData.fullName.trim(),
        location: formData.location.trim(),
        side: formData.side,
        message: formData.message.trim(),
        attendance: true,
      });

      setConfirmedGuest(
        response.guest || {
          fullName: formData.fullName.trim(),
          location: formData.location.trim(),
          side: formData.side,
          message: formData.message.trim(),
        }
      );
      setSubmitSuccess(true);

      // Trigger wedding celebration fireworks
      triggerCelebrationFireworks();
    } catch (err) {
      console.error('RSVP submission error:', err);
      setServerError(
        err.message ||
          (language === 'en'
            ? 'Something went wrong. Please try again.'
            : 'Có lỗi xảy ra trong quá trình xác nhận. Vui lòng thử lại.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({ fullName: '', location: '', side: defaultSide, message: '' });
    setErrors({});
    setSubmitSuccess(false);
    setConfirmedGuest(null);
    setServerError('');
  };

  return (
    <section className={`section ${styles.rsvpSection}`} id="rsvp" aria-label="RSVP Form">
      <div className={styles.ambientGlow} />

      <div className="container">
        {/* Cinematic Transition & Reveal Header */}
        <motion.div
          className={styles.revealIntro}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.8 }}
        >
          <span className={styles.revealPrompt}>{t.rsvp.before}</span>
          <p className={styles.revealSubtext}>{t.rsvp.quote}</p>
          <span className={styles.revealHeading}>{t.rsvp.joining}</span>
        </motion.div>

        {/* Form Container with Framer Motion Reveal */}
        <motion.div
          className={styles.formCard}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.9, delay: 0.2 }}
        >
          <AnimatePresence mode="wait">
            {!submitSuccess ? (
              <motion.form
                key="rsvp-form"
                onSubmit={handleSubmit}
                noValidate
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h3 className={styles.formTitle}>{t.rsvp.formTitle}</h3>
                <p className={styles.formSubtitle}>{t.rsvp.formSubtitle}</p>

                {serverError && (
                  <div
                    style={{
                      backgroundColor: 'rgba(231, 76, 60, 0.1)',
                      border: '1px solid #e74c3c',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      marginBottom: '1.25rem',
                      color: '#c0392b',
                      fontSize: '0.85rem',
                      textAlign: 'center',
                    }}
                  >
                    {serverError}
                  </div>
                )}

                {/* 1. Full Name */}
                <div className={styles.inputGroup}>
                  <label htmlFor="fullName" className={styles.label}>
                    {t.rsvp.nameLabel}
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder={t.rsvp.namePlaceholder}
                    className={`${styles.inputField} ${errors.fullName ? styles.inputError : ''}`}
                    disabled={isSubmitting}
                    autoComplete="name"
                    required
                  />
                  {errors.fullName && <span className={styles.errorText}>{errors.fullName}</span>}
                </div>

                {/* 2. Location / City */}
                <div className={styles.inputGroup}>
                  <label htmlFor="location" className={styles.label}>
                    {t.rsvp.locationLabel}
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder={t.rsvp.locationPlaceholder}
                    className={`${styles.inputField} ${errors.location ? styles.inputError : ''}`}
                    disabled={isSubmitting}
                    required
                  />
                  {errors.location && <span className={styles.errorText}>{errors.location}</span>}
                </div>

                {/* 3. Whose Guest Are You? (Side Selection) */}
                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    {t.rsvp.sideLabel || 'Bạn là khách của ai? *'}
                  </label>
                  <div className={styles.sideSelector} role="radiogroup" aria-label="Whose guest are you">
                    {sideOptions.map((option) => {
                      const isSelected = formData.side === option.label;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          className={`${styles.sideOption} ${isSelected ? styles.sideOptionActive : ''}`}
                          onClick={() => handleSelectSide(option.label)}
                        >
                          <span className={styles.sideOptionIcon}>{option.icon}</span>
                          <span className={styles.sideOptionText}>{option.label}</span>
                          {isSelected && <UserCheck size={14} className={styles.sideCheckIcon} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Leave a Message / Wedding Wish */}
                <div className={styles.inputGroup}>
                  <label htmlFor="message" className={styles.label}>
                    {t.rsvp.messageLabel || 'Lời chúc gửi tới cặp đôi'}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={
                      t.rsvp.messagePlaceholder ||
                      'Gửi những lời chúc phúc ấm áp nhất đến Đình Huy & Thu Hiền...'
                    }
                    className={styles.textareaField}
                    rows={3}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Submit Button with Neon Border */}
                <NeonButton
                  type="submit"
                  id="rsvp-submit-btn"
                  variant="primary"
                  disabled={isSubmitting}
                  aria-label={t.rsvp.submitBtn}
                  fullWidth
                  thickness={2.6}
                  borderSize={45}
                  glow={85}
                  speed={16}
                  style={{ marginTop: '1.75rem' }}
                >
                  {isSubmitting ? (
                    <>
                      <div className={styles.spinner} />
                      <span>{t.rsvp.confirming}</span>
                    </>
                  ) : (
                    <>
                      <span>{t.rsvp.submitBtn}</span>
                      <Heart size={16} fill="currentColor" />
                    </>
                  )}
                </NeonButton>
              </motion.form>
            ) : (
              /* Success Celebration State */
              <motion.div
                key="rsvp-success"
                className={styles.successCard}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className={styles.successIconRing}>
                  <CheckCircle2 size={40} color="var(--gold-dark)" />
                </div>

                <span className={styles.successHeading}>{t.rsvp.successHeading}</span>
                <h3 className={styles.successGuestName}>
                  {t.rsvp.thankYou} {confirmedGuest?.fullName || ''} ♡
                </h3>

                <p className={styles.successMessage}>{t.rsvp.successMsg}</p>

                <div className={styles.guestSummary}>
                  <div>
                    <strong>{t.rsvp.guestLabel}</strong> {confirmedGuest?.fullName}
                  </div>
                  <div>
                    <strong>{t.rsvp.fromLabel}</strong> {confirmedGuest?.location || formData.location}
                  </div>
                  <div>
                    <strong>{t.rsvp.sideSummary || 'Khách của:'}</strong>{' '}
                    {confirmedGuest?.side || formData.side}
                  </div>
                  {confirmedGuest?.message && (
                    <div className={styles.summaryMessageRow}>
                      <strong>{t.rsvp.messageSummary || 'Lời chúc:'}</strong> “
                      {confirmedGuest.message}”
                    </div>
                  )}
                  <div>
                    <strong>{t.rsvp.statusLabel}</strong> {t.rsvp.statusConfirmed}
                  </div>
                </div>

                <NeonButton
                  type="button"
                  onClick={handleReset}
                  variant="secondary"
                  style={{ marginTop: '1.5rem' }}
                >
                  <span>{t.rsvp.resetBtn}</span>
                </NeonButton>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
