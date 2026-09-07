import React from 'react';
import { motion } from 'framer-motion';
import weddingConfig from '../../config/weddingConfig';
import { useLanguage } from '../../context/LanguageContext';
import styles from './LoveStory.module.css';

export default function LoveStory() {
  const { t } = useLanguage();

  const milestones = t.story.milestones || weddingConfig.story;

  return (
    <section className={`section ${styles.storySection}`} id="story">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-subtitle">{t.story.tag}</span>
          <h2 className="section-title">{t.story.title}</h2>
          <div className="gold-divider">
            <span>♡</span>
          </div>
        </div>

        {/* Timeline Container */}
        <div className={styles.timelineContainer}>
          {/* Vertical Golden Connecting Line */}
          <div className={styles.timelineLine} />

          {/* Timeline Items */}
          {milestones.map((milestone, index) => {
            const fallbackImage = weddingConfig.story[index]?.image;

            return (
              <motion.div
                key={milestone.year + index}
                className={styles.timelineItem}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                {/* Timeline node */}
                <div className={styles.timelineNode} />

                {/* Milestone Card */}
                <div className={styles.itemCard}>
                  <span className={styles.yearBadge}>{milestone.year}</span>
                  <h3 className={styles.itemTitle}>{milestone.title}</h3>
                  <span className={styles.itemSubtitle}>{milestone.subtitle}</span>
                  <p className={styles.itemDescription}>{milestone.description}</p>

                  {fallbackImage && (
                    <div className={styles.imageWrapper}>
                      <img
                        src={fallbackImage}
                        alt={milestone.title}
                        className={styles.itemImage}
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
