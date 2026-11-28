import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { chineseNames } from '../config/chineseInvitation';
import weddingConfig from '../config/weddingConfig';
import { useCmsStore } from '../store/cmsStore';

const LanguageContext = createContext(null);
const englishCouple = {
  bride: {
    ...weddingConfig.bride,
    name: 'Nguyen Thi Thu Hien',
    shortName: 'Thu Hien',
    role: 'The Bride',
  },
  groom: {
    ...weddingConfig.groom,
    name: 'Tran Le Dinh Huy',
    shortName: 'Dinh Huy',
    role: 'The Groom',
  },
};
const chineseCouple = {
  bride: { ...weddingConfig.bride, ...chineseNames.bride },
  groom: { ...weddingConfig.groom, ...chineseNames.groom },
};

/**
 * Resolve language strictly from URL query (?lang=vi | en | zh),
 * defaulting to Vietnamese ('vi') whenever not specified.
 */
export function resolveUrlLanguage(search = '') {
  try {
    const params = new URLSearchParams(search);
    const raw = (
      params.get('lang') ||
      params.get('language') ||
      params.get('locale') ||
      ''
    )
      .trim()
      .toLowerCase();

    if (raw === 'en' || raw === 'english' || raw === 'eng') return 'en';
    if (raw === 'zh' || raw === 'cn' || raw.startsWith('zh-') || raw === 'chinese') return 'zh';
    if (raw === 'vi' || raw === 'vn' || raw === 'vietnamese') return 'vi';
  } catch {
    // Fallback to default Vietnamese
  }
  return 'vi';
}

/**
 * Resolve which wedding side ('bride' | 'groom') is active from pathname or ?side=...
 */
export function resolveInvitationSide(pathname = '', search = '') {
  const cleanPath = String(pathname || '').toLowerCase();
  if (
    /^\/(chu-re|nha-trai|groom)(\/|$)/.test(cleanPath) ||
    /^\/admin\/(chu-re|nha-trai|groom)(\/|$)/.test(cleanPath)
  ) {
    return 'groom';
  }
  try {
    const params = new URLSearchParams(search);
    const rawSide = (params.get('side') || '').trim().toLowerCase();
    if (rawSide === 'groom' || rawSide === 'chu-re' || rawSide === 'nha-trai') {
      return 'groom';
    }
  } catch {
    // ignore
  }
  return 'bride';
}

export const groomEventConfig = {
  dateDisplay: '24 · 01 · 2027',
  fullDateDisplay: 'Chủ Nhật, ngày 24 tháng 01 năm 2027',
  timeDisplay: '17:30 PM',
  receptionTime: '17:30 PM - Đón tiếp Quý Khách & Chụp ảnh lưu niệm',
  dinnerTime: '19:30 PM - Khai tiệc tối mừng Lễ Thành Hôn',
  isoDate: '2027-01-24T17:30:00+07:00',
};

export const groomVenueConfig = {
  name: 'NHÀ HÀNG WHITE PALACE',
  hall: 'Nhà hàng White Palace',
  address: '588 Phạm Văn Đồng, Phường Hiệp Bình Chánh, TP. Thủ Đức, TP. Hồ Chí Minh',
  addressShort: '588 Phạm Văn Đồng, P. Hiệp Bình Chánh, TP. Thủ Đức, TP. HCM',
  phone: '1900 088 850',
  coordinates: { latitude: 10.82588, longitude: 106.716443 },
  googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=White+Palace+588+Pham+Van+Dong+Thu+Duc+Ho+Chi+Minh',
  embedMapUrl: 'https://www.google.com/maps?q=White+Palace+588+Pham+Van+Dong+Thu+Duc+Ho+Chi+Minh&z=16&output=embed',
  etchingImage: '/mauve-theme/white-palace-etching.webp',
};

