import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import rsvpService from '../../services/rsvpService';
import { useLanguage } from '../../context/LanguageContext';
import useInvitationParams from '../../hooks/useInvitationParams';
import { triggerCelebrationFireworks } from '../Fireworks/Fireworks';
import styles from './RSVP.module.css';

export default function RSVP() {
  const { t, language, bride, groom, isGroomSide } = useLanguage();
  const { guestName, inviterName } = useInvitationParams();

  const defaultSideId = useMemo(() => {
    if (inviterName) {
      const lower = inviterName.toLowerCase();
      if (/chú rể|nhà trai|groom|đình huy|dinh huy|新郎|男方|廷辉/.test(lower)) {
        if (!/thu hiền|thu hien|cô dâu|bride|新娘|女方|秋贤/.test(lower)) {
          return 'groom';
        }
      }
      if (/thu hiền|thu hien|cô dâu|nhà gái|bride|新娘|女方|秋贤/.test(lower)) {
        if (!/chú rể|nhà trai|groom|đình huy|dinh huy|新郎|男方|廷辉/.test(lower)) {
          return 'bride';
        }
      }
    }
    return isGroomSide ? 'groom' : 'bride';
  }, [inviterName, isGroomSide]);

  const [formData, setFormData] = useState({
    fullName: guestName || '',
    location: '',
    sideId: defaultSideId,
    message: '',
  });

  useEffect(() => {
    setFormData((prev) => ({ ...prev, sideId: defaultSideId }));
  }, [defaultSideId]);

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

  // Refined stationery options — no cartoon emojis, crisp editorial labels
  const sideOptions = useMemo(
    () => [
      { id: 'bride', label: t.rsvp.sideBride },
      { id: 'groom', label: t.rsvp.sideGroom },
      { id: 'mutual', label: t.rsvp.sideMutual },
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
      triggerCelebrationFireworks();
    } catch (err) {
      console.error('RSVP submission error:', err);
      setServerError(language === 'vi' ? err.message || t.rsvp.serverErrorFallback : t.rsvp.serverErrorFallback);
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
    <section className={styles.rsvpSection} id="rsvp" aria-label={t.rsvp.formTitle}>
      {/* Iridescent dusty-mauve stationery tabletop backdrop */}
      <img
        src="/mauve-theme/mother-of-pearl.webp"
        alt=""
        className={styles.tableBackdrop}
        loading="lazy"
        decoding="async"
      />
      <div className={styles.tableVeil} aria-hidden="true" />

      <div className={styles.rsvpContainer}>
        {/* Poetic Quote Above the Physical Card */}
        <motion.div
          className={styles.revealIntro}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.75 }}
        >
          <p className={styles.revealSubtext}>{t.rsvp.quote}</p>
        </motion.div>

        {/* Physical Stacked Cotton-Paper Stationery RSVP Card */}
        <motion.div
          className={styles.cardStack}
          initial={{ opacity: 0, y: 34 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Tilted backing stationery sheet underneath for authentic tactile card-stack depth */}
          <div className={styles.underCardBack} aria-hidden="true" />
          <div className={styles.underCardMid} aria-hidden="true" />

          {/* Main Thick Cotton-Paper Reply Card */}
          <div className={styles.stationeryCard}>
            {/* Real metallic mauve-pewter HH Wax Seal stamped at the top crest */}
            <div className={styles.crestSealWrap} aria-hidden="true">
              <img
                src="/mauve-theme/wax-seal-hh.webp"
                alt=""
                className={styles.crestSealImg}
                draggable={false}
              />
            </div>

            {/* Embossed Letterpress Inner Frame with 4 Delicate Corner Filigrees */}
            <div className={styles.letterpressFrame}>
              <span className={`${styles.cornerOrnament} ${styles.cTL}`} aria-hidden="true" />
              <span className={`${styles.cornerOrnament} ${styles.cTR}`} aria-hidden="true" />
              <span className={`${styles.cornerOrnament} ${styles.cBL}`} aria-hidden="true" />
              <span className={`${styles.cornerOrnament} ${styles.cBR}`} aria-hidden="true" />

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
                    <header className={styles.cardHeader}>
                      <h3 className={styles.formTitle}>{t.rsvp.formTitle}</h3>
                      <div className={styles.headerRule} aria-hidden="true">
                        <span />
                        <i>✦</i>
                        <span />
                      </div>
                      <p className={styles.formSubtitle}>{t.rsvp.formSubtitle}</p>
                    </header>

                    {serverError && (
                      <div className={styles.serverErrorBox}>
                        {serverError}
                      </div>
                    )}

                    {/* 1. Full Name — Printed Letterpress Fill-In Line */}
                    <div className={styles.fieldRow}>
                      <label htmlFor="fullName" className={styles.fieldLabel}>
                        {t.rsvp.nameLabel}
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder={t.rsvp.namePlaceholder}
                        className={`${styles.paperInput} ${errors.fullName ? styles.inputError : ''}`}
                        disabled={isSubmitting}
                        autoComplete="name"
                        required
                      />
                      {errors.fullName && <span className={styles.errorText}>{errors.fullName}</span>}
                    </div>

                    {/* 2. Location — Printed Letterpress Fill-In Line */}
                    <div className={styles.fieldRow}>
                      <label htmlFor="location" className={styles.fieldLabel}>
                        {t.rsvp.locationLabel}
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder={t.rsvp.locationPlaceholder}
                        className={`${styles.paperInput} ${errors.location ? styles.inputError : ''}`}
                        disabled={isSubmitting}
                        required
                      />
                      {errors.location && <span className={styles.errorText}>{errors.location}</span>}
                    </div>

                    {/* 3. Guest Side — Printed RSVP Checkbox Chips (No Cartoon Emojis) */}
                    <div className={styles.fieldRow}>
                      <span className={styles.fieldLabel}>{t.rsvp.sideLabel}</span>
                      <div className={styles.sideChoices} role="radiogroup" aria-label={t.rsvp.sideLabel}>
                        {sideOptions.map((option) => {
                          const isSelected = formData.sideId === option.id;
                          return (
                            <button
                              key={option.id}
                              type="button"
                              role="radio"
                              aria-checked={isSelected}
                              className={`${styles.sideChoiceBtn} ${isSelected ? styles.sideChoiceActive : ''}`}
                              onClick={() => handleSelectSide(option.id)}
                              disabled={isSubmitting}
                            >
                              <span className={styles.checkboxBox} aria-hidden="true">
                                {isSelected && <Check size={11} strokeWidth={2.5} />}
                              </span>
                              <span className={styles.sideChoiceText}>{option.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 4. Wedding Wish — Ruled Fine Cotton Letter Paper */}
                    <div className={styles.fieldRow}>
                      <label htmlFor="message" className={styles.fieldLabel}>
                        {t.rsvp.messageLabel}
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder={t.rsvp.messagePlaceholder}
                        className={styles.ruledTextarea}
                        rows={3}
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Signature Couture Double-Border Rectangular Letterpress CTA Button (No Yellow Neon) */}
                    <div className={styles.submitWrap}>
                      <button
                        type="submit"
                        id="rsvp-submit-btn"
                        className={styles.doubleBorderSubmit}
                        disabled={isSubmitting}
                        aria-label={t.rsvp.submitBtn}
                      >
                        <span className={styles.doubleBorderSubmitInner}>
                          {isSubmitting ? (
                            <>
                              <span className={styles.spinner} />
                              <span>{t.rsvp.confirming}</span>
                            </>
                          ) : (
                            <span>{t.rsvp.submitBtn}</span>
                          )}
                        </span>
                      </button>
                    </div>

                    <footer className={styles.cardBottomMark} aria-hidden="true">
                      <span>{bride.shortName} &amp; {groom.shortName} · 17.01.2027</span>
                    </footer>
                  </motion.form>
                ) : (
                  /* Wax-Sealed Keepsake Confirmation Card */
                  <motion.div
                    key="rsvp-success"
                    className={styles.successCard}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.55 }}
                  >
                    <span className={styles.successHeading}>{t.rsvp.successHeading}</span>
                    <h3 className={styles.successGuestName}>
                      {t.rsvp.thankYou} {confirmedGuest?.fullName || ''}
                    </h3>
                    <div className={styles.headerRule} aria-hidden="true">
                      <span />
                      <i>♡</i>
                      <span />
                    </div>
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

                    <button
                      type="button"
                      onClick={handleReset}
                      className={styles.resetLinkBtn}
                    >
                      {t.rsvp.resetBtn}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
