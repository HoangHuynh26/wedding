import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, Navigation } from 'lucide-react';
import weddingConfig from '../../config/weddingConfig';
import { useLanguage } from '../../context/LanguageContext';
import NeonButton from '../NeonButton/NeonButton';
import styles from './Venue.module.css';

export default function Venue() {
  const { venue } = weddingConfig;
  const { t } = useLanguage();

  return (
    <section className={`section ${styles.venueSection}`} id="venue" aria-label="Wedding Venue & Location">
      <div className="container">

        <motion.div
          className={styles.venueCard}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8 }}
        >
          <div className={styles.cardGrid}>
            {/* Details Column */}
            <div className={styles.infoCol}>
              <div>
                <span className={styles.venueHall}>Địa điểm tổ chức bên cô dâu</span>

                {/* Date & Time */}
                <div className={styles.detailRow}>
                  <div className={styles.iconCircle}>
                    <Calendar size={20} />
                  </div>
                  <div className={styles.detailText}>
                    <h4>{t.venue.timeTitle}</h4>
                    <p>{t.countdown.fullDate}</p>
                  </div>
                </div>


                {/* Address */}
                <div className={styles.detailRow}>
                  <div className={styles.iconCircle}>
                    <MapPin size={20} />
                  </div>
                  <div className={styles.detailText}>
                    <h4>{t.venue.addressTitle}</h4>
                    <p>{t.venue.addressText || venue.address}</p>
                  </div>
                </div>

                {/* Schedule preview */}
                <div className={styles.scheduleBox}>
                  {t.venue.schedule.map((item, idx) => (
                    <div key={idx} className={styles.scheduleItem}>
                      <span>&bull;</span> {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Open Google Maps Button with Neon Border */}
              <NeonButton
                as="a"
                href={venue.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="primary"
                id="open-google-maps-btn"
                fullWidth
                thickness={2.6}
                borderSize={45}
                glow={85}
                speed={16}
                style={{ marginTop: '1rem' }}
              >
                <Navigation size={18} />
                <span>{t.venue.mapsBtn}</span>
              </NeonButton>
            </div>

            {/* Map Column */}
            <div className={styles.mapCol}>
              <iframe
                title="Google Maps Venue Location"
                src={venue.embedMapUrl}
                className={styles.mapIframe}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