export const groomTranslations = {
  vi: {
    pageTitle: 'Lễ Thành Hôn | Đình Huy & Thu Hiền • 24.01.2027',
    envelope: {
      header: 'THIỆP MỜI LỄ THÀNH HÔN',
      ceremonyHeading: 'LỄ THÀNH HÔN',
      invitation: 'Trân trọng kính mời Quý Khách đến dự tiệc mừng Lễ Thành Hôn của chúng mình tại Nhà Hàng White Palace.',
    },
    hero: {
      date: '24.01.2027',
      venueTitle: 'Nhà hàng White Palace',
      cityCaps: 'WHITE PALACE • TP. HỒ CHÍ MINH',
    },
    formal: {
      saveTheDate: 'LỄ THÀNH HÔN • TRÂN TRỌNG KÍNH MỜI',
      title: 'THIỆP MỜI LỄ THÀNH HÔN',
      welcome: 'Trân trọng kính mời Quý Khách đến dự bữa tiệc thân mật mừng Lễ Thành Hôn của hai con chúng tôi',
      timeDayHeader: '17:30 PM, CHỦ NHẬT',
      monthBox: 'THÁNG 01',
      dayNumber: '24',
      yearBox: 'NĂM 2027',
      lunarDate: '( Tức ngày 17 tháng 12 năm Bính Ngọ )',
      venueHostName: 'NHÀ HÀNG WHITE PALACE',
      venueAddress: '588 Phạm Văn Đồng, Phường Hiệp Bình Chánh, TP. Thủ Đức, TP. Hồ Chí Minh',
      receptionTag: 'THỜI GIAN & ĐỊA ĐIỂM TỔ CHỨC LỄ THÀNH HÔN',
      fullDate: 'Chủ Nhật, ngày 24 tháng 01 năm 2027',
      time: '17:30 PM',
      venueName: 'NHÀ HÀNG WHITE PALACE',
      hallName: 'Nhà Hàng Tiệc Cưới White Palace',
      address: '588 Phạm Văn Đồng, Phường Hiệp Bình Chánh, TP. Thủ Đức, TP. Hồ Chí Minh',
    },
    countdown: {
      fullDate: 'Chủ Nhật, 24 Tháng 01, 2027 • 17:30 PM',
      ceremonyNote: 'Lễ Thành Hôn • Đình Huy ♡ Thu Hiền',
    },
    scratch: {
      revealedCaption: 'Khoảnh khắc chung đôi • Đình Huy & Thu Hiền',
    },
    theDay: {
      headingTop: 'Lịch',
      headingBottom: 'Trình',
      intro: 'Hành trình đêm tiệc mừng Lễ Thành Hôn ấm áp và trọn vẹn tại Nhà Hàng White Palace.',
      items: [
        {
          time: '17:30 PM',
          title: 'ĐÓN KHÁCH',
          detail: 'Đón tiếp Quý Khách, chụp ảnh lưu niệm và ổn định chỗ ngồi tại sảnh tiệc',
        },
        {
          time: '19:30 PM',
          title: 'KHAI TIỆC TỐI',
          detail: 'Khai tiệc tối ấm cúng, cùng nâng ly chúc phúc và chung vui bên gia đình, bạn bè',
        },
      ],
    },
    transportation: {
      stamp1: 'LỄ THÀNH HÔN',
      stamp2: '24 · 01 · 2027',
      stampNames: 'Huy & Hiền',
      stamp3: 'WHITE PALACE',
      para2: 'Tiệc tối mừng Lễ Thành Hôn được tổ chức tại Nhà Hàng Tiệc Cưới White Palace — 588 Phạm Văn Đồng, Phường Hiệp Bình Chánh, TP. Thủ Đức, TP. Hồ Chí Minh, với sảnh đón tiếp sang trọng và khu vực đỗ xe rộng rãi.',
      para3: 'Gia đình kính mời Quý Khách thu xếp đến đón khách từ 17:30 PM tối Chủ Nhật 24.01.2027 (tức 17/12 năm Bính Ngọ) tại White Palace để cùng lưu giữ khoảnh khắc đẹp trước khi khai tiệc tối (19:30 PM).',
    },
    gallery: {
      intro: 'Những khoảnh khắc đong đầy yêu thương của Đình Huy & Thu Hiền.',
    },
    venue: {
      brideVenueTag: 'Địa điểm tổ chức Tiệc Cưới Nhà Trai (Lễ Thành Hôn)',
      hall: 'Nhà hàng White Palace',
      regionCaps: '588 PHẠM VĂN ĐỒNG, P. HIỆP BÌNH CHÁNH,\nTP. THỦ ĐỨC, THÀNH PHỐ HỒ CHÍ MINH',
      para1: 'Tọa lạc tại không gian sảnh tiệc sang trọng bậc nhất của Nhà hàng Tiệc Cưới White Palace, nơi lưu giữ những nụ cười, tiếng chúc phúc và khoảnh khắc thiêng liêng của đêm tiệc Lễ Thành Hôn.',
      para2: 'Gia đình kính mời Quý Khách đến đón khách từ 17:30 PM tối Chủ Nhật 24.01.2027 tại sảnh tiệc White Palace để cùng chụp ảnh lưu niệm trước khi khai tiệc tối (19:30 PM).',
      timeDetail: '17:30 PM, Chủ Nhật — 24.01.2027',
      addressText: 'Nhà hàng White Palace — 588 Phạm Văn Đồng, Phường Hiệp Bình Chánh, TP. Thủ Đức, TP. Hồ Chí Minh',
      schedule: [
        '17:30 PM - Đón tiếp Quý Khách & Chụp ảnh lưu niệm tại sảnh tiệc White Palace',
        '19:30 PM - Khai tiệc tối ấm cúng cùng gia đình và bạn bè',
      ],
    },
    rsvp: {
      formSubtitle: 'Để gia đình chuẩn bị chu đáo nhất cho buổi tiệc tối tại Nhà Hàng White Palace, xin Quý khách vui lòng xác nhận trước ngày 10.01.2027.',
    },
  },
  en: {
    pageTitle: "Groom's Wedding Invitation | Dinh Huy & Thu Hien • 24.01.2027",
    envelope: {
      header: "GROOM'S WEDDING INVITATION",
      ceremonyHeading: "GROOM'S WEDDING CEREMONY",
      invitation: 'We warmly invite you to our evening wedding banquet at White Palace.',
    },
    hero: {
      date: '24.01.2027',
      venueTitle: 'White Palace Restaurant',
      cityCaps: 'WHITE PALACE • HO CHI MINH CITY',
    },
    formal: {
      saveTheDate: "GROOM'S WEDDING CEREMONY • CORDIALLY INVITED",
      title: "GROOM'S WEDDING INVITATION",
      welcome: "Our family cordially invites you to an intimate dinner celebrating our children's marriage",
      timeDayHeader: '17:30 PM, SUNDAY',
      monthBox: 'JANUARY',
      dayNumber: '24',
      yearBox: '2027',
      lunarDate: '( 17th Day of the 12th Lunar Month, Year of the Fire Horse )',
      venueHostName: 'WHITE PALACE RESTAURANT',
      venueAddress: '588 Pham Van Dong, Hiep Binh Chanh Ward, Thu Duc City, Ho Chi Minh City',
      receptionTag: "GROOM'S WEDDING CEREMONY • TIME & VENUE",
      fullDate: 'Sunday, January 24, 2027',
      time: '17:30 PM',
      venueName: 'WHITE PALACE RESTAURANT',
      hallName: 'White Palace Wedding Restaurant',
      address: '588 Pham Van Dong, Hiep Binh Chanh Ward, Thu Duc City, Ho Chi Minh City',
    },
    countdown: {
      fullDate: 'Sunday, January 24, 2027 • 17:30 PM',
      ceremonyNote: "Groom's Wedding Ceremony • Dinh Huy ♡ Thu Hien",
    },
    scratch: {
      revealedCaption: 'Cherished Moments • Dinh Huy & Thu Hien',
    },
    theDay: {
      headingTop: 'The',
      headingBottom: 'Day',
      intro: 'An evening of celebration at White Palace, from welcoming our guests to sharing dinner together.',
      items: [
        {
          time: '17:30 PM',
          title: 'WELCOME',
          detail: 'Evening guest welcome, seating & commemorative photos at the White Palace hall',
        },
        {
          time: '19:30 PM',
          title: 'EVENING BANQUET',
          detail: 'Dinner begins with toasts and celebration among family and friends.',
        },
      ],
    },
    transportation: {
      stamp1: "GROOM'S WEDDING CEREMONY",
      stamp2: '24 · 01 · 2027',
      stampNames: 'Huy & Hien',
      stamp3: 'WHITE PALACE',
      para2: 'The evening wedding banquet takes place at White Palace Wedding Restaurant, 588 Pham Van Dong, Hiep Binh Chanh Ward, Thu Duc City, Ho Chi Minh City, with an elegant reception hall and ample parking.',
      para3: 'Our family welcomes you to White Palace from 17:30 PM on Sunday, January 24, 2027 (the 17th day of the 12th lunar month, Year of the Fire Horse) for photos before dinner begins at 19:30 PM.',
    },
    gallery: {
      intro: 'Cherished moments of Dinh Huy & Thu Hien.',
    },
    venue: {
      brideVenueTag: "Groom's Wedding Venue",
      hall: 'White Palace Restaurant',
      regionCaps: '588 PHAM VAN DONG, HIEP BINH CHANH WARD,\nTHU DUC CITY, HO CHI MINH CITY',
      para1: 'We will celebrate in the elegant banquet hall at White Palace Wedding Restaurant, surrounded by smiles and heartfelt blessings.',
      para2: 'We recommend arriving from 17:30 PM on Sunday, January 24, 2027 at White Palace to enjoy the welcome reception and take photos before the banquet at 19:30 PM.',
      timeDetail: '17:30 PM, Sunday — January 24, 2027',
      addressText: 'White Palace — 588 Pham Van Dong, Hiep Binh Chanh Ward, Thu Duc City, Ho Chi Minh City',
      schedule: [
        '17:30 PM - Guest Welcome & Commemorative Photos at White Palace',
        '19:30 PM - Evening Wedding Banquet & Celebration',
      ],
    },
    rsvp: {
      formSubtitle: 'Please confirm your attendance before January 10, 2027, so our family can prepare for the evening banquet at White Palace.',
      messagePlaceholder: 'Write your wedding wishes here...',
    },
  },
  zh: {
    pageTitle: `新婚喜宴请柬｜${chineseNames.groom.shortName}与${chineseNames.bride.shortName} · 2027.01.24`,
    envelope: {
      header: '新婚喜宴请柬',
      ceremonyHeading: '新婚喜宴',
      invitation: '谨以满怀喜悦之心，诚邀您拨冗莅临 White Palace 宴会厅参加我们的新婚晚宴，共证幸福时刻。',
    },
    hero: {
      date: '24.01.2027',
      venueTitle: 'White Palace 宴会中心',
      cityCaps: 'WHITE PALACE · 胡志明市',
    },
    formal: {
      saveTheDate: '新婚典礼 • 诚挚邀请',
      title: '新婚喜宴请柬',
      welcome: '诚邀您莅临新婚晚宴，与我们一同庆贺两个孩子喜结良缘',
      timeDayHeader: '17:30 PM · 星期日',
      monthBox: '01月',
      dayNumber: '24日',
      yearBox: '2027年',
      lunarDate: '（农历丙午年腊月十七）',
      venueHostName: 'WHITE PALACE 婚礼宴会厅',
      venueAddress: '胡志明市守德市协平政坊范文同街 588 号 (White Palace)',
      receptionTag: '新婚典礼时间与地点',
      fullDate: '2027年01月24日（星期日）',
      time: '17:30 PM',
      venueName: 'WHITE PALACE 婚礼宴会厅',
      hallName: 'White Palace 宴会中心',
      address: '胡志明市守德市协平政坊范文同街 588 号 (White Palace)',
    },
    countdown: {
      fullDate: '2027年01月24日 星期日 • 17:30 PM',
      ceremonyNote: `新婚喜宴 · ${chineseNames.groom.shortName} ♡ ${chineseNames.bride.shortName}`,
    },
    scratch: {
      revealedCaption: `幸福瞬间 · ${chineseNames.groom.shortName} & ${chineseNames.bride.shortName}`,
    },
    theDay: {
      headingTop: '婚礼',
      headingBottom: '流程',
      intro: '在 White Palace 宴会中心共度温馨难忘的新婚晚宴时光。',
      items: [
        {
          time: '17:30 PM',
          title: '迎宾接待',
          detail: '在 White Palace 宴会厅迎接各位宾客，合影留念并安排入座',
        },
        {
          time: '19:30 PM',
          title: '晚宴开席',
          detail: '新婚晚宴正式开席，与至亲好友举杯共庆美好夜晚',
        },
      ],
    },
    transportation: {
      stamp1: '新婚晚宴',
      stamp2: '24 · 01 · 2027',
      stampNames: `${chineseNames.groom.shortName} & ${chineseNames.bride.shortName}`,
      stamp3: 'WHITE PALACE',
      para2: '新婚晚宴席设于 White Palace 婚礼宴会中心（胡志明市守德市协平政坊范文同街 588 号），现场设有典雅迎宾大厅及宽敞停车位。',
      para3: '诚邀您于2027年1月24日（星期日，农历丙午年腊月十七）17:30 PM 起莅临 White Palace 一同合影留念，晚宴于 19:30 PM 正式开席。',
    },
    gallery: {
      intro: `记录${chineseNames.groom.shortName}与${chineseNames.bride.shortName}充满爱意的美好瞬间。`,
    },
    venue: {
      brideVenueTag: '男方婚礼喜宴举办地点（White Palace 宴会中心）',
      hall: 'White Palace 宴会厅',
      regionCaps: '胡志明市守德市 · 协平政坊范文同街 588 号',
      para1: '席设于高雅璀璨的 White Palace 婚礼宴会中心，温馨灯火与亲友的真挚祝福将伴随我们开启幸福新篇章。',
      para2: '诚邀您于2027年1月24日（星期日）17:30 PM 起莅临 White Palace 宴会厅合影留念，晚宴于 19:30 PM 正式开席。',
      timeDetail: '2027年01月24日（星期日）17:30 PM',
      addressText: 'White Palace — 胡志明市守德市协平政坊范文同街 588 号',
      schedule: [
        '17:30 PM · 在 White Palace 宴会厅迎宾并合影留念',
        '19:30 PM · 晚宴正式开席 · 举杯同庆',
      ],
    },
    rsvp: {
      formSubtitle: '为便于家人周全准备 White Palace 晚宴席位与招待，烦请您于 2027年01月10日 前确认出席。',
    },
  },
};

function mergeSideTranslations(basePack, sideOverride) {
  if (!sideOverride) return basePack;
  const merged = { ...basePack };
  for (const key of Object.keys(sideOverride)) {
    const val = sideOverride[key];
    if (val && typeof val === 'object' && !Array.isArray(val) && basePack[key]) {
      merged[key] = { ...basePack[key], ...val };
    } else {
      merged[key] = val;
    }
  }
  return merged;
}

