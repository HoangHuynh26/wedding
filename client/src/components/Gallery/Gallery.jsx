import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import weddingConfig from '../../config/weddingConfig';
import { useLanguage } from '../../context/LanguageContext';
import Smooth3DSlideshow from './Smooth3DSlideshow';
import styles from './Gallery.module.css';

// Localized photo titles & captions for English & Chinese guests
const PHOTO_I18N = {
  en: {
    1: ['Walking Together', 'A sacred moment walking side by side in the grand hall'],
    2: ['Royal Elegance', 'Radiant smiles beneath the majestic grand staircase'],
    3: ['Flowing White Veil', 'A gentle breeze lifting the bridal veil in soft light'],
    4: ['Sweet Kiss', 'A tender kiss shared beneath the soaring classical dome'],
    5: ['Melody of Love', 'Romantic framing cherishing every shared heartbeat'],
    6: ['Peaceful Sanctuary', 'Standing strong together at the beginning of forever'],
    7: ['Loving Gaze', 'Looking into each other’s eyes with warmth and devotion'],
    8: ['Devoted Glances', 'Eyes filled with trust and unconditional love'],
    9: ['Circle of Happiness', 'Classic architecture embracing the flowing bridal gown'],
    10: ['Take My Hand', 'Every step forward leads into our shared future'],
    11: ['Serene Balcony Moments', 'Quiet, affectionate conversations overlooking the hall'],
    12: ['Gentle Whispers', 'Little stories that create a lifetime of happiness'],
    13: ['Dashing Groom', 'Warm and refined portrait of Groom Đình Huy'],
    14: ['Radiant Bride', 'Graceful beauty and bright smile of Bride Thu Hiền'],
    15: ['By the Arched Window', 'Timeless elegance bathed in natural sunlight'],
    16: ['Bright Smiles', 'Joyful laughter lighting up the entire hall'],
    17: ['Hand in Hand', 'Holding hands tightly through every chapter of life'],
    18: ['Side by Side', 'Stepping joyfully toward our special wedding day'],
    19: ['City Heritage', 'Strolling past timeless architecture in the heart of the city'],
    20: ['Youth Together', 'Crossing the avenue with vibrant energy and joy'],
    21: ['Fond Affection', 'A tender gaze reserved only for his beloved'],
    22: ['Stone Colonnade', 'Wandering peacefully beside stately stone columns'],
    23: ['Morning Sunlight', 'Soft morning light reflecting boundless happiness'],
    24: ['Warm Embrace', 'A gentle hug that melts away the rush of the city'],
    25: ['Modern Style', 'Effortless charm and contemporary romance'],
    26: ['Vibrant Spirit', 'Confident, joyful energy in every frame'],
    27: ['Sunlit Laughter', 'Pure, candid, and heartfelt joy together'],
    28: ['Playful Moments', 'Sweet and lighthearted memories of just the two of us'],
    29: ['Stepping Forward', 'Looking ahead toward a bright tomorrow'],
    30: ['Refined Poise', 'Gentle poise and sincerity of Groom Đình Huy'],
    31: ['Graceful Ao Dai', 'Timeless Vietnamese white Ao Dai paired with a bridal veil'],
    32: ['Pure Vietnamese Charm', 'Gentle, graceful portrait in traditional attire'],
    33: ['Lifelong Bond', 'Where cherished tradition meets modern love'],
    34: ['Corridor of Memories', 'Walking hand in hand down a nostalgic heritage corridor'],
    35: ['Wholehearted Love', 'Shared glances filled with care and understanding'],
    36: ['Peaceful Together', 'Quiet warmth beside a lifelong partner'],
    37: ['Graceful Silhouette', 'Elegant lace bridal gown in soft studio light'],
    38: ['Artistic Moment', 'Time passes by, yet true love remains timeless'],
    39: ['Timeless Poise', 'Poised and luminous in every delicate detail'],
    40: ['Forever Vow', 'Arm in arm stepping into a joyful marriage'],
    41: ['Wedding Photobook Cover', 'Opening page of Thu Hiền & Đình Huy’s love story'],
  },
  zh: {
    1: ['并肩同行', '在古典殿堂中携手步入幸福时刻'],
    2: ['浪漫殿堂', '宏伟阶梯下的灿烂幸福笑容'],
    3: ['白纱轻扬', '微风轻拂洁白头纱，温柔而浪漫'],
    4: ['甜蜜亲吻', '在穹顶之下定格深情一吻'],
    5: ['爱的旋律', '温柔镜头珍藏相依相伴的每一刻'],
    6: ['安心港湾', '彼此依靠，携手开启一生幸福'],
    7: ['深情对望', '目光交汇间满载温柔与爱意'],
    8: ['含情脉脉', '眼眸中盛满信任与笃定的幸福'],
    9: ['幸福回旋', '古典建筑与洁白婚纱交相辉映'],
    10: ['执子之手', '每一级台阶都延伸向共同的未来'],
    11: ['露台絮语', '凭栏相依，细语温柔时光'],
    12: ['轻声呢喃', '点滴温暖汇聚成一生的幸福'],
    13: ['温润新郎', '新郎 Đình Huy 帅气温暖的肖像'],
    14: ['明艳新娘', '新娘 Thu Hiền 温婉动人的笑容'],
    15: ['拱窗沐光', '沐浴在柔和阳光下的优雅身影'],
    16: ['笑靥如花', '灿烂笑容点亮整座礼堂'],
    17: ['十指紧扣', '紧握双手，共度岁月漫长'],
    18: ['携手共进', '满怀喜悦迈向大喜之日'],
    19: ['城市印记', '漫步在充满历史韵味的街区'],
    20: ['青春有你', '并肩走过街头巷尾，洋溢青春活力'],
    21: ['满眼是你', '新郎望向挚爱时最温柔的目光'],
    22: ['古典廊柱', '悠然漫步于庄重石柱长廊'],
    23: ['晨光熹微', '清晨暖阳映照眼底的幸福'],
    24: ['温暖相拥', '温柔拥抱驱散城市的喧嚣'],
    25: ['时尚格调', '现代简约又独具个性的浪漫瞬间'],
    26: ['自在欢愉', '每一帧画面都洋溢着自然喜悦'],
    27: ['阳光笑颜', '最自然、最真挚的快乐时光'],
    28: ['俏皮甜蜜', '属于两人的轻松可爱瞬间'],
    29: ['笃定前行', '意气风发迈向美好未来'],
    30: ['儒雅风度', '新郎 Đình Huy 沉稳温雅的气质'],
    31: ['优雅奥黛', '越南传统白色奥黛与头纱的柔美结合'],
    32: ['东方温婉', '纯净柔美的传统新娘风采'],
    33: ['百年好合', '传统礼韵与现代爱情的美好交融'],
    34: ['时光长廊', '携手漫步在古韵悠长的回廊'],
    35: ['情深意长', '目光流转间尽是呵护与默契'],
    36: ['岁月静好', '与挚爱相伴的宁静温馨时刻'],
    37: ['曼妙身姿', '精致蕾丝鱼尾婚纱勾勒高雅气质'],
    38: ['光影艺术', '时光流转，唯有真爱恒久留存'],
    39: ['高雅风姿', '举手投足间的从容与优雅'],
    40: ['白首之约', '挽手步入圆满幸福的婚姻殿堂'],
    41: ['精装相册封面', '开启 Thu Hiền & Đình Huy 的幸福篇章'],
  },
};

