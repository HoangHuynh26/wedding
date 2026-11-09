import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, CheckCircle2, ChevronDown, Check } from 'lucide-react';
import rsvpService from '../../services/rsvpService';
import { useLanguage } from '../../context/LanguageContext';
import useInvitationParams from '../../hooks/useInvitationParams';
import { triggerCelebrationFireworks } from '../Fireworks/Fireworks';
import NeonButton from '../NeonButton/NeonButton';
import styles from './RSVP.module.css';

export default function RSVP() {
  const { t } = useLanguage();
  const { guestName, inviterName } = useInvitationParams();

  // Determine smart default sideId ('bride' for Lễ Vu Quy unless inviter explicitly indicates Groom)
  const defaultSideId = useMemo(() => {
    if (inviterName) {
      const lower = inviterName.toLowerCase();
      if (lower.includes('chú rể') || lower.includes('nhà trai') || lower.includes('groom') || lower.includes('đình huy')) {
        if (!lower.includes('thu hiền') && !lower.includes('cô dâu')) {
          return 'groom';
        }
      }
    }
    return 'bride';
  }, [inviterName]);

  const [formData, setFormData] = useState({
    fullName: guestName || '',
    location: '',
    sideId: defaultSideId,
    message: '',
  });

  const [isPopdownOpen, setIsPopdownOpen] = useState(false);
  const popdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popdownRef.current && !popdownRef.current.contains(e.target)) {
        setIsPopdownOpen(false);
      }
    };
    if (isPopdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isPopdownOpen]);

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

  // Bride's Side first (Lễ bên nhà gái)
  const sideOptions = useMemo(
    () => [
      {
        id: 'bride',
        label: t.rsvp.sideBride,
        icon: '👰',
      },
      {
        id: 'groom',
        label: t.rsvp.sideGroom,
        icon: '🤵',
      },
      {
        id: 'mutual',
        label: t.rsvp.sideMutual,
        icon: '💍',
      },
    ],
    [t]
  );

  const selectedOption = useMemo(() => {
    return sideOptions.find((opt) => opt.id === formData.sideId) || sideOptions[0];
  }, [sideOptions, formData.sideId]);

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = t.rsvp.validationNameRequired;
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = t.rsvp.validationNameShort;
    } else if (formData.fullName.trim().length > 80) {
      newErrors.fullName = t.rsvp.validationNameLong;
    }

    if (!formData.location.trim()) {
      newErrors.location = t.rsvp.validationLocationRequired;
    } else if (formData.location.trim().length < 2) {
      newErrors.location = t.rsvp.validationLocationShort;
    } else if (formData.location.trim().length > 100) {
      newErrors.location = t.rsvp.validationLocationLong;
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

  const handleSelectSide = (sideId) => {
    setFormData((prev) => ({ ...prev, sideId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    setServerError('');

    try {
      const sideLabel = selectedOption.label;
      const response = await rsvpService.submitRSVP({
        fullName: formData.fullName.trim(),
        location: formData.location.trim(),
        side: sideLabel,
        message: formData.message.trim(),
        attendance: true,
      });

      setConfirmedGuest(
        response.guest || {
          fullName: formData.fullName.trim(),
          location: formData.location.trim(),
          side: sideLabel,
          message: formData.message.trim(),
        }
      );
      setSubmitSuccess(true);

      // Trigger wedding celebration fireworks
      triggerCelebrationFireworks();
    } catch (err) {
      console.error('RSVP submission error:', err);
      setServerError(err.message || t.rsvp.serverErrorFallback);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({ fullName: '', location: '', sideId: defaultSideId, message: '' });
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
          <p className={styles.revealSubtext}>{t.rsvp.quote}</p>
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

                {/* 3. Whose Guest Are You? (Pop-down Selector) */}
                <div className={styles.inputGroup} ref={popdownRef}>
                  <label htmlFor="side-popdown-btn" className={styles.label}>
                    {t.rsvp.sideLabel}
                  </label>
                  <div className={styles.popdownContainer}>
                    <button
                      id="side-popdown-btn"
                      type="button"
                      className={`${styles.popdownTrigger} ${isPopdownOpen ? styles.popdownTriggerActive : ''}`}
                      onClick={() => setIsPopdownOpen((prev) => !prev)}
                      aria-haspopup="listbox"
                      aria-expanded={isPopdownOpen}
                    >
                      <div className={styles.popdownSelectedValue}>
                        <span className={styles.popdownOptionIcon}>{selectedOption.icon}</span>
                        <span className={styles.popdownOptionText}>{selectedOption.label}</span>
                      </div>
                      <ChevronDown
                        size={18}
                        className={`${styles.popdownChevron} ${isPopdownOpen ? styles.popdownChevronRotated : ''}`}
                      />
                    </button>

                    <AnimatePresence>
                      {isPopdownOpen && (
                        <motion.ul
                          className={styles.popdownMenu}
                          role="listbox"
                          initial={{ opacity: 0, y: -6, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.98 }}
                          transition={{ duration: 0.16, ease: 'easeOut' }}
                        >
                          {sideOptions.map((option) => {
                            const isSelected = formData.sideId === option.id;
                            return (
                              <li
                                key={option.id}
                                role="option"
                                aria-selected={isSelected}
                                className={`${styles.popdownItem} ${isSelected ? styles.popdownItemActive : ''}`}
                                onClick={() => {
                                  handleSelectSide(option.id);
                                  setIsPopdownOpen(false);
                                }}
                              >
                                <div className={styles.popdownItemContent}>
                                  <span className={styles.popdownOptionIcon}>{option.icon}</span>
                                  <span className={styles.popdownItemLabel}>{option.label}</span>
                                </div>
                                {isSelected && <Check size={16} className={styles.popdownCheckIcon} />}
                              </li>
                            );
                          })}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* 4. Leave a Message / Wedding Wish */}
                <div className={styles.inputGroup}>
                  <label htmlFor="message" className={styles.label}>
                    {t.rsvp.messageLabel}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={t.rsvp.messagePlaceholder}
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
                    <strong>{t.rsvp.sideSummary}</strong>{' '}
                    {confirmedGuest?.side || selectedOption.label}
                  </div>
                  {confirmedGuest?.message && (
                    <div className={styles.summaryMessageRow}>
                      <strong>{t.rsvp.messageSummary}</strong> “{confirmedGuest.message}”
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