export const translations = {
  vi: {
    langCode: 'VI',
    htmlLang: 'vi',
    toggleLabel: 'English',
    pageTitle: 'Lễ Vu Quy | Thu Hiền & Đình Huy • 17.01.2027',
    envelope: {
      header: 'THIỆP MỜI LỄ VU QUY',
      subHeader: 'KÍNH BÁO TIN VUI',
      ceremonyHeading: 'LỄ VU QUY',
      salutation: 'Trân Trọng Kính Mời',
      defaultGuest: 'Quý Khách Quý',
      invitation: 'Trân trọng kính mời Quý Khách đến dự tiệc mừng Lễ Vu Quy của chúng mình.',
      tapToOpen: 'Chạm vào con dấu để mở thiệp',
      audioNote: '(Giai điệu tình yêu sẽ tự động ngân vang khi mở thiệp)',
    },
    hero: {
      subtitle: 'Save the Date',
      scroll: 'Cuộn xuống để khám phá',
      date: '17.01.2027',
      venueTitle: 'Tư Gia Nhà Gái',
      cityCaps: 'PHƯỜNG TRẢNG DÀI, THÀNH PHỐ ĐỒNG NAI',
    },
    formal: {
      saveTheDate: 'LỄ VU QUY • TRÂN TRỌNG KÍNH MỜI',
      title: 'THIỆP MỜI LỄ VU QUY',
      welcome: 'Trân trọng kính mời Quý Khách đến dự bữa tiệc thân mật mừng Lễ Vu Quy của hai con chúng tôi',
      brideSide: 'ĐẠI DIỆN NHÀ GÁI',
      brideSideTitle: 'NHÀ GÁI',
      brideFather: 'Ông: Nguyễn Thanh Tâm',
      brideMother: 'Bà: Nguyễn Xuân Mai',
      brideParents: 'Ông Nguyễn Thanh Tâm & Bà Nguyễn Xuân Mai',
      groomSide: 'ĐẠI DIỆN NHÀ TRAI',
      groomSideTitle: 'NHÀ TRAI',
      groomFather: 'Ông: Trần Đình Lý',
      groomMother: 'Bà: Lê Thị Kim Dung',
      groomParents: 'Ông Trần Đình Lý & Bà Lê Thị Kim Dung',
      brideRole: 'Cô Dâu',
      groomRole: 'Chú Rể',
      dob: 'Sinh ngày:',
      sonOf: 'Trưởng nam của:',
      daughterOf: 'Ái nữ của:',
      announcementLine1: 'KÍNH MỜI QUÝ KHÁCH DỰ TIỆC CHUNG\u00A0VUI',
      announcementLine2: 'CỦA GIA ĐÌNH CHÚNG TÔI',
      quoteLine1: 'Tình yêu và sự gắn kết đưa hai trái tim về chung một mái nhà,',
      quoteLine2: 'rất mong sự hiện diện của Quý Khách để cùng sẻ chia khoảnh khắc ý nghĩa này.',
      honorTag: 'TRÂN TRỌNG KÍNH MỜI',
      defaultGuest: 'Quý Khách Quý',
      timeDayHeader: '11:20 AM, CHỦ NHẬT',
      monthBox: 'THÁNG 01',
      dayNumber: '17',
      yearBox: 'NĂM 2027',
      lunarDate: '( Tức ngày 10 tháng 12 năm Bính Ngọ )',
      venueIntro: 'Tổ chức tại',
      venueHostName: 'TƯ GIA NHÀ GÁI',
      venueAddress: '1322/768, Phường Trảng Dài, Thành Phố Đồng Nai',
      directionsBtn: 'CHỈ ĐƯỜNG',
      receptionTag: 'THỜI GIAN & ĐỊA ĐIỂM TỔ CHỨC LỄ VU QUY',
      fullDate: 'Chủ Nhật, ngày 17 tháng 01 năm 2027',
      time: '11:20 AM',
      venueName: 'TƯ GIA NHÀ GÁI',
      hallName: 'Tư Gia Nhà Gái - TP. Đồng Nai',
      address: '1322/768, Phường Trảng Dài, Thành Phố Đồng Nai',
      rsvpBtn: 'Xác Nhận Tham Dự (RSVP)',
      mapsBtn: 'Chỉ Đường Google Maps',
      exploreBtn: 'Khám Phá Hành Trình Tình Yêu',
    },
    intro: {
      tag: 'THƯ NGỎ YÊU THƯƠNG',
      title: 'Hành Trình Yêu Thương',
      quote: '“Hạnh phúc không phải là điểm đến, mà là một hành trình cùng nhau sẻ chia từng khoảnh khắc ngọt ngào lẫn thử thách. Chúng mình trân quý từng ngày tháng đã qua và hân hoan bước vào chương mới của cuộc đời.”',
      subtext: 'Trân trọng kính mời Quý gia đình, người thân và bạn bè đến chung vui trong ngày trọng đại của chúng mình.',
      groomRole: 'Chú Rể',
      brideRole: 'Cô Dâu',
      dobLabel: 'Sinh ngày:',
      sonOf: 'Trưởng nam của:',
      daughterOf: 'Ái nữ của:',
      groomDob: '14/10/1997',
      brideDob: '23/11/1999',
      groomParents: 'Ông Trần Đình Lý & Bà Lê Thị Kim Dung',
      brideParents: 'Ông Nguyễn Thanh Tâm & Bà Nguyễn Xuân Mai',
      groomBio: 'Một chàng trai chân thành, ấm áp và luôn trân trọng từng khoảnh khắc bình yên bên gia đình và người thương.',
      brideBio: 'Cô gái dịu dàng, thông minh và tràn đầy năng lượng tích cực, luôn mang lại nụ cười và sự ấm áp cho mọi người.',
    },
    story: {
      tag: 'CÂU CHUYỆN TÌNH YÊU',
      title: 'Hành Trình Chung Bước',
      milestones: [
        {
          year: '2022',
          title: 'Lần Đầu Gặp Gỡ',
          subtitle: 'Một chiều thu dịu dàng tại góc quán quen',
          description: 'Chúng mình tình cờ gặp nhau tại một buổi workshop nghệ thuật. Ánh nhìn đầu tiên, nụ cười bỡ ngỡ và câu chuyện kéo dài đến khi phố xá đã lên đèn.',
        },
        {
          year: '2023',
          title: 'Hẹn Hò & Gắn Kết',
          subtitle: 'Khi hai trái tim cùng chung nhịp đập',
          description: 'Buổi hẹn hò chính thức đầu tiên với bao bồi hồi rung động. Những lời sẻ chia chân thành về ước mơ và tương lai đã gắn kết hai tâm hồn lại gần nhau hơn.',
        },
        {
          year: '2025',
          title: 'Trưởng Thành Bên Nhau',
          subtitle: 'Vượt qua thử thách và cùng nhau đi khắp nơi',
          description: 'Cùng nhau đi qua nhiều vùng đất mới, học cách thấu hiểu, kiên nhẫn và luôn là điểm tựa bình yên nhất của nhau trong mọi chặng đường.',
        },
        {
          year: '2026',
          title: 'Lời Hứa Trọn Đời',
          subtitle: 'Khoảnh khắc thiêng liêng dưới ánh hoàng hôn',
          description: 'Dưới ánh hoàng hôn rực rỡ, chiếc nhẫn được trao đi cùng lời hẹn ước trăm năm. Giọt nước mắt hạnh phúc và nụ cười rạng ngời: "Em đồng ý!".',
        },
        {
          year: '2027',
          title: 'Ngày Chung Đôi',
          subtitle: 'Khởi đầu cho chương hạnh phúc trăm năm',
          description: 'Ngày 17.01.2027, trong sự chúc phúc của hai bên gia đình và bè bạn, Thu Hiền & Đình Huy chính thức nắm tay nhau bước vào ngưỡng cửa hôn nhân.',
        },
      ],
    },
    countdown: {
      tag: 'CÙNG ĐẾM NGƯỢC KHOẢNH KHẮC ĐÁNG NHỚ',
      heading: 'Đếm Ngược',
      title: 'Cùng Đếm Ngược Khoảnh Khắc Đáng Nhớ',
      subtitle: 'Từng khoảnh khắc trôi qua đưa chúng mình đến gần hơn với giờ phút thiêng liêng nhất',
      seeYouSoon: 'Hẹn sớm gặp bạn!',
      seeYouSoonGuest: 'Hẹn sớm gặp {guest}!',
      days: 'NGÀY',
      hours: 'GIỜ',
      minutes: 'PHÚT',
      seconds: 'GIÂY',
      fullDate: 'Chủ Nhật, 17 Tháng 01, 2027 • 11:20 AM',
      ceremonyNote: 'Lễ Vu Quy • Thu Hiền ♡ Đình Huy',
      celebratingText: 'Hôm nay là ngày trọng đại của chúng mình!',
    },
    scratch: {
      promptLine1: 'Cào nhẹ để',
      promptLine2: 'mở ảnh cưới',
      revealedCaption: 'Khoảnh khắc chung đôi • Thu Hiền & Đình Huy',
      tapFallback: 'Chạm mở nhanh',
    },
    theDay: {
      headingTop: 'Lịch',
      headingBottom: 'Trình',
      intro: 'Một ngày chung vui trọn vẹn, từ phút giây đón khách đến bữa tiệc thân mật.',
      items: [
        {
          time: '10:30 AM',
          title: 'ĐÓN KHÁCH',
          detail: 'Đón tiếp Quý Khách, chụp ảnh lưu niệm và ổn định chỗ ngồi cùng gia đình',
        },
        {
          time: '11:20 AM',
          title: 'LỄ VU QUY',
          detail: 'Cử hành nghi thức Lễ Vu Quy trang trọng trước sự chứng kiến của hai họ và Quý Khách',
        },
        {
          time: '11:45 AM',
          title: 'KHAI TIỆC',
          detail: 'Khai tiệc trưa thân mật, cùng nâng ly chúc phúc và chung vui bên gia đình, bạn bè',
        },
      ],
    },
    transportation: {
      heading: 'Đón Tiếp & Di Chuyển',
      stamp1: 'LỄ VU QUY',
      stamp2: '17 · 01 · 2027',
      stampNames: 'Hiền & Huy',
      stamp3: 'ĐỒNG NAI',
      para1: 'Để hành trình đến chung vui cùng hai gia đình được thuận tiện và thoải mái nhất:',
      para2: 'Lễ Vu Quy được tổ chức tại Tư Gia Nhà Gái — 1322/768, Phường Trảng Dài, Thành Phố Đồng Nai, với khu vực đón tiếp và chỗ đỗ xe rộng rãi cho cả ô tô lẫn xe máy.',
      para3: 'Gia đình kính mời Quý khách thu xếp đến từ 10:30 AM ngày Chủ Nhật 17.01.2027 (tức 10/12 năm Bính Ngọ) để cùng lưu giữ khoảnh khắc đẹp trước khi khai tiệc.',
      pickupBtn: 'XEM VỊ TRÍ ĐÓN TIẾP',
    },
    video: {
      tag: 'THƯỚC PHIM KỶ NIỆM',
      title: 'Khoảnh Khắc Đáng Nhớ',
      captionTitle: 'Từng Khoảnh Khắc Bên Nhau',
      captionText: 'Ghi lại những nụ cười, ánh mắt và hành trình đong đầy yêu thương của Thu Hiền & Đình Huy.',
      expandLabel: 'Xem toàn màn hình ngang',
      collapseLabel: 'Thu nhỏ video',
    },
    gallery: {
      tag: 'KHOẢNH KHẮC NGỌT NGÀO',
      title: 'Album Ảnh Cưới',
      expandBtn: 'Phóng To Ảnh',
      intro: 'Những khoảnh khắc đong đầy yêu thương của Thu Hiền & Đình Huy.',
      carouselLabel: 'Album ảnh cưới 3D',
      closeLabel: 'Đóng xem ảnh',
      prevLabel: 'Ảnh trước',
      nextLabel: 'Ảnh tiếp theo',
      lightboxSwipeHint: 'Vuốt sang trái hoặc phải để chuyển ảnh',
      categories: {
        all: 'Tất Cả',
        'grand-hall': 'Sảnh Hoàng Gia',
        'street-heritage': 'Phố Cổ & Di Sản',
        traditional: 'Lễ Phục Truyền Thống',
        artistic: 'Nghệ Thuật',
        album: 'Sách Album Cưới',
      },
      hintDesktop: '✦ Nhấp ảnh giữa để phóng to · Chọn ảnh hai bên hoặc vuốt để chuyển ảnh ✦',
      hintMobile: '✦ Vuốt sang trái / phải để xem ảnh · Chạm vào ảnh để xem toàn màn hình ✦',
      brideTitle: 'Cô Dâu — Thu Hiền',
      brideCaption: 'Nguyễn Thị Thu Hiền · 23/11/1999',
      groomTitle: 'Chú Rể — Đình Huy',
      groomCaption: 'Trần Lê Đình Huy · 14/10/1997',
    },
    venue: {
      tag: 'ĐỊA ĐIỂM TỔ CHỨC',
      heading: 'Địa Điểm',
      title: 'Nơi Hạnh Phúc Đơm Hoa',
      brideVenueTag: 'Địa điểm tổ chức Lễ Vu Quy (Bên Nhà Gái)',
      hall: 'Tư gia Nhà Gái',
      regionCaps: 'PHƯỜNG TRẢNG DÀI, THÀNH PHỐ ĐỒNG NAI',
      para1: 'Tọa lạc tại không gian ấm cúng của gia đình tại Phường Trảng Dài, Thành Phố Đồng Nai, nơi lưu giữ những nụ cười, tiếng chúc phúc và khoảnh khắc thiêng liêng của ngày Lễ Vu Quy.',
      para2: 'Gia đình kính mời Quý khách đến sớm ít phút để cùng hòa mình vào không khí hân hoan và chụp ảnh lưu niệm trước khi nghi lễ bắt đầu.',
      timeTitle: 'Thời Gian Tổ Chức',
      timeDetail: '11:20 AM, Chủ Nhật — 17.01.2027',
      addressTitle: 'Địa Chỉ Tổ Chức',
      addressText: '1322/768, Phường Trảng Dài, Thành Phố Đồng Nai',
      mapsBtn: 'CHỈ ĐƯỜNG',
      mapLoading: 'Đang tải bản đồ...',
      toggleMapShow: 'Xem bản đồ trực tiếp',
      toggleMapHide: 'Thu gọn bản đồ',
      coordinatesLabel: 'Tọa độ',
      schedule: [
        '10:30 - Đón tiếp Quý Khách & Chụp ảnh lưu niệm',
        '11:20 - Cử hành nghi thức Lễ Vu Quy trang trọng',
        '11:45 - Khai tiệc trưa thân mật cùng hai gia đình',
      ],
    },
    qrcode: {
      notice: 'QUÉT MÃ ĐỂ MỞ THIỆP MỜI',
      title: 'Thiệp Cưới Điện Tử',
      subtext: '“Chia sẻ ngày vui cùng những người thân yêu quý.”',
      copyBtn: 'Sao chép liên kết thiệp',
      copiedToast: 'Đã sao chép liên kết thành công!',
      shareBtn: 'Chia sẻ thiệp cưới',
    },
    rsvp: {
      before: 'Gửi lời chúc & Xác nhận tham dự',
      quote: '“Sự hiện diện và lời chúc phúc của Quý khách là niềm vinh hạnh to lớn cho gia đình chúng mình.”',
      joining: 'BẠN SẼ ĐẾN CHUNG VUI CHỨ?',
      formTitle: 'Xác Nhận Tham Dự',
      formSubtitle: 'Để gia đình chuẩn bị chu đáo nhất, xin Quý khách vui lòng xác nhận trước ngày 05.01.2027.',
      nameLabel: 'Họ và Tên của bạn *',
      namePlaceholder: 'Ví dụ: Nguyễn Văn Nam',
      locationLabel: 'Bạn đến từ đâu? (Tỉnh / Thành phố) *',
      locationPlaceholder: 'Ví dụ: Đồng Nai, TP. Hồ Chí Minh, Hà Nội',
      sideLabel: 'Bạn là khách của ai? *',
      sideBride: 'Nhà Gái (Cô Dâu)',
      sideGroom: 'Nhà Trai (Chú Rể)',
      sideMutual: 'Cả hai (Bạn chung)',
      messageLabel: 'Gửi lời chúc mừng đến cặp đôi',
      messagePlaceholder: 'Gửi lời chúc mừng...',
      submitBtn: 'TÔI SẼ ĐẾN CHUNG VUI',
      confirming: 'Đang gửi xác nhận...',
      validationNameRequired: 'Vui lòng nhập họ và tên của bạn',
      validationNameShort: 'Tên phải có ít nhất 2 ký tự',
      validationNameLong: 'Tên không được vượt quá 80 ký tự',
      validationLocationRequired: 'Vui lòng nhập tỉnh/thành phố bạn đang ở',
      validationLocationShort: 'Địa điểm phải có ít nhất 2 ký tự',
      validationLocationLong: 'Địa điểm không được vượt quá 100 ký tự',
      timeoutError: 'Kết nối quá thời gian chờ. Vui lòng thử lại sau giây lát.',
      networkError: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng và thử lại.',
      serverErrorFallback: 'Có lỗi xảy ra trong quá trình xác nhận. Vui lòng thử lại.',
      successHeading: 'RẤT HÂN HẠNH ĐƯỢC ĐÓN TIẾP BẠN!',
      thankYou: 'Trân trọng cảm ơn,',
      successMsg: '“Cảm ơn bạn đã xác nhận tham dự. Gia đình rất mong chờ được đón tiếp và chung vui cùng bạn trong ngày trọng đại!”',
      guestLabel: 'Khách mời:',
      fromLabel: 'Nơi đến:',
      sideSummary: 'Khách của:',
      messageSummary: 'Lời chúc:',
      statusLabel: 'Tình trạng:',
      statusConfirmed: 'Đã xác nhận tham dự ✓',
      resetBtn: 'Gửi phản hồi mới hoặc đăng ký cho người thân',
    },
    contact: {
      tag: 'LIÊN HỆ & HỖ TRỢ',
      title: 'Thông Tin Liên Lạc',
      subtitle: 'Nếu bạn có bất kỳ câu hỏi nào về đường đi, lịch trình hoặc cần hỗ trợ trong ngày cưới, đừng ngần ngại liên hệ với chúng mình nhé.',
      brideRole: 'CÔ DÂU',
      groomRole: 'CHÚ RỂ',
      brideNote: 'Hỗ trợ đón tiếp người thân, bạn bè & đồng nghiệp phía Cô Dâu',
      groomNote: 'Hỗ trợ đón tiếp người thân, bạn bè & đồng nghiệp phía Chú Rể',
      callBtn: 'Gọi Điện',
      zaloBtn: 'Zalo',
      copyTitle: 'Sao chép số điện thoại',
      copiedBrideToast: '✓ Đã sao chép số điện thoại Cô dâu:',
      copiedGroomToast: '✓ Đã sao chép số điện thoại Chú rể:',
    },
    quickActions: {
      frameAria: 'Khung liên hệ nhanh',
      callBtn: 'Gọi điện',
      directionsBtn: 'Chỉ đường',
      header: 'LIÊN HỆ TRỰC TIẾP',
      closeAria: 'Đóng bảng liên hệ',
      brideLabel: 'Cô Dâu',
      groomLabel: 'Chú Rể',
      callBadge: 'Gọi',
      backToTop: 'Quay lên đầu trang',
      musicPlay: 'Phát nhạc nền',
      musicMute: 'Tắt nhạc nền',
      defaultTrack: 'Nhạc Cưới',
    },
    nav: {
      story: 'CÂU CHUYỆN',
      date: 'NGÀY CƯỚI',
      video: 'THƯỚC PHIM',
      gallery: 'ALBUM ẢNH',
      venue: 'ĐỊA ĐIỂM',
      qr: 'THIỆP QR',
      rsvp: 'XÁC NHẬN',
      reopen: 'Xem lại thiệp cưới',
    },
    footer: {
      line1: 'Cảm ơn Quý khách đã hiện diện và cùng chia sẻ niềm vui trong ngày đặc biệt này.',
      line2: 'Sự hiện diện của Quý khách chính là món quà ý nghĩa nhất dành cho chúng tôi.',
      thankYou: 'Thank you!',
      quote: '“Cảm ơn bạn đã luôn là một phần trân quý trong hành trình hạnh phúc của chúng mình.”',
      tagline: 'Gửi trọn yêu thương cho ngày hạnh phúc trăm năm',
    },
    notFound: {
      title: 'Trang Không Tồn Tại',
      description: 'Trang bạn tìm kiếm không tồn tại hoặc đã được chuyển hướng. Mời bạn trở về trang thiệp cưới chính.',
      backHome: 'Về Trang Thiệp Cưới',
    },
  },

  en: {
    langCode: 'EN',
    htmlLang: 'en',
    toggleLabel: '中文',
    pageTitle: "Bride's Wedding Invitation | Thu Hien & Dinh Huy • 17.01.2027",
    envelope: {
      header: "BRIDE'S WEDDING INVITATION",
      subHeader: 'JOYFULLY ANNOUNCING OUR WEDDING',
      ceremonyHeading: "BRIDE'S WEDDING CEREMONY",
      salutation: 'Cordially Invited',
      defaultGuest: 'Distinguished Guest',
      invitation: "We warmly invite you to our wedding reception, hosted by the bride's family.",
      tapToOpen: 'Tap the seal to open the invitation',
      audioNote: '(Romantic background melody plays automatically upon opening)',
    },
    hero: {
      subtitle: 'Save the Date',
      scroll: 'Scroll to explore',
      date: '17.01.2027',
      venueTitle: "Bride's Family Residence",
      cityCaps: 'TRANG DAI WARD, DONG NAI CITY',
    },
    formal: {
      saveTheDate: "BRIDE'S WEDDING CEREMONY • CORDIALLY INVITED",
      title: "BRIDE'S WEDDING INVITATION",
      welcome: "Our family cordially invites you to an intimate reception celebrating our children's marriage",
      brideSide: "BRIDE'S FAMILY",
      brideSideTitle: "BRIDE'S FAMILY",
      brideFather: 'Mr. Nguyen Thanh Tam',
      brideMother: 'Mrs. Nguyen Xuan Mai',
      brideParents: 'Mr. Nguyen Thanh Tam & Mrs. Nguyen Xuan Mai',
      groomSide: "GROOM'S FAMILY",
      groomSideTitle: "GROOM'S FAMILY",
      groomFather: 'Mr. Tran Dinh Ly',
      groomMother: 'Mrs. Le Thi Kim Dung',
      groomParents: 'Mr. Tran Dinh Ly & Mrs. Le Thi Kim Dung',
      brideRole: 'The Bride',
      groomRole: 'The Groom',
      dob: 'Born on:',
      sonOf: 'Eldest son of:',
      daughterOf: 'Daughter of:',
      announcementLine1: 'YOU ARE CORDIALLY INVITED TO',
      announcementLine2: "OUR FAMILY'S WEDDING RECEPTION",
      quoteLine1: 'Love and devotion bring two hearts together under one roof,',
      quoteLine2: 'we warmly hope for your presence to share this meaningful moment with our family.',
      honorTag: 'CORDIALLY INVITED',
      defaultGuest: 'Distinguished Guest',
      timeDayHeader: '11:20 AM, SUNDAY',
      monthBox: 'JANUARY',
      dayNumber: '17',
      yearBox: '2027',
      lunarDate: '( 10th Day of the 12th Lunar Month, Year of the Fire Horse )',
      venueIntro: 'Held at',
      venueHostName: "BRIDE'S FAMILY RESIDENCE",
      venueAddress: '1322/768, Trang Dai Ward, Dong Nai City, Vietnam',
      directionsBtn: 'GET DIRECTIONS',
      receptionTag: "BRIDE'S WEDDING CEREMONY • TIME & VENUE",
      fullDate: 'Sunday, January 17, 2027',
      time: '11:20 AM',
      venueName: "BRIDE'S FAMILY RESIDENCE",
      hallName: "Bride's Family Residence • Dong Nai City",
      address: '1322/768, Trang Dai Ward, Dong Nai City',
      rsvpBtn: 'Confirm Attendance',
      mapsBtn: 'Get Google Maps Directions',
      exploreBtn: 'Explore Love Journey',
    },
    intro: {
      tag: 'OUR WEDDING INVITATION',
      title: 'A Journey of Love',
      quote: '“Happiness is not a destination but a journey of sharing sweet moments and facing challenges together. We cherish the days that have brought us here and are delighted to begin a new chapter in our lives.”',
      subtext: 'We warmly invite our families, relatives, and friends to celebrate this special day with us.',
      groomRole: 'The Groom',
      brideRole: 'The Bride',
      dobLabel: 'Born on:',
      sonOf: 'Eldest son of:',
      daughterOf: 'Daughter of:',
      groomDob: '14/10/1997',
      brideDob: '23/11/1999',
      groomParents: 'Mr. Tran Dinh Ly & Mrs. Le Thi Kim Dung',
      brideParents: 'Mr. Nguyen Thanh Tam & Mrs. Nguyen Xuan Mai',
      groomBio: 'Sincere and warmhearted, he cherishes peaceful moments with family and loved ones.',
      brideBio: 'Gentle, intelligent, and full of positive energy, she brings smiles and warmth to everyone around her.',
    },
    story: {
      tag: 'OUR LOVE STORY',
      title: 'Our Journey Together',
      milestones: [
        {
          year: '2022',
          title: 'When We First Met',
          subtitle: 'A gentle autumn afternoon at a familiar café',
          description: 'We met by chance at an art workshop. There were first glances, shy smiles, and a conversation that lasted until the city lights came on.',
        },
        {
          year: '2023',
          title: 'Falling In Love',
          subtitle: 'When two hearts harmonized into one melody',
          description: 'Our first official date filled with excitement. Sincere conversations about dreams and our future drew our souls closer than ever.',
        },
        {
          year: '2025',
          title: 'Growing Together',
          subtitle: 'Facing challenges and exploring new places together',
          description: 'Traveling hand in hand across new places, learning empathy and patience, and becoming each other’s most peaceful sanctuary.',
        },
        {
          year: '2026',
          title: 'A Lifelong Promise',
          subtitle: 'A sacred moment beneath a golden sunset',
          description: 'Under a glowing sunset, a ring was offered with a lifelong promise. Then came tears of joy, a radiant smile, and a heartfelt “Yes!”',
        },
        {
          year: '2027',
          title: 'Our Wedding Day',
          subtitle: 'The beginning of our lifelong chapter together',
          description: 'On January 17, 2027, surrounded by the blessings of our beloved families and friends, Thu Hien & Dinh Huy step hand in hand into marriage.',
        },
      ],
    },
    countdown: {
      tag: 'COUNTING DOWN TO OUR MEMORABLE MOMENT',
      heading: 'Countdown',
      title: 'Counting Down to Our Memorable Moment',
      subtitle: 'Every passing second brings us closer to the most sacred moment of our lives',
      seeYouSoon: 'See you soon!',
      seeYouSoonGuest: 'See you soon, {guest}!',
      days: 'DAYS',
      hours: 'HOURS',
      minutes: 'MINUTES',
      seconds: 'SECONDS',
      fullDate: 'Sunday, January 17, 2027 • 11:20 AM',
      ceremonyNote: "Bride's Wedding Ceremony • Thu Hien ♡ Dinh Huy",
      celebratingText: 'Today we celebrate our wedding day!',
    },
    scratch: {
      promptLine1: 'Scratch',
      promptLine2: 'to reveal',
      revealedCaption: 'Cherished Moments • Thu Hien & Dinh Huy',
      tapFallback: 'Tap to reveal',
    },
    theDay: {
      headingTop: 'The',
      headingBottom: 'Day',
      intro: 'A day to celebrate together, from welcoming our guests to sharing an intimate lunch.',
      items: [
        { time: '10:30 AM', title: 'WELCOME', detail: 'Warm welcome, guest seating & commemorative photos with our family' },
        { time: '11:20 AM', title: "BRIDE'S WEDDING CEREMONY", detail: 'We will hold the wedding ceremony in the presence of both families and our guests.' },
        { time: '11:45 AM', title: 'WEDDING LUNCH', detail: 'An intimate lunch begins with toasts and celebration among family and friends.' },
      ],
    },
    transportation: {
      heading: 'Travel & Guest Welcome',
      stamp1: "BRIDE'S WEDDING CEREMONY",
      stamp2: '17 · 01 · 2027',
      stampNames: 'Hien & Huy',
      stamp3: 'DONG NAI',
      para1: 'We want getting to and from the celebration to be as easy and pleasant as possible.',
      para2: "The ceremony takes place at the bride's family residence, 1322/768, Trang Dai Ward, Dong Nai City. There is a reception area and ample parking for cars and motorbikes.",
      para3: 'Our family welcomes you from 10:30 AM on Sunday, January 17, 2027 (the 10th day of the 12th lunar month, Year of the Fire Horse) to take photos together before lunch begins.',
      pickupBtn: 'VIEW ARRIVAL LOCATION',
    },
    video: {
      tag: 'CINEMATIC HIGHLIGHTS',
      title: 'Cherished Moments',
      captionTitle: 'Moments Held In Time',
      captionText: 'Capturing the radiant smiles, loving glances, and unforgettable journey of Thu Hien & Dinh Huy.',
      expandLabel: 'Watch in landscape fullscreen',
      collapseLabel: 'Exit fullscreen',
    },
    gallery: {
      tag: 'SWEET MEMORIES',
      title: 'Wedding Photo Album',
      expandBtn: 'Expand Photo',
      intro: 'Cherished moments of Thu Hien & Dinh Huy.',
      carouselLabel: '3D Wedding Photo Slideshow',
      closeLabel: 'Close photo viewer',
      prevLabel: 'Previous photo',
      nextLabel: 'Next photo',
      lightboxSwipeHint: 'Swipe left or right to browse photos',
      categories: {
        all: 'All Photos',
        'grand-hall': 'Royal Hall',
        'street-heritage': 'Heritage & Street',
        traditional: 'Traditional Ao Dai',
        artistic: 'Artistic Portraits',
        album: 'Photobook Spreads',
      },
      hintDesktop: '✦ Click center photo to view fullscreen · Select side cards or swipe to explore ✦',
      hintMobile: '✦ Swipe left / right to browse photos · Tap photo for fullscreen ✦',
      brideTitle: 'The Bride — Thu Hien',
      brideCaption: 'Nguyen Thi Thu Hien · 23/11/1999',
      groomTitle: 'The Groom — Dinh Huy',
      groomCaption: 'Tran Le Dinh Huy · 14/10/1997',
    },
    venue: {
      tag: 'WEDDING VENUE',
      heading: 'Location',
      title: 'Where Love Blooms',
      brideVenueTag: "Bride's Family Wedding Ceremony Venue",
      hall: "Bride's Family Residence",
      regionCaps: 'TRANG DAI WARD, DONG NAI CITY',
      para1: "Set in the warm embrace of the Bride's family home in Trang Dai Ward, Dong Nai City, surrounded by loving family and heartfelt blessings for our celebration.",
      para2: 'Our family welcomes you to arrive a little early, take photos with us, and enjoy the welcome before the ceremony begins.',
      timeTitle: 'Date & Time',
      timeDetail: '11:20 AM, Sunday — January 17, 2027',
      addressTitle: 'Venue Address',
      addressText: '1322/768, Trang Dai Ward, Dong Nai City, Vietnam',
      mapsBtn: 'GET DIRECTIONS',
      mapLoading: 'Loading map...',
      toggleMapShow: 'Show interactive map',
      toggleMapHide: 'Hide map',
      coordinatesLabel: 'Coordinates',
      schedule: [
        '10:30 AM - Welcome Guests & Commemorative Photos',
        "11:20 AM - Bride's Wedding Ceremony",
        '11:45 AM - Intimate Wedding Lunch with Both Families',
      ],
    },
    qrcode: {
      notice: 'SCAN TO OPEN INVITATION',
      title: 'Digital Wedding Card',
      subtext: '“Share our special day with someone you love.”',
      copyBtn: 'Copy Invitation Link',
      copiedToast: 'Link copied to clipboard!',
      shareBtn: 'Share Invitation',
    },
    rsvp: {
      before: 'Send Wishes & Confirm Attendance',
      quote: '“Your presence and heartfelt blessings are the greatest honor for our families.”',
      joining: 'WILL YOU BE JOINING US?',
      formTitle: 'Confirm Attendance',
      formSubtitle: 'Please confirm your attendance before January 5, 2027, so our family can prepare for your visit.',
      nameLabel: 'Your Full Name *',
      namePlaceholder: 'e.g. Emily Johnson / Nguyen Van Nam',
      locationLabel: 'Where are you coming from? (Province / City) *',
      locationPlaceholder: 'e.g. Dong Nai, Ho Chi Minh City, Hanoi',
      sideLabel: 'Whose guest are you? *',
      sideBride: "Bride's Side",
      sideGroom: "Groom's Side",
      sideMutual: 'Both / Mutual Friends',
      messageLabel: 'Wedding Wish / Message for the Couple',
      messagePlaceholder: 'Write your wedding wishes here...',
      submitBtn: "YES, I'LL BE THERE",
      confirming: 'Submitting confirmation...',
      validationNameRequired: 'Please enter your full name',
      validationNameShort: 'Name must be at least 2 characters',
      validationNameLong: 'Name cannot exceed 80 characters',
      validationLocationRequired: 'Please enter your city or location',
      validationLocationShort: 'Location must be at least 2 characters',
      validationLocationLong: 'Location cannot exceed 100 characters',
      timeoutError: 'Request timed out. Please try again in a moment.',
      networkError: 'Unable to reach the server. Please check your connection and try again.',
      serverErrorFallback: 'Something went wrong. Please try again.',
      successHeading: "WE'RE HONORED TO WELCOME YOU!",
      thankYou: 'Warmest thanks,',
      successMsg: '“Thank you for confirming your attendance. Our family looks forward to celebrating this joyful day with you!”',
      guestLabel: 'Guest:',
      fromLabel: 'From:',
      sideSummary: 'Guest of:',
      messageSummary: 'Wish:',
      statusLabel: 'Status:',
      statusConfirmed: 'Attendance Confirmed ✓',
      resetBtn: 'Send another RSVP or register for a family member',
    },
    contact: {
      tag: 'CONTACT & ASSISTANCE',
      title: 'Get In Touch',
      subtitle: 'If you have any questions regarding directions, schedule, or wedding details, please feel free to reach out to us anytime.',
      brideRole: 'THE BRIDE',
      groomRole: 'THE GROOM',
      brideNote: 'Assistance & reception for family, friends & colleagues of the Bride',
      groomNote: 'Assistance & reception for family, friends & colleagues of the Groom',
      callBtn: 'Call',
      zaloBtn: 'Zalo',
      copyTitle: 'Copy phone number',
      copiedBrideToast: "✓ Copied Bride's phone number:",
      copiedGroomToast: "✓ Copied Groom's phone number:",
    },
    quickActions: {
      frameAria: 'Quick contact actions',
      callBtn: 'Call',
      directionsBtn: 'Directions',
      header: 'DIRECT CONTACT',
      closeAria: 'Close contact menu',
      brideLabel: 'Bride',
      groomLabel: 'Groom',
      callBadge: 'Call',
      backToTop: 'Back to top',
      musicPlay: 'Play background music',
      musicMute: 'Mute background music',
      defaultTrack: 'Wedding Melody',
    },
    nav: {
      story: 'OUR STORY',
      date: 'DATE',
      video: 'MEMORIES',
      gallery: 'GALLERY',
      venue: 'VENUE & MAP',
      qr: 'QR INVITATION',
      rsvp: 'CONFIRMATION',
      reopen: 'Reopen Sealed Envelope',
    },
    footer: {
      line1: 'Thank you for your presence and for sharing the joy with us on this special day.',
      line2: 'Your presence is truly the most meaningful gift to us.',
      thankYou: 'Thank you!',
      quote: '“Thank you for being such a cherished part of our journey toward lifelong happiness.”',
      tagline: 'With All Our Love • Dedicated to our special wedding day',
    },
    notFound: {
      title: 'Page Not Found',
      description: 'The page you are looking for does not exist or has been moved. Please return to the main wedding invitation.',
      backHome: 'Back to Wedding Invitation',
    },
  },

  zh: {
    langCode: '中文',
    htmlLang: 'zh-CN',
    toggleLabel: '越南语',
    pageTitle: `女方婚礼请柬｜${chineseNames.bride.shortName}与${chineseNames.groom.shortName} · 2027.01.17`,
    envelope: {
      header: '女方婚礼请柬',
      subHeader: '喜结良缘 • 诚挚邀请',
      ceremonyHeading: '女方婚礼仪式',
      salutation: '诚挚邀请',
      defaultGuest: '尊贵的宾客',
      invitation: '谨以满怀喜悦之心，诚邀您拨冗莅临参加女方婚礼仪式暨喜宴，共证幸福时刻。',
      tapToOpen: '轻触火漆印开启请柬',
      audioNote: '（开启请柬后将自动播放浪漫婚礼音乐）',
    },
    hero: {
      subtitle: 'Save the Date',
      scroll: '向下滑动探索',
      date: '17.01.2027',
      venueTitle: '女方府邸',
      cityCaps: '越南同奈市 · 长台坊',
    },
    formal: {
      saveTheDate: '女方婚礼仪式 • 诚挚邀请',
      title: '女方婚礼请柬',
      welcome: '诚邀您莅临女方家中参加喜宴，与我们一同庆贺两个孩子喜结良缘',
      brideSide: '女方家长',
      brideSideTitle: '女方家长',
      brideFather: `父：${chineseNames.bride.father}`,
      brideMother: `母：${chineseNames.bride.mother}`,
      brideParents: `${chineseNames.bride.father}先生与${chineseNames.bride.mother}女士`,
      groomSide: '男方家长',
      groomSideTitle: '男方家长',
      groomFather: `父：${chineseNames.groom.father}`,
      groomMother: `母：${chineseNames.groom.mother}`,
      groomParents: `${chineseNames.groom.father}先生与${chineseNames.groom.mother}女士`,
      brideRole: '新娘',
      groomRole: '新郎',
      dob: '出生日期：',
      sonOf: '长子：',
      daughterOf: '爱女：',
      announcementLine1: '诚邀各位宾客莅临',
      announcementLine2: '与我们全家共享婚礼喜悦',
      quoteLine1: '爱与缘分让两颗心携手同心、共筑温馨家园，',
      quoteLine2: '我们全家诚挚期盼您的莅临，共同分享这份珍贵而美好的喜悦。',
      honorTag: '诚挚敬邀',
      defaultGuest: '尊贵的宾客',
      timeDayHeader: '上午 11:20 · 星期日',
      monthBox: '01月',
      dayNumber: '17日',
      yearBox: '2027年',
      lunarDate: '（农历丙午年腊月初十）',
      venueIntro: '席设于',
      venueHostName: '女方府邸',
      venueAddress: '越南同奈市长台坊 1322/768 号',
      directionsBtn: '地图导航',
      receptionTag: '女方婚礼仪式时间与地点',
      fullDate: '2027年01月17日（星期日）',
      time: '上午 11:20',
      venueName: '女方府邸',
      hallName: '女方府邸 · 同奈市',
      address: '越南同奈市长台坊 1322/768 号',
      rsvpBtn: '宾客出席回执',
      mapsBtn: 'Google 地图导航',
      exploreBtn: '探索爱情故事',
    },
    intro: {
      tag: '爱的邀请函',
      title: '携手同行之旅',
      quote: '“幸福不是终点，而是彼此陪伴、分享甜蜜并携手面对挑战的旅程。我们珍惜一路走过的每一天，满怀喜悦迈入人生的新篇章。”',
      subtext: '诚挚邀请亲朋好友莅临见证我们的重要时刻，共享喜悦与幸福。',
      groomRole: '新郎',
      brideRole: '新娘',
      dobLabel: '生日：',
      sonOf: '新郎是以下二位的长子：',
      daughterOf: '新娘是以下二位的爱女：',
      groomDob: '1997/10/14',
      brideDob: '1999/11/23',
      groomParents: `${chineseNames.groom.father}先生与${chineseNames.groom.mother}女士`,
      brideParents: `${chineseNames.bride.father}先生与${chineseNames.bride.mother}女士`,
      groomBio: '真诚温暖、体贴稳重，珍视与家人及挚爱共度的每一刻平静时光。',
      brideBio: '温柔聪慧、充满阳光与正能量，总能为身边的人带来温暖的笑容。',
    },
    story: {
      tag: '我们的爱情故事',
      title: '相知相守的足迹',
      milestones: [
        {
          year: '2022',
          title: '初次相遇',
          subtitle: '一个温柔的秋日下午，在熟悉的小店一角',
          description: '在一场艺术工作坊中不期而遇。初见的目光、羞涩的微笑，让畅谈一直延续到华灯初上。',
        },
        {
          year: '2023',
          title: '相恋相惜',
          subtitle: '两颗心同频共振的美好时刻',
          description: '第一次正式约会满载心动与欢喜。关于梦想与未来的真诚倾诉，让彼此的心紧紧相连。',
        },
        {
          year: '2025',
          title: '携手成长',
          subtitle: '并肩走过风雨，看遍世间风景',
          description: '一起走过许多崭新的地方，学会理解、包容与耐心，成为彼此最安心的港湾。',
        },
        {
          year: '2026',
          title: '一生承诺',
          subtitle: '夕阳余晖下的浪漫求婚',
          description: '在璀璨的晚霞下，戒指与相守一生的诺言一同献上，幸福的泪光化作最甜美的一句：“我愿意！”',
        },
        {
          year: '2027',
          title: '喜结连理',
          subtitle: '开启百年好合的幸福新篇',
          description: `2027年01月17日，在双方家人与挚友的祝福声中，${chineseNames.bride.shortName}与${chineseNames.groom.shortName}正式携手步入婚姻殿堂。`,
        },
      ],
    },
    countdown: {
      tag: '共同倒计时 • 见证难忘时刻',
      heading: '婚礼倒计时',
      title: '共同倒计时 • 见证难忘时刻',
      subtitle: '每一秒的流转，都让我们离人生中最神圣幸福的时刻更近一步',
      seeYouSoon: '期待与您相见！',
      seeYouSoonGuest: '期待与 {guest} 相见！',
      days: '天',
      hours: '时',
      minutes: '分',
      seconds: '秒',
      fullDate: '2027年01月17日 星期日 • 上午 11:20',
      ceremonyNote: `女方婚礼仪式 · ${chineseNames.bride.shortName} ♡ ${chineseNames.groom.shortName}`,
      celebratingText: '今天是我们喜结良缘的大喜之日！',
    },
    scratch: {
      promptLine1: '轻刮开启',
      promptLine2: '新人合影',
      revealedCaption: `幸福瞬间 · ${chineseNames.bride.shortName} & ${chineseNames.groom.shortName}`,
      tapFallback: '轻触直接揭晓',
    },
    theDay: {
      headingTop: '婚礼',
      headingBottom: '流程',
      intro: '良辰美景，从迎宾初见到举杯同庆的每一个珍贵时刻。',
      items: [
        { time: '上午 10:30', title: '迎宾接待', detail: '欢迎各位宾客到场，合影留念并与家人一同入座' },
        { time: '上午 11:20', title: '女方婚礼仪式', detail: '在双方亲友与宾客的见证下，举行庄重温馨的女方婚礼仪式' },
        { time: '上午 11:45', title: '喜宴开席', detail: '午间喜宴正式开席，与至亲好友举杯同庆美好佳期' },
      ],
    },
    transportation: {
      heading: '交通与接待',
      stamp1: '女方婚礼仪式',
      stamp2: '17 · 01 · 2027',
      stampNames: `${chineseNames.bride.shortName} & ${chineseNames.groom.shortName}`,
      stamp3: '同奈市',
      para1: '为了让您往返喜宴的旅程更加轻松顺畅：',
      para2: '女方婚礼仪式在女方府邸举行，地址为越南同奈市长台坊1322/768号。现场设有迎宾区，并有宽敞的停车区，可停放汽车和摩托车。',
      para3: '家人诚邀您于2027年1月17日（星期日，农历丙午年腊月初十）上午10:30起莅临，在喜宴开席前一同合影留念。',
      pickupBtn: '查看地图位置',
    },
    video: {
      tag: '纪念影像',
      title: '珍藏幸福瞬间',
      captionTitle: '相伴的美好时光',
      captionText: `定格${chineseNames.bride.shortName}与${chineseNames.groom.shortName}充满爱意的笑容、深情目光与浪漫旅程。`,
      expandLabel: '横屏全屏播放',
      collapseLabel: '退出全屏',
    },
    gallery: {
      tag: '甜蜜掠影',
      title: '婚纱纪念相册',
      expandBtn: '全屏查看',
      intro: `记录${chineseNames.bride.shortName}与${chineseNames.groom.shortName}充满爱意的美好瞬间。`,
      carouselLabel: '3D 婚纱照片轮播',
      closeLabel: '关闭图片预览',
      prevLabel: '上一张照片',
      nextLabel: '下一张照片',
      lightboxSwipeHint: '左右滑动切换照片',
      categories: {
        all: '全部照片',
        'grand-hall': '古典殿堂',
        'street-heritage': '古街与文化遗产',
        traditional: '越南传统奥黛',
        artistic: '艺术写真',
        album: '精装相册页',
      },
      hintDesktop: '✦ 点击中间照片全屏欣赏 · 点击两侧照片或滑动切换 ✦',
      hintMobile: '✦ 左右滑动浏览照片 · 轻触照片全屏欣赏 ✦',
      brideTitle: `新娘 · ${chineseNames.bride.shortName}`,
      brideCaption: `${chineseNames.bride.name} · 1999/11/23`,
      groomTitle: `新郎 · ${chineseNames.groom.shortName}`,
      groomCaption: `${chineseNames.groom.name} · 1997/10/14`,
    },
    venue: {
      tag: '喜宴地点',
      heading: '喜宴地点',
      title: '幸福绽放之地',
      brideVenueTag: '女方婚礼仪式举办地点（女方府邸）',
      hall: '女方府邸',
      regionCaps: '越南同奈市 · 长台坊',
      para1: '席设于同奈市长台坊温馨典雅的女方府邸，鲜花与亲友的真挚祝福将伴随我们开启幸福新篇章。',
      para2: '家人诚邀您稍早抵达，在仪式开始前一同合影留念，共享喜悦。',
      timeTitle: '举办时间',
      timeDetail: '2027年01月17日（星期日）上午 11:20',
      addressTitle: '喜宴地址',
      addressText: '越南同奈市长台坊 1322/768 号',
      mapsBtn: '地图导航',
      mapLoading: '正在加载地图...',
      toggleMapShow: '查看互动地图',
      toggleMapHide: '收起地图',
      coordinatesLabel: '坐标',
      schedule: [
        '上午 10:30 · 迎宾接待及合影留念',
        '上午 11:20 - 举行女方婚礼仪式',
        '上午 11:45 · 与双方家人共进婚宴午餐',
      ],
    },
    qrcode: {
      notice: '扫码开启电子请柬',
      title: '电子婚礼请柬',
      subtext: '“与挚爱亲朋分享我们的喜悦时刻。”',
      copyBtn: '复制请柬链接',
      copiedToast: '已成功复制链接！',
      shareBtn: '分享婚礼请柬',
    },
    rsvp: {
      before: '送上祝福 & 出席确认',
      quote: '“您的莅临与诚挚祝福，是我们全家人莫大的荣幸与喜悦。”',
      joining: '诚盼您的光临！',
      formTitle: '出席回执确认',
      formSubtitle: '为便于家人周全准备席位与招待，烦请您于 2027年01月05日 前确认出席。',
      nameLabel: '您的姓名 *',
      namePlaceholder: '例如：王伟、李明',
      locationLabel: '您来自哪里？（省／市）*',
      locationPlaceholder: '例如：胡志明市、同奈、上海、深圳、台北',
      sideLabel: '您是哪一方的宾客？*',
      sideBride: '女方亲友（新娘方）',
      sideGroom: '男方亲友（新郎方）',
      sideMutual: '双方共同好友',
      messageLabel: '送给新人的祝福寄语',
      messagePlaceholder: '请写下您送给新人的新婚祝福…',
      submitBtn: '确认出席喜宴',
      confirming: '正在提交回执...',
      validationNameRequired: '请输入您的姓名',
      validationNameShort: '姓名至少需要 2 个字符',
      validationNameLong: '姓名不能超过 80 个字符',
      validationLocationRequired: '请输入您所在的省或市',
      validationLocationShort: '地区至少需要 2 个字符',
      validationLocationLong: '地区不能超过 100 个字符',
      timeoutError: '连接超时，请稍后再试。',
      networkError: '无法连接服务器，请检查网络后重试。',
      serverErrorFallback: '提交过程中发生错误，请稍后重试。',
      successHeading: '衷心期待您的莅临！',
      thankYou: '诚挚感谢，',
      successMsg: '“感谢您确认出席！我们与家人满怀喜悦，期待在婚礼当天欢迎您的到来！”',
      guestLabel: '尊贵宾客：',
      fromLabel: '来自：',
      sideSummary: '所属亲友：',
      messageSummary: '祝福语：',
      statusLabel: '回执状态：',
      statusConfirmed: '已确认出席 ✓',
      resetBtn: '提交新的回执或为亲友登记',
    },
    contact: {
      tag: '联系与协助',
      title: '联系方式',
      subtitle: '如您对路线导航、婚礼流程或当天接待有任何疑问，欢迎随时与我们联系。',
      brideRole: '新娘',
      groomRole: '新郎',
      brideNote: '为女方的家人、朋友和同事提供接待及协助',
      groomNote: '为男方的家人、朋友和同事提供接待及协助',
      callBtn: '拨打电话',
      zaloBtn: 'Zalo',
      copyTitle: '复制电话号码',
      copiedBrideToast: '✓ 已复制新娘电话号码：',
      copiedGroomToast: '✓ 已复制新郎电话号码：',
    },
    quickActions: {
      frameAria: '快捷联系栏',
      callBtn: '电话联系',
      directionsBtn: '地图导航',
      header: '直接联系新人',
      closeAria: '关闭联系窗口',
      brideLabel: '新娘',
      groomLabel: '新郎',
      callBadge: '拨打',
      backToTop: '返回顶部',
      musicPlay: '播放背景音乐',
      musicMute: '静音背景音乐',
      defaultTrack: '婚礼配乐',
    },
    nav: {
      story: '爱情故事',
      date: '良辰吉日',
      video: '纪念影像',
      gallery: '婚纱相册',
      venue: '喜宴地点',
      qr: '二维码请柬',
      rsvp: '出席回执',
      reopen: '重新查看请柬封面',
    },
    footer: {
      line1: '感谢您的莅临，与我们共同分享这特别之日的喜悦。',
      line2: '您的到来，便是赐予我们最珍贵、最有意义的礼物。',
      thankYou: 'Thank you!',
      quote: '“感谢您成为我们迈向幸福婚姻旅途中珍贵而温暖的一部分。”',
      tagline: '执子之手，与子偕老',
    },
    notFound: {
      title: '页面不存在',
      description: '您访问的页面不存在或已被移动，请返回主婚礼请柬页面。',
      backHome: '返回婚礼请柬',
    },
  },
};

