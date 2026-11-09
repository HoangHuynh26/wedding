import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import weddingConfig from '../../config/weddingConfig';
import { useLanguage } from '../../context/LanguageContext';
import styles from './LoveStory.module.css';

function TimelineMilestoneItem({ milestone, index, fallbackImage }) {
  const itemRef = useRef(null);

  // Track the item's scroll progress through the window viewport
  const { scrollYProgress } = useScroll({
    target: itemRef,
    offset: ['start end', 'end start'],
  });

  // When scrolling down:
  // - 0.00 -> 0.18: Item enters from bottom, fades in from 0 to 1
  // - 0.18 -> 0.52: Item is in the prime reading area (center of viewport), solid opacity 1
  // - 0.52 -> 0.78: Item moves into the upper viewport ("card trên"), smoothly fades out from 1 to 0
  // When scrolling up:
  // - 0.78 -> 0.52: Item moves back down into view, smoothly fades back in from 0 to 1
  // - 0.52 -> 0.18: Item returns to solid opacity 1
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.18, 0.52, 0.78],
    [0, 1, 1, 0]
  );

  const scale = useTransform(
    scrollYProgress,
    [0, 0.18, 0.52, 0.78],
    [0.94, 1, 1, 0.96]
  );

  const y = useTransform(
    scrollYProgress,
    [0, 0.18, 0.52, 0.78],
    [35, 0, 0, -25]
  );

  const pointerEvents = useTransform(opacity, (v) => (v < 0.15 ? 'none' : 'auto'));

  return (
    <motion.div
      ref={itemRef}
      className={styles.timelineItem}
      style={{ opacity, scale, y, pointerEvents, willChange: 'transform, opacity' }}
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
}

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
              <TimelineMilestoneItem
                key={milestone.year + index}
                milestone={milestone}
                index={index}
                fallbackImage={fallbackImage}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
