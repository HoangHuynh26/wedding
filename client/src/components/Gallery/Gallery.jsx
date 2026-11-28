import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { chineseNames } from '../../config/chineseInvitation';
import weddingConfig from '../../config/weddingConfig';
import { useLanguage } from '../../context/LanguageContext';
import { albumPhotoSrcSet, fullWeddingPhotoUrl } from '../../utils/weddingPhotos';
import Smooth3DSlideshow from './Smooth3DSlideshow';
import styles from './Gallery.module.css';

// Localized photo titles & captions aligned 1-to-1 with weddingConfig.gallery IDs 1..40
const PHOTO_I18N = {
  en: {
    1: ['Lifting the Bridal Veil', 'The groom gently lifts the veil with a loving gaze beside the window'],
    2: ['Walking Side by Side', 'A special moment walking side by side through the historic grand hall'],
    3: ['Flowing White Veil', 'A gentle breeze lifting the white bridal veil in soft light'],
    4: ['Sweet Kiss', 'Sharing a tender kiss beneath the majestic vaulted dome'],
    5: ['Royal Grandeur', 'A panoramic view of the grand hall lit up by radiant smiles'],
    6: ['Touch of Happiness', 'Sweet, loving glances shared on the classical grand staircase'],
    7: ['Quiet Reassurance', 'The groom stands behind the bride, a steady presence she can lean on'],
    8: ['Melody of Love', 'Romantic framing cherishing every moment side by side'],
    9: ['Devoted Gaze', 'Eyes brimming with trust and unconditional love'],
    10: ['Circle of Happiness', 'An overhead view embracing classical architecture and the flowing bridal gown'],
    11: ['Take My Hand', 'Each step along the staircase leads toward our shared future'],
    12: ['Radiant Smiles', 'Bright, joyful smiles lighting up the entire grand hall'],
    13: ['Serene Balcony Moments', 'Quiet, affectionate conversation on the balcony'],
    14: ['Hands Intertwined', 'Holding hands tightly through life’s ups and downs'],
    15: ['Steps Together', 'Walking side by side in the joy of our milestone celebration'],
    16: ['Graceful Bride', 'Radiant smile and gentle beauty of Bride Thu Hien'],
    17: ['Dashing Groom', 'Warm, refined portrait of Groom Dinh Huy'],
    18: ['By the Arched Window', 'Refined silhouette of the groom beside the sunlit arched window'],
    19: ['Fond Affection', 'Tender glances and happy smiles together along the heritage street'],
    20: ['Warm Embrace', 'A gentle embrace that melts away the worries of city life'],
    21: ['Youth Together', 'Crossing the lively city street with bright, youthful smiles'],
    22: ['Morning Dance', 'Morning sunlight illuminating the boundless joy in their eyes'],
    23: ['City Heritage Stroll', 'Strolling beside timeless architecture in the heart of the vibrant city'],
    24: ['Stone Colonnade', 'Walking leisurely beside stately classical stone columns'],
    25: ['Modern & Vibrant', 'Confident individuality shining through every artistic frame'],
    26: ['Sunlit Laughter', 'Pure, natural, and heartfelt joy shared together'],
    27: ['Distinctive Style', 'A bold, contemporary moment filled with signature charm'],
    28: ['Playful & Sweet', 'Lighthearted, adorable moments of laughter between the two of us'],
    29: ['Composed Profile', 'Gentlemanly poise and charisma of Groom Dinh Huy'],
    30: ['Confident Stride', 'The young groom stepping confidently toward a bright future'],
    31: ['Lifelong Bond', 'A harmonious blend of solemn tradition and modern romance'],
    32: ['Wholehearted Love', 'Shared glances filled with tender care and deep understanding'],
    33: ['Graceful Ao Dai', 'Timeless elegance in a traditional white Ao Dai paired with a bridal veil'],
    34: ['Corridor of Memories', 'Walking down a nostalgic heritage corridor adorned with vintage patterns'],
    35: ['Peaceful Together', 'A quiet, heartwarming moment beside a lifelong partner'],
    36: ['Pure Vietnamese Charm', 'Pure, gentle grace of a Vietnamese bride in traditional attire'],
    37: ['Refined Elegance', 'Radiant smiles and affectionate glances in every graceful detail'],
    38: ['Forever Vow', 'Arm in arm stepping across the threshold of a fulfilling marriage'],
    39: ['Artistic Moment', 'An artful moment in which time slips by and love endures'],
    40: ['Poised Bridal Silhouette', 'Regal silhouette of the bride in a couture lace mermaid gown'],
  },
  zh: {
    1: ['轻掀头纱', '新郎在窗畔温柔掀开头纱，目光深情而专注'],
    2: ['并肩同行', '在古典殿堂中，两人并肩走过这庄重而幸福的一刻'],
    3: ['白纱轻扬', '微风轻拂洁白头纱，在柔和光影中温柔飘逸'],
    4: ['甜蜜一吻', '在宏伟穹顶之下定格深情甜蜜的一吻'],
    5: ['华美殿堂', '恢弘大厅全景与新人灿烂幸福的笑容交相辉映'],
    6: ['触碰幸福', '在古典阶梯间深情对望，流露满满爱意'],
    7: ['安心依靠', '新郎伫立身后，成为新娘最温暖坚实的依靠'],
    8: ['爱的旋律', '浪漫视角珍藏相依相伴的每一个美好瞬间'],
    9: ['深情凝望', '眼眸中盛满信任与圆满真挚的爱意'],
    10: ['幸福回旋', '俯瞰视角将古典建筑与盛放的裙摆尽收眼底'],
    11: ['执子之手', '每一级台阶都延伸向两人共同的美好未来'],
    12: ['笑靥如花', '灿烂明媚的笑容点亮整座古典礼堂'],
    13: ['露台絮语', '凭栏相依，在静谧时光里轻声细语'],
    14: ['十指紧扣', '紧握彼此双手，携手走过人生的起伏'],
    15: ['携手同行', '满怀大喜之日的欢欣，并肩迈步向前'],
    16: ['明艳新娘', `新娘${chineseNames.bride.shortName}温婉动人的气质与灿烂笑容`],
    17: ['温润新郎', `新郎${chineseNames.groom.shortName}优雅俊朗而温暖的肖像`],
    18: ['拱窗沐光', '新郎伫立在洒满暖阳的拱形窗畔，尽显儒雅风度'],
    19: ['情深意浓', '在古街上相视而笑，眼中满是柔情与幸福'],
    20: ['温暖相拥', '温柔的拥抱驱散了都市的喧嚣与烦忧'],
    21: ['青春有你', '携手走过繁华街道，绽放充满朝气的笑容'],
    22: ['晨光之舞', '清晨暖阳映照着眼眸中满溢的幸福'],
    23: ['漫步城央', '在繁华都市中心漫步于古典建筑之间'],
    24: ['古典石廊', '在庄重典雅的石柱长廊旁悠然漫步'],
    25: ['时尚活力', '在每一帧艺术画面中自信展现独特个性'],
    26: ['阳光笑颜', '最自然纯真、发自内心的欢乐时刻'],
    27: ['摩登格调', '独具匠心、充满现代时尚魅力的定格瞬间'],
    28: ['俏皮甜蜜', '属于两人轻松欢快又可爱的嬉笑瞬间'],
    29: ['儒雅侧影', `新郎${chineseNames.groom.shortName}沉稳绅士的优雅气质`],
    30: ['笃定前行', '年轻自信的新郎满怀热忱迈向美好未来'],
    31: ['百年好合', '庄重传统礼韵与现代真挚爱情的美好交融'],
    32: ['情深意长', '目光交汇间尽是温柔呵护与彼此默契'],
    33: ['温婉奥黛', '传统白色越南奥黛搭配轻盈头纱的曼妙风姿'],
    34: ['时光回廊', '漫步在充满复古花纹与怀旧韵味的长廊'],
    35: ['岁月静好', '与相伴一生的挚爱共度宁静温馨时光'],
    36: ['东方温婉', '越南新娘纯净柔美、温婉动人的传统风采'],
    37: ['高雅风姿', '灿烂笑容与深情目光勾勒出隽永高雅格调'],
    38: ['白首之约', '挽手并肩迈入美满幸福的婚姻殿堂'],
    39: ['光影定格', '光影流转间时光匆匆掠过，唯有真爱恒久驻留'],
    40: ['曼妙身姿', '高定蕾丝鱼尾婚纱映衬新娘绰约高贵身姿'],
  },
};