export default function Gallery() {
  const { t, language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Assemble full photo collection — Bride first, Groom second (Lễ Vu Quy)
  const allPhotos = useMemo(() => {
    const brideTitle = t.gallery.brideTitle;
    const brideCaption = t.gallery.brideCaption;
    const groomTitle = t.gallery.groomTitle;
    const groomCaption = t.gallery.groomCaption;

    const basePhotos = [
      {
        src: '/bride.jpg',
        image: { src: '/bride.jpg', alt: brideTitle },
        title: brideTitle,
        caption: brideCaption,
        category: 'grand-hall',
      },
      {
        src: '/groom.jpg',
        image: { src: '/groom.jpg', alt: groomTitle },
        title: groomTitle,
        caption: groomCaption,
        category: 'grand-hall',
      },
    ];

    const albumPhotos = weddingConfig.gallery.map((photo) => {
      let localizedTitle = photo.title || 'Thu Hiền & Đình Huy';
      let localizedCaption = photo.caption || '';

      if (language === 'en' || language === 'zh') {
        const entry = PHOTO_I18N[language]?.[photo.id];
        if (entry) {
          localizedTitle = entry[0];
          localizedCaption = entry[1];
        } else if (photo.id >= 42) {
          const pageNo = String(photo.id - 41).padStart(2, '0');
          localizedTitle =
            language === 'zh'
              ? `精装相册第 ${pageNo} 页`
              : `Wedding Photobook Spread ${pageNo}`;
          localizedCaption =
            language === 'zh'
              ? 'Thu Hiền & Đình Huy 婚纱纪念特辑'
              : 'Curated studio wedding album spread — Thu Hiền & Đình Huy';
        }
      }

      return {
        src: photo.src,
        image: { src: photo.src, alt: localizedTitle },
        title: localizedTitle,
        caption: localizedCaption,
        category: photo.category || 'grand-hall',
      };
    });

    return [...basePhotos, ...albumPhotos];
  }, [t, language]);

  // Filter photos by active category
  const filteredPhotos = useMemo(() => {
    if (selectedCategory === 'all') return allPhotos;
    return allPhotos.filter((item) => item.category === selectedCategory);
  }, [allPhotos, selectedCategory]);

  // Categories with localized labels & counts
  const categories = useMemo(() => {
    const catLabels = t.gallery.categories || {};
    return [
      { key: 'all', label: catLabels.all || 'Tất Cả', count: allPhotos.length },
      {
        key: 'grand-hall',
        label: catLabels['grand-hall'] || 'Sảnh Hoàng Gia',
        count: allPhotos.filter((p) => p.category === 'grand-hall').length,
      },
      {
        key: 'street-heritage',
        label: catLabels['street-heritage'] || 'Phố Cổ & Di Sản',
        count: allPhotos.filter((p) => p.category === 'street-heritage').length,
      },
      {
        key: 'traditional',
        label: catLabels.traditional || 'Lễ Phục Truyền Thống',
        count: allPhotos.filter((p) => p.category === 'traditional').length,
      },
      {
        key: 'artistic',
        label: catLabels.artistic || 'Nghệ Thuật',
        count: allPhotos.filter((p) => p.category === 'artistic').length,
      },
      {
        key: 'album',
        label: catLabels.album || 'Sách Album Cưới',
        count: allPhotos.filter((p) => p.category === 'album').length,
      },
    ];
  }, [t, allPhotos]);

  const handleCategoryChange = (key) => {
    setSelectedCategory(key);
    setActiveIndex(0);
  };

  const activePhoto = filteredPhotos[activeIndex] || filteredPhotos[0];

  // Cinematic Lightbox Handlers
  const openLightbox = useCallback((index) => {
    setLightboxIndex(index);
    setIsZoomed(false);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
    setIsZoomed(false);
    document.body.style.overflow = '';
  }, []);

  const showNextLightbox = useCallback(
    (e) => {
      e?.stopPropagation();
      setIsZoomed(false);
      setLightboxIndex((prev) => (prev !== null ? (prev + 1) % filteredPhotos.length : null));
    },
    [filteredPhotos.length]
  );

  const showPrevLightbox = useCallback(
    (e) => {
      e?.stopPropagation();
      setIsZoomed(false);
      setLightboxIndex((prev) =>
        prev !== null ? (prev - 1 + filteredPhotos.length) % filteredPhotos.length : null
      );
    },
    [filteredPhotos.length]
  );

  // Lightbox touch swipe for mobile
  const lbTouchStartX = useRef(0);
  const lbTouchDeltaX = useRef(0);

  const handleLbTouchStart = (e) => {
    if (!e.touches || e.touches.length === 0) return;
    lbTouchStartX.current = e.touches[0].clientX;
    lbTouchDeltaX.current = 0;
  };

  const handleLbTouchMove = (e) => {
    if (!e.touches || e.touches.length === 0) return;
    lbTouchDeltaX.current = e.touches[0].clientX - lbTouchStartX.current;
  };

  const handleLbTouchEnd = () => {
    if (isZoomed) return;
    if (Math.abs(lbTouchDeltaX.current) > 36) {
      if (lbTouchDeltaX.current > 0) {
        showPrevLightbox();
      } else {
        showNextLightbox();
      }
    }
    lbTouchStartX.current = 0;
    lbTouchDeltaX.current = 0;
  };

  const toggleZoom = (e) => {
    e?.stopPropagation();
    setIsZoomed((prev) => !prev);
  };

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNextLightbox();
      if (e.key === 'ArrowLeft') showPrevLightbox();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, closeLightbox, showNextLightbox, showPrevLightbox]);

  const currentLightboxPhoto = lightboxIndex !== null ? filteredPhotos[lightboxIndex] : null;

  return (
    <section className={`section ${styles.gallerySection}`} id="gallery" aria-label="Photo Gallery">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <h2 className="section-title">{t.gallery.title}</h2>
          <p className={styles.galleryIntroText}>{t.gallery.intro}</p>
        </div>

        {/* Category Filter Tabs */}
        <div className={styles.categoryFilterBar} role="tablist" aria-label="Gallery Categories">
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              role="tab"
              aria-selected={selectedCategory === cat.key}
              className={`${styles.categoryBtn} ${selectedCategory === cat.key ? styles.categoryBtnActive : ''}`}
              onClick={() => handleCategoryChange(cat.key)}
            >
              <span>{cat.label}</span>
              <span className={styles.categoryCount}>({cat.count})</span>
            </button>
          ))}
        </div>

        {/* 3D Coverflow Slideshow (Swipe-only on mobile, no arrows & no counter) */}
        <div className={styles.albumContainer}>
          <Smooth3DSlideshow
            slides={filteredPhotos}
            activeIndex={activeIndex}
            onActiveIndexChange={setActiveIndex}
            onOpenLightbox={openLightbox}
            showControls={true}
          />
        </div>
      </div>

      {/* Cinematic Full-Screen Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && currentLightboxPhoto && (
          <motion.div
            className={styles.lightboxBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeLightbox}
            onTouchStart={handleLbTouchStart}
            onTouchMove={handleLbTouchMove}
            onTouchEnd={handleLbTouchEnd}
          >
            {/* Close Button */}
            <button
              className={styles.closeButton}
              onClick={closeLightbox}
              aria-label="Close photo viewer"
            >
              <X size={24} />
            </button>

            {/* Lightbox Navigation Buttons (Desktop only) */}
            {!isMobile && (
              <>
                <button
                  className={`${styles.navButton} ${styles.prevButton}`}
                  onClick={showPrevLightbox}
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={30} />
                </button>

                <button
                  className={`${styles.navButton} ${styles.nextButton}`}
                  onClick={showNextLightbox}
                  aria-label="Next photo"
                >
                  <ChevronRight size={30} />
                </button>
              </>
            )}

            {/* Main Lightbox Content */}
            <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
              <div
                className={`${styles.lightboxImageWrapper} ${isZoomed ? styles.isZoomed : ''}`}
                onClick={toggleZoom}
              >
                <img
                  src={currentLightboxPhoto.src || currentLightboxPhoto.image?.src}
                  alt={currentLightboxPhoto.title}
                  className={`${styles.lightboxImg} ${isZoomed ? styles.zoomed : ''}`}
                />
              </div>

              {/* Lightbox Info Bar */}
              <div className={styles.lightboxInfo}>
                {!isMobile && (
                  <div className={styles.lightboxCounter}>
                    {String(lightboxIndex + 1).padStart(2, '0')} / {String(filteredPhotos.length).padStart(2, '0')}
                  </div>
                )}
                <h4 className={styles.lightboxTitle}>{currentLightboxPhoto.title}</h4>
                {currentLightboxPhoto.caption && (
                  <p className={styles.lightboxCaption}>{currentLightboxPhoto.caption}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
