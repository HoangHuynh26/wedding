import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Sparkles } from 'lucide-react';
import weddingConfig from '../../config/weddingConfig';
import useInvitationParams from '../../hooks/useInvitationParams';
import styles from './FormalInvitation.module.css';

export default function FormalInvitation() {
  const { groom, bride, event, venue } = weddingConfig;
  const { guestName, inviterName, hasPersonalization } = useInvitationParams();

  return (
    <section className={styles.formalSection} id="invitation" aria-label="Formal Wedding Invitation">
      <div className="container">
        {/* KOREAN MINIMALIST EDITORIAL WEDDING CARD */}
        <motion.div
          className={styles.invitationCard}
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* 1. TOP COUPLE HERO PHOTO */}
          <div className={styles.topPhotoFrame}>
            <img
              src="./couple.jpg"
              alt={`${groom.name} & ${bride.name}`}
              className={styles.topHeroImg}
            />
          </div>

          {/* 2. CARD CONTENT BODY */}
          <div className={styles.cardContentBody}>
            {/* PARENTS' TWO-COLUMN PILLARS */}
            <div className={styles.familyPillarsRow}>
              {/* Groom's Family */}
              <div className={styles.familyColumn}>
                <span className={styles.pillarTitle}>NHÀ TRAI</span>
                <div className={styles.parentsNames}>
                  <div>Ông: Trần Đình Lý</div>
                  <div>Bà: Lê Thị Kim Dung</div>
                </div>
              </div>

              {/* Bride's Family */}
              <div className={styles.familyColumn}>
                <span className={styles.pillarTitle}>NHÀ GÁI</span>
                <div className={styles.parentsNames}>
                  <div>Ông: Nguyễn Thanh Tâm</div>
                  <div>Bà: Nguyễn Xuân Mai</div>
                </div>
              </div>
            </div>

            {/* INVITATION PROCLAMATION & LOVING QUOTE */}
            <div className={styles.invitationAnnouncement}>
              <h3 className={styles.announcementTitle}>
                KÍNH MỜI THAM DỰ TIỆC CHUNG VUI
                <br />
                CỦA GIA ĐÌNH CHÚNG TÔI
              </h3>
              <p className={styles.vietnameseQuote}>
                Tình yêu và sự gắn kết đưa hai trái tim về chung một mái nhà,
                <br />
                rất mong sự hiện diện của quý khách để cùng sẻ chia khoảnh khắc ý nghĩa này.
              </p>

              {/* Personalized Guest Salutation if ?to=... */}
              {hasPersonalization && (
                <div className={styles.recipientFormalPlaque}>
                  <span className={styles.recipientHonorTag}>
                    <Sparkles size={11} />
                    <span>TRÂN TRỌNG KÍNH MỜI</span>
                    <Sparkles size={11} />
                  </span>
                  <h4 className={styles.recipientGuestName}>{guestName || 'Quý Khách Quý'}</h4>
                </div>
              )}
            </div>

            {/* BOTANICAL ORCHID ACCENT (TOP RIGHT) */}
            <div className={styles.orchidCornerTop}>
              <img src="/orchid.jpg" alt="" className={styles.orchidImg} />
            </div>

            {/* COUPLE NAMES (EDITORIAL TYPOGRAPHY) */}
            <div className={styles.coupleNamesSection}>
              <h2 className={styles.groomName}>
                <span>TRẦN LÊ ĐÌNH HUY</span>
              </h2>
              <div className={styles.ampersandBlock}>
                <span className={styles.ampersandGlyph}>&amp;</span>
              </div>
              <h2 className={styles.brideName}>
                <span>NGUYỄN THỊ THU HIỀN</span>
              </h2>
            </div>

            {/* 3-BOX CALENDAR DATE (VIETNAMESE) */}
            <div className={styles.calendarBoxSection}>
              <div className={styles.timeHeader}>
                <span>{event.timeDisplay}, CHỦ NHẬT</span>
              </div>

              <div className={styles.threeBoxDateRow}>
                <div className={styles.dateSideBox}>
                  <span>THÁNG 01</span>
                </div>
                <div className={styles.dateCenterNumber}>
                  <span>17</span>
                </div>
                <div className={styles.dateSideBox}>
                  <span>NĂM 2027</span>
                </div>
              </div>

              <div className={styles.lunarDateText}>
                <span>( Tức ngày 10 tháng 12 năm Bính Ngọ )</span>
              </div>
            </div>

            {/* VENUE & DIRECTIONS SECTION */}
            <div className={styles.venueSection}>
              <span className={styles.venueIntroLabel}>Tổ chức tại</span>
              <h4 className={styles.venueNameText}>GIA</h4>
              <p className={styles.venueAddressViet}>{venue.address}</p>
              {/* Prominent Google Maps Direction Button */}
              <a
                href={venue.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.directionsBtn}
                id="formal-invitation-maps-btn"
              >
                <MapPin size={17} className={styles.pinIcon} />
                <span>CHỈ ĐƯỜNG</span>
              </a>
            </div>

            {/* BOTANICAL ORCHID ACCENT (BOTTOM LEFT) */}
            <div className={styles.orchidCornerBottom}>
              <img src="/orchid.jpg" alt="" className={styles.orchidImg} />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