export default function Gallery() {
  const { t, language, bride, groom, isGroomSide } = useLanguage();
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

  // Assemble full photo collection — strictly all 40 studio "file le" photos (Couple shots first, AB 15 TO excluded)
  const allPhotos = useMemo(() => {
    const coupleFallback = isGroomSide
      ? `${groom.shortName} & ${bride.shortName}`
      : `${bride.shortName} & ${groom.shortName}`;
    return weddingConfig.gallery.map((photo) => {
      let localizedTitle = language === 'zh' ? '婚纱纪念照' : photo.title || coupleFallback;
      let localizedCaption = language === 'zh' ? '' : photo.caption || '';

      if (language === 'en' || language === 'zh') {
        const entry = PHOTO_I18N[language]?.[photo.id];
        if (entry) {
          localizedTitle = entry[0];
          localizedCaption = entry[1];
        }
      }

      const src = fullWeddingPhotoUrl(photo.src || photo.thumbnail);
      return {
        src,
        image: { src, srcSet: albumPhotoSrcSet(src), alt: localizedTitle },
        title: localizedTitle,
        caption: localizedCaption,
        category: photo.category || 'grand-hall',
        position: photo.position || '50% 28%',
      };
    });
  }, [language, bride.shortName, groom.shortName]);

  // Filter photos by active category
  const filteredPhotos = useMemo(() => {
    if (selectedCategory === 'all') return allPhotos;
    return allPhotos.filter((item) => item.category === selectedCategory);
  }, [allPhotos, selectedCategory]);

  // Categories with localized labels & counts (AB 15 TO album spread category removed)
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

  // Lightbox touch & pointer swipe (works on Mobile, iPad, and Desktop drag)
  const lbTouchStartX = useRef(0);
  const lbTouchDeltaX = useRef(0);
  const lbPointerDown = useRef(false);
  const lbDidSwipe = useRef(false);

  const handleLbTouchStart = (e) => {
    if (!e.touches || e.touches.length === 0) return;
    lbTouchStartX.current = e.touches[0].clientX;
    lbTouchDeltaX.current = 0;
    lbDidSwipe.current = false;
  };

  const handleLbTouchMove = (e) => {
    if (!e.touches || e.touches.length === 0) return;
    lbTouchDeltaX.current = e.touches[0].clientX - lbTouchStartX.current;
  };

  const handleLbTouchEnd = () => {
    if (isZoomed) return;
    if (Math.abs(lbTouchDeltaX.current) > 36) {
      lbDidSwipe.current = true;
      if (lbTouchDeltaX.current > 0) {
        showPrevLightbox();
      } else {
        showNextLightbox();
      }
    }
    lbTouchStartX.current = 0;
    lbTouchDeltaX.current = 0;
  };

  const handleLbPointerDown = (e) => {
    if (e.pointerType === 'touch' || isZoomed) return;
    lbPointerDown.current = true;
    lbTouchStartX.current = e.clientX;
    lbTouchDeltaX.current = 0;
    lbDidSwipe.current = false;
  };

  const handleLbPointerMove = (e) => {
    if (!lbPointerDown.current || e.pointerType === 'touch') return;
    lbTouchDeltaX.current = e.clientX - lbTouchStartX.current;
  };

  const handleLbPointerUp = (e) => {
    if (!lbPointerDown.current || e.pointerType === 'touch') return;
    lbPointerDown.current = false;
    if (!isZoomed && Math.abs(lbTouchDeltaX.current) > 40) {
      lbDidSwipe.current = true;
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
    if (lbDidSwipe.current) {
      lbDidSwipe.current = false;
      return;
    }
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
    <section className={`section ${styles.gallerySection}`} id="gallery" aria-label={t.gallery.title}>
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <h2 className="section-title">{t.gallery.title}</h2>
          <p className={styles.galleryIntroText}>{t.gallery.intro}</p>
        </div>

        {/* 3D Coverflow Slideshow (Swipe-only on mobile, no arrows & no counter) */}
        <div className={styles.albumContainer}>
          <Smooth3DSlideshow
            slides={filteredPhotos}
            activeIndex={activeIndex}
            onActiveIndexChange={setActiveIndex}
            onOpenLightbox={openLightbox}
            showControls={true}
            autoplay={lightboxIndex === null}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 4 }}
            labels={{
              carousel: t.gallery.carouselLabel,
              expand: t.gallery.expandBtn,
              prev: t.gallery.prevLabel,
              next: t.gallery.nextLabel,
            }}
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
            onClick={() => {
              if (lbDidSwipe.current) {
                lbDidSwipe.current = false;
                return;
              }
              closeLightbox();
            }}
            onTouchStart={handleLbTouchStart}
            onTouchMove={handleLbTouchMove}
            onTouchEnd={handleLbTouchEnd}
            onPointerDown={handleLbPointerDown}
            onPointerMove={handleLbPointerMove}
            onPointerUp={handleLbPointerUp}
          >
            {/* Close Button */}
            <button
              className={styles.closeButton}
              onClick={() => {
              if (lbDidSwipe.current) {
                lbDidSwipe.current = false;
                return;
              }
              closeLightbox();
            }}
              aria-label={t.gallery.closeLabel || 'Close photo viewer'}
            >
              <X size={24} />
            </button>

            {/* Lightbox Navigation Buttons (Desktop only) */}
            {!isMobile && (
              <>
                <button
                  className={`${styles.navButton} ${styles.prevButton}`}
                  onClick={showPrevLightbox}
                  aria-label={t.gallery.prevLabel || 'Previous photo'}
                >
                  <ChevronLeft size={30} />
                </button>

                <button
                  className={`${styles.navButton} ${styles.nextButton}`}
                  onClick={showNextLightbox}
                  aria-label={t.gallery.nextLabel || 'Next photo'}
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
                    decoding="async"
                    draggable={false}
                    className={`${styles.lightboxImg} ${isZoomed ? styles.zoomed : ''}`}
                  />
              </div>

              {/* Swipe Left / Right Gesture Hint when viewing expanded photo */}
              {!isZoomed && filteredPhotos.length > 1 && (
                <div className={styles.lightboxSwipeHint} aria-hidden="true">
                  <ChevronLeft size={15} className={styles.swipeArrowLeft} />
                  <span>
                    {t.gallery.lightboxSwipeHint || 'Vuốt sang trái hoặc phải để chuyển ảnh'}
                  </span>
                  <ChevronRight size={15} className={styles.swipeArrowRight} />
                </div>
              )}

              {/* Lightbox Info Bar (Counter only on desktop) */}
              {!isMobile && (
                <div className={styles.lightboxInfo}>
                  <div className={styles.lightboxCounter}>
                    {String(lightboxIndex + 1).padStart(2, '0')} / {String(filteredPhotos.length).padStart(2, '0')}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