export function LanguageProvider({ children }) {
  const location = useLocation();
  const { settings: cms } = useCmsStore();
  const [language, setLanguageState] = useState(() => resolveUrlLanguage(location.search));
  const side = resolveInvitationSide(location.pathname, location.search);
  const isGroomSide = side === 'groom';

  const eventConfig = React.useMemo(() => {
    const base = isGroomSide ? groomEventConfig : weddingConfig.event;
    const sideCfg = isGroomSide ? cms?.groom : cms?.bride;
    if (!sideCfg) return base;
    return {
      ...base,
      isoDate: sideCfg.isoDate || base.isoDate,
      dateDisplay: sideCfg.dateShort ? sideCfg.dateShort.replace(/\./g, ' · ') : base.dateDisplay,
    };
  }, [isGroomSide, cms]);

  const venueConfig = React.useMemo(() => {
    const base = isGroomSide ? groomVenueConfig : weddingConfig.venue;
    const sideCfg = isGroomSide ? cms?.groom : cms?.bride;
    if (!sideCfg) return base;
    return {
      ...base,
      name: sideCfg.venueHostName || base.name,
      hall: sideCfg.venueHall || base.hall,
      address: sideCfg.address || base.address,
      googleMapsUrl: sideCfg.googleMapsUrl || base.googleMapsUrl,
      embedMapUrl: sideCfg.embedMapUrl || base.embedMapUrl,
    };
  }, [isGroomSide, cms]);

  // Automatically sync language whenever URL search query changes (?lang=en | zh | vi)
  useEffect(() => {
    const urlLang = resolveUrlLanguage(location.search);
    setLanguageState(urlLang);
  }, [location.search]);

  const basePack = translations[language] || translations.vi;
  const t = React.useMemo(() => {
    const sideMerged = isGroomSide
      ? mergeSideTranslations(basePack, groomTranslations[language] || groomTranslations.vi)
      : basePack;

    const sharedLang = cms?.shared?.[language];
    const sideData = isGroomSide ? cms?.groom : cms?.bride;
    const brideData = cms?.bride;
    const groomData = cms?.groom;

    const next = {
      ...sideMerged,
      hero: { ...sideMerged.hero },
      formal: { ...sideMerged.formal },
      countdown: { ...sideMerged.countdown },
      theDay: { ...sideMerged.theDay },
      venue: { ...sideMerged.venue },
      rsvp: { ...sideMerged.rsvp },
      footer: { ...sideMerged.footer },
      envelope: { ...sideMerged.envelope },
    };

    // Apply shared CMS overrides (applies to both Bride & Groom cards in the selected language)
    if (sharedLang) {
      if (sharedLang.announcementLine1) next.formal.announcementLine1 = sharedLang.announcementLine1;
      if (sharedLang.announcementLine2) next.formal.announcementLine2 = sharedLang.announcementLine2;
      if (sharedLang.quoteLine1) next.formal.quoteLine1 = sharedLang.quoteLine1;
      if (sharedLang.quoteLine2) next.formal.quoteLine2 = sharedLang.quoteLine2;
      if (sharedLang.countdownScript) next.countdown.seeYouSoon = sharedLang.countdownScript;
      if (sharedLang.rsvpQuote) next.rsvp.quote = sharedLang.rsvpQuote;
      if (sharedLang.footerLine1) next.footer.line1 = sharedLang.footerLine1;
      if (sharedLang.footerLine2) next.footer.line2 = sharedLang.footerLine2;
      if (sharedLang.footerThankYou) next.footer.thankYou = sharedLang.footerThankYou;
    }

    // Apply universal date across VI/EN/ZH
    if (sideData?.dateShort) {
      next.hero.date = sideData.dateShort;
    }

    // Apply language-specific Bride & Groom CMS overrides across VI, EN, and ZH
    const brideLoc = language === 'vi' ? brideData : brideData?.i18n?.[language];
    const groomLoc = language === 'vi' ? groomData : groomData?.i18n?.[language];
    const sideLoc = isGroomSide ? groomLoc : brideLoc;

    if (brideLoc?.father) next.formal.brideFather = brideLoc.father;
    if (brideLoc?.mother) next.formal.brideMother = brideLoc.mother;
    if (groomLoc?.father) next.formal.groomFather = groomLoc.father;
    if (groomLoc?.mother) next.formal.groomMother = groomLoc.mother;

    if (sideLoc) {
      if (sideLoc.ceremonyTitle) next.envelope.ceremonyHeading = sideLoc.ceremonyTitle;
      if (sideLoc.cardTitle) {
        next.envelope.header = sideLoc.cardTitle;
        next.formal.title = sideLoc.cardTitle;
      }
      if (sideLoc.timeDayHeader) next.formal.timeDayHeader = sideLoc.timeDayHeader;
      if (sideLoc.monthBox) next.formal.monthBox = sideLoc.monthBox;
      if (sideLoc.dayNumber) next.formal.dayNumber = sideLoc.dayNumber;
      if (sideLoc.yearBox) next.formal.yearBox = sideLoc.yearBox;
      if (sideLoc.lunarDate) next.formal.lunarDate = sideLoc.lunarDate;
      if (sideLoc.venueHostName) next.formal.venueHostName = sideLoc.venueHostName;
      if (sideLoc.address) {
        next.formal.venueAddress = sideLoc.address;
        next.formal.address = sideLoc.address;
        next.venue.addressText = sideLoc.address;
      }
      if (sideLoc.venueHall) {
        next.hero.venueTitle = sideLoc.venueHall;
        next.venue.hall = sideLoc.venueHall;
      }
      if (sideLoc.regionCaps) next.venue.regionCaps = sideLoc.regionCaps;
      if (sideLoc.venueIntro) next.venue.para1 = sideLoc.venueIntro;
      if (sideLoc.rsvpSubtitle) next.rsvp.formSubtitle = sideLoc.rsvpSubtitle;
      if (Array.isArray(sideLoc.scheduleItems) && sideLoc.scheduleItems.length > 0) {
        next.theDay.items = sideLoc.scheduleItems;
      }
    }

    return next;
  }, [basePack, isGroomSide, language, cms]);

  // Keep <html lang="...">, document.title, and Open Graph meta tags synced with active side & language
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = t.htmlLang || language;
      if (document.getElementById('invitation-not-found')) {
        document.title = `404 — ${t.notFound.title}`;
        return;
      }
      if (!location.pathname.includes('admin')) {
        if (t.pageTitle) {
          document.title = t.pageTitle;
        }
        const activeCouple =
          language === 'zh'
            ? chineseCouple
            : language === 'en'
              ? englishCouple
              : weddingConfig;
        const firstFull = isGroomSide ? activeCouple.groom.name : activeCouple.bride.name;
        const secondFull = isGroomSide ? activeCouple.bride.name : activeCouple.groom.name;
        const suffix =
          language === 'en'
            ? isGroomSide
              ? "Groom's Wedding Invitation"
              : "Bride's Wedding Invitation"
            : language === 'zh'
              ? isGroomSide
                ? '新婚喜宴请柬'
                : '女方婚礼请柬'
              : isGroomSide
                ? 'Thiệp Mời Lễ Thành Hôn'
                : 'Thiệp Mời Lễ Vu Quy';
        const dynamicOgTitle = `${firstFull} & ${secondFull} — ${suffix}`;
        const dynamicDesc = t.envelope?.invitation || '';

        const setMeta = (selector, value) => {
          if (!value) return;
          const el = document.querySelector(selector);
          if (el) el.setAttribute('content', value);
        };
        setMeta('meta[property="og:title"]', dynamicOgTitle);
        setMeta('meta[name="twitter:title"]', dynamicOgTitle);
        setMeta('meta[property="og:description"]', dynamicDesc);
        setMeta('meta[name="twitter:description"]', dynamicDesc);
        setMeta('meta[name="description"]', dynamicDesc);
      }
    }
  }, [t, language, isGroomSide, location.pathname, location.search]);

  const setLanguage = (lang) => {
    if (translations[lang]) {
      setLanguageState(lang);
    } else {
      setLanguageState('vi');
    }
  };

  const toggleLanguage = () => {
    const order = ['vi', 'en', 'zh'];
    const nextIdx = (order.indexOf(language) + 1) % order.length;
    setLanguage(order[nextIdx]);
  };

  const { bride, groom } = React.useMemo(() => {
    const baseCouple =
      language === 'zh'
        ? chineseCouple
        : language === 'en'
          ? englishCouple
          : weddingConfig;

    const bCms = cms?.bride;
    const gCms = cms?.groom;
    const bLoc = language === 'vi' ? bCms : bCms?.i18n?.[language];
    const gLoc = language === 'vi' ? gCms : gCms?.i18n?.[language];

    return {
      bride: {
        ...baseCouple.bride,
        phone: bCms?.phone || baseCouple.bride.phone,
        dob: bCms?.dob || baseCouple.bride.dob,
        ...(bLoc
          ? {
              name: bLoc.fullName || baseCouple.bride.name,
              shortName: bLoc.shortName || baseCouple.bride.shortName,
            }
          : {}),
      },
      groom: {
        ...baseCouple.groom,
        phone: gCms?.phone || baseCouple.groom.phone,
        dob: gCms?.dob || baseCouple.groom.dob,
        ...(gLoc
          ? {
              name: gLoc.fullName || baseCouple.groom.name,
              shortName: gLoc.shortName || baseCouple.groom.shortName,
            }
          : {}),
      },
    };
  }, [language, cms]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        bride,
        groom,
        side,
        isGroomSide,
        eventConfig,
        venueConfig,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

export default LanguageContext;
