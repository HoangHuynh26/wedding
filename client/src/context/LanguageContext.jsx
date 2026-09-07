import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext(null);

export const translations = {
  vi: {
    langCode: 'VI',
    toggleLabel: 'English',
    envelope: {
      header: 'THIỆP MỜI THÀNH HÔN',
      subHeader: 'KÍNH BÁO TIN VUI',
      invitation: 'Trân trọng kính mời quý khách đến dự tiệc mừng ngày hạnh phúc của chúng mình.',
      tapToOpen: 'Chạm để mở thiệp',
      audioNote: '(Giai điệu tình yêu sẽ tự động ngân vang khi mở thiệp)',
    },
    hero: {
      subtitle: 'NGÀY CHUNG ĐÔI',
      scroll: 'Cuộn xuống để khám phá',
      date: '17 · 01 · 2027',
    },
    formal: {
      saveTheDate: 'LỄ THÀNH HÔN • TRÂN TRỌNG KÍNH MỜI',
      title: 'THIỆP MỜI THÀNH HÔN',
      welcome: 'Trân trọng kính mời quý khách đến dự bữa tiệc thân mật mừng Lễ Thành Hôn của hai con chúng tôi',
      groomSide: 'ĐẠI DIỆN NHÀ TRAI',
      groomParents: 'Ông Trần Đình Lý',
      brideSide: 'ĐẠI DIỆN NHÀ GÁI',
      brideParents: 'Ông Nguyễn Thanh Tâm & Bà Nguyễn Xuân Mai',
      groomRole: 'Chú Rể',
      brideRole: 'Cô Dâu',
      dob: 'Sinh ngày:',
      sonOf: 'Trưởng nam của:',
      daughterOf: 'Ái nữ của:',
      receptionTag: 'THỜI GIAN & ĐỊA ĐIỂM TỔ CHỨC TIỆC CƯỚI',
      fullDate: 'Chủ Nhật, ngày 17 tháng 01 năm 2027',
      time: '11:20 AM',
      venueName: 'TRUNG TÂM TIỆC CƯỚI ĐỒNG NAI',
      hallName: 'Grand Ballroom - Sảnh Hoàng Gia',
      address: '1322/768, Khu phố Thiện Tân, Phường Trảng Dài, TP. Biên Hòa, Tỉnh Đồng Nai',
      rsvpBtn: 'Xác Nhận Tham Dự (RSVP)',
      mapsBtn: 'Chỉ Đường Google Maps',
      exploreBtn: 'Khám Phá Hành Trình Tình Yêu',
    },
    intro: {
      tag: 'THƯ NGỎ YÊU THƯƠNG',
      title: 'Hành Trình Yêu Thương',
      quote: '“Hạnh phúc không phải là điểm đến, mà là một hành trình cùng nhau sẻ chia từng khoảnh khắc ngọt ngào lẫn thử thách. Chúng mình trân quý từng ngày tháng đã qua và hân hoan bước vào chương mới của cuộc đời.”',
      subtext: 'Trân trọng kính mời quý gia đình, người thân và bạn bè đến chung vui trong ngày trọng đại của chúng mình.',
      groomRole: 'Chú Rể',
      brideRole: 'Cô Dâu',
      dobLabel: 'Sinh ngày:',
      sonOf: 'Trưởng nam của:',
      daughterOf: 'Ái nữ của:',
      groomDob: '14/10/1997',
      brideDob: '23/11/1999',
      groomParents: 'Ông Trần Đình Lý',
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
          title: 'Ngày Thành Hôn',
          subtitle: 'Khởi đầu cho chương hạnh phúc trăm năm',
          description: 'Hôm nay, ngày 17.01.2027, trong sự chúc phúc của hai bên gia đình và bè bạn, chúng mình chính thức nắm tay nhau bước vào ngưỡng cửa hôn nhân.',
        },
      ],
    },
    countdown: {
      tag: 'ĐẾM NGƯỢC THỜI GIAN',
      title: 'Cùng Đếm Ngược Đến Giờ Phút Thiêng Liêng',
      days: 'NGÀY',
      hours: 'GIỜ',
      minutes: 'PHÚT',
      seconds: 'GIÂY',
      fullDate: 'Chủ Nhật, 17 Tháng 01, 2027 • 17:30',
    },
    video: {
      tag: 'THƯỚC PHIM KỶ NIỆM',
      title: 'Khoảnh Khắc Đáng Nhớ',
      captionTitle: 'Từng Khoảnh Khắc Bên Nhau',
      captionText: 'Ghi lại những nụ cười, ánh mắt và những chuyến đi đong đầy yêu thương của Đình Huy & Thu Hiền.',
    },
    gallery: {
      tag: 'KHOẢNH KHẮC NGỌT NGÀO',
      title: 'Album Ảnh Cưới',
      expandBtn: 'Phóng To Ảnh',
      intro: 'Những khoảnh khắc đong đầy yêu thương của chúng mình. Chạm hoặc nhấp vào ảnh bất kỳ để xem toàn màn hình.',
      photos: [
        { title: 'Khoảnh Khắc Bình Yên', caption: 'Nụ cười hạnh phúc trong ánh nắng sớm mai' },
        { title: 'Lời Hẹn Ước', caption: 'Bàn tay nắm chặt không rời' },
        { title: 'Tình Yêu Nở Hoa', caption: 'Giữa không gian ngập tràn hoa tươi và ánh sáng' },
        { title: 'Ánh Nhìn Ngọt Ngào', caption: 'Đôi mắt chứa đựng cả bầu trời thương nhớ' },
        { title: 'Chuyến Đi Kỷ Niệm', caption: 'Cùng nhau ngắm hoàng hôn buông xuống chân đồi' },
        { title: 'Vũ Điệu Hạnh Phúc', caption: 'Xoay tròn trong giai điệu của tình yêu' },
      ],
    },
    venue: {
      tag: 'ĐỊA ĐIỂM TỔ CHỨC',
      title: 'Nơi Hạnh Phúc Đơm Hoa',
      hall: 'Grand Ballroom - Sảnh Hoàng Gia',
      timeTitle: 'Thời Gian Tổ Chức',
      timeDetail: '17:30 (Bắt đầu đón khách)',
      addressTitle: 'Địa Chỉ Tiệc Cưới',
      addressText: '1322/768 Khu phố Thiện Tân, Phường Trảng Dài, TP. Biên Hòa, Tỉnh Đồng Nai',
      mapsBtn: 'CHỈ ĐƯỜNG GOOGLE MAPS',
      coordinatesLabel: 'Tọa độ',
      schedule: [
        '17:30 - Đón khách & Tiệc trà khai vị',
        '18:30 - Khai tiệc & Nghi lễ thành hôn',
        '19:00 - Tiệc mừng thân mật & Âm nhạc',
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
      quote: '“Sự hiện diện và lời chúc phúc của quý khách là niềm vinh hạnh to lớn cho gia đình chúng mình.”',
      joining: 'BẠN SẼ ĐẾN CHUNG VUI CHỨ?',
      formTitle: 'Xác Nhận Tham Dự',
      formSubtitle: 'Để gia đình chuẩn bị chu đáo nhất, xin quý khách vui lòng xác nhận trước ngày 05.01.2027.',
      nameLabel: 'Họ và Tên của bạn *',
      namePlaceholder: 'Ví dụ: Nguyễn Văn Nam',
      locationLabel: 'Bạn đến từ đâu? (Tỉnh / Thành phố) *',
      locationPlaceholder: 'Ví dụ: Đồng Nai, TP. Hồ Chí Minh, Hà Nội',
      sideLabel: 'Bạn là khách của ai? *',
      sideGroom: 'Nhà Trai (Chú Rể)',
      sideBride: 'Nhà Gái (Cô Dâu)',
      sideMutual: 'Cả hai (Bạn chung)',
      messageLabel: 'Gửi lời chúc mừng đến cặp đôi',
      messagePlaceholder: 'Gửi những lời chúc phúc ấm áp nhất đến Đình Huy & Thu Hiền...',
      submitBtn: "TÔI SẼ ĐẾN CHUNG VUI",
      confirming: 'Đang gửi xác nhận...',
      validationNameRequired: 'Vui lòng nhập họ và tên của bạn',
      validationNameShort: 'Tên phải có ít nhất 2 ký tự',
      validationLocationRequired: 'Vui lòng nhập tỉnh/thành phố bạn đang ở',
      validationLocationShort: 'Địa điểm phải có ít nhất 2 ký tự',
      successHeading: "RẤT HÂN HẠNH ĐƯỢC ĐÓN TIẾP BẠN!",
      thankYou: 'Trân trọng cảm ơn,',
      successMsg: '“Cảm ơn bạn đã xác nhận tham dự. Chúng mình rất mong chờ được đón tiếp và chung vui cùng bạn trong ngày trọng đại!”',
      guestLabel: 'Khách mời:',
      fromLabel: 'Nơi đến:',
      sideSummary: 'Khách của:',
      messageSummary: 'Lời chúc:',
      statusLabel: 'Tình trạng:',
      statusConfirmed: 'Đã xác nhận tham dự ✓',
      resetBtn: 'Gửi phản hồi mới hoặc đăng ký cho người thân',
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
      quote: '“Cảm ơn bạn đã luôn là một phần trân quý trong hành trình hạnh phúc của chúng mình.”',
      tagline: 'Gửi trọn yêu thương • Dành riêng cho ngày hạnh phúc trăm năm',
    },
  },

  en: {
    langCode: 'EN',
    toggleLabel: 'Tiếng Việt',
    envelope: {
      header: 'WEDDING INVITATION',
      subHeader: 'SAVE OUR SPECIAL DAY',
      invitation: 'Together with our families, we joyfully invite you to celebrate our wedding day.',
      tapToOpen: 'Tap to Open Invitation',
      audioNote: '(Romantic background melody plays automatically upon opening)',
    },
    hero: {
      subtitle: 'WE ARE GETTING MARRIED',
      scroll: 'Scroll to explore',
      date: '17 · 01 · 2027',
    },
    formal: {
      saveTheDate: 'SAVE THE DATE • CORDIALLY INVITED',
      title: 'WEDDING INVITATION',
      welcome: 'Together with our families, we joyfully request the pleasure of your company at the celebration of our marriage',
      groomSide: 'GROOM’S FAMILY',
      groomParents: 'Mr. Tran Dinh Ly',
      brideSide: 'BRIDE’S FAMILY',
      brideParents: 'Mr. Nguyen Thanh Tam & Mrs. Nguyen Xuan Mai',
      groomRole: 'The Groom',
      brideRole: 'The Bride',
      dob: 'Born on:',
      sonOf: 'Son of:',
      daughterOf: 'Daughter of:',
      receptionTag: 'CEREMONY & RECEPTION DETAILS',
      fullDate: 'Sunday, January 17, 2027',
      time: '11:20 AM',
      venueName: 'DONG NAI WEDDING CONVENTION CENTER',
      hallName: 'Grand Ballroom - Royal Hall',
      address: '1322/768, Thien Tan Quarter, Trang Dai Ward, Bien Hoa City, Dong Nai Province',
      rsvpBtn: 'RSVP Confirmation',
      mapsBtn: 'Get Google Maps Directions',
      exploreBtn: 'Explore Love Journey',
    },
    intro: {
      tag: 'OUR WEDDING INVITATION',
      title: 'A Journey of Love',
      quote: '“Happiness is not a destination, but a beautiful journey of sharing sweet smiles, supporting each other through every challenge, and cherishing every chapter together.”',
      subtext: 'Together with our families, we joyfully invite you to celebrate our special wedding day with us.',
      groomRole: 'The Groom',
      brideRole: 'The Bride',
      dobLabel: 'Born on:',
      sonOf: 'Son of:',
      daughterOf: 'Daughter of:',
      groomDob: '14/10/1997',
      brideDob: '23/11/1999',
      groomParents: 'Mr. Tran Dinh Ly',
      brideParents: 'Mr. Nguyen Thanh Tam & Mrs. Nguyen Xuan Mai',
      groomBio: 'A sincere, gentle and warmhearted soul who deeply cherishes family moments and peace.',
      brideBio: 'A graceful, thoughtful and radiant lady who brings warmth, positivity, and smiles to everyone.',
    },
    story: {
      tag: 'OUR LOVE STORY',
      title: 'How It All Began',
      milestones: [
        {
          year: '2022',
          title: 'When We First Met',
          subtitle: 'A lovely autumn afternoon at a cozy café',
          description: 'A serendipitous encounter at an art workshop. First shy glances, warm smiles, and a lovely conversation that lasted into the night.',
        },
        {
          year: '2023',
          title: 'Our First Official Date',
          subtitle: 'When two souls harmonized into one melody',
          description: 'Our first official date by the riverfront. Sincere talks about dreams and hopes drew our hearts closer than ever.',
        },
        {
          year: '2025',
          title: 'Growing Together',
          subtitle: 'Exploring new horizons side by side',
          description: 'Traveling hand in hand across scenic lands. Learning empathy, patience, and becoming each other’s greatest sanctuary.',
        },
        {
          year: '2026',
          title: 'She Said YES!',
          subtitle: 'A golden sunset promise',
          description: 'Under a radiant golden sunset, a ring was offered along with a promise for forever. Tears of boundless joy and a bright "Yes!".',
        },
        {
          year: '2027',
          title: 'Our Wedding Day',
          subtitle: 'The beginning of our lifelong forever',
          description: 'Today, surrounded by the blessings of beloved family and friends, we step hand in hand into the sacred bond of marriage.',
        },
      ],
    },
    countdown: {
      tag: 'WEDDING COUNTDOWN',
      title: 'Counting Down to Our Sacred Moment',
      days: 'DAYS',
      hours: 'HOURS',
      minutes: 'MINUTES',
      seconds: 'SECONDS',
      fullDate: 'Sunday, January 17, 2027 • 17:30',
    },
    video: {
      tag: 'CINEMATIC HIGHLIGHTS',
      title: 'Cherished Moments',
      captionTitle: 'Moments Held In Time',
      captionText: 'A glimpse into the cherished smiles, gentle glances, and unforgettable journeys of Dinh Huy & Thu Hien.',
    },
    gallery: {
      tag: 'SWEET MEMORIES',
      title: 'Wedding Photo Album',
      expandBtn: 'Expand Photo',
      intro: 'Cherished memories of our journey together. Tap any photo to inspect full-screen.',
      photos: [
        { title: 'Serene Morning', caption: 'Radiant smiles under the soft morning sun' },
        { title: 'Our Promise', caption: 'Holding hands towards forever' },
        { title: 'Blooming Love', caption: 'Surrounded by blooming flowers and golden glow' },
        { title: 'Sweet Glances', caption: 'Eyes that reflect a whole sky of love' },
        { title: 'Memorable Getaway', caption: 'Watching sunset paint the hillside together' },
        { title: 'Dance of Joy', caption: 'Spinning together in the melody of romance' },
      ],
    },
    venue: {
      tag: 'WEDDING VENUE',
      title: 'Where Love Begins',
      hall: 'Grand Ballroom - Royal Hall',
      timeTitle: 'Ceremony Schedule',
      timeDetail: '17:30 (Guest reception begins)',
      addressTitle: 'Wedding Venue Address',
      addressText: '1322/768, Thien Tan Quarter, Trang Dai Ward, Bien Hoa City, Dong Nai Province',
      mapsBtn: 'GET DIRECTIONS (GOOGLE MAPS)',
      coordinatesLabel: 'Coordinates',
      schedule: [
        '17:30 - Welcome Reception & Refreshments',
        '18:30 - Wedding Ceremony & Nuptials',
        '19:00 - Intimate Dinner Banquet & Music',
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
      before: 'Warm Wishes & Attendance RSVP',
      quote: '“We would be deeply honored to have your presence to celebrate this meaningful milestone with us.”',
      joining: 'ARE YOU JOINING US?',
      formTitle: 'RSVP Confirmation',
      formSubtitle: 'To help our families prepare warmly and seat everyone comfortably, please kindly confirm by Jan 5, 2027.',
      nameLabel: 'Your Full Name *',
      namePlaceholder: 'e.g. David Nguyen',
      locationLabel: 'Where are you traveling from? (City / Country) *',
      locationPlaceholder: 'e.g. Dong Nai / Ho Chi Minh City / Hanoi',
      sideLabel: 'Whose guest are you? *',
      sideGroom: "Groom's Side",
      sideBride: "Bride's Side",
      sideMutual: 'Both / Mutual',
      messageLabel: 'Wedding Wish / Message',
      messagePlaceholder: 'Send your heartfelt wishes to Dinh Huy & Thu Hien...',
      submitBtn: "YES, I'LL BE THERE",
      confirming: 'Confirming attendance...',
      validationNameRequired: 'Please enter your full name',
      validationNameShort: 'Name must be at least 2 characters',
      validationLocationRequired: 'Please enter your city or location',
      validationLocationShort: 'Location must be at least 2 characters',
      successHeading: "WE'RE SO HAPPY YOU'LL BE THERE!",
      thankYou: 'Thank you warmly,',
      successMsg: '“Thank you for confirming your attendance. We cannot wait to celebrate this magical day with you!”',
      guestLabel: 'Guest:',
      fromLabel: 'From:',
      sideSummary: 'Side:',
      messageSummary: 'Wish:',
      statusLabel: 'Status:',
      statusConfirmed: 'Attendance Confirmed ✓',
      resetBtn: 'Submit another RSVP for family members',
    },
    nav: {
      story: 'OUR STORY',
      date: 'DATE',
      video: 'MEMORIES',
      gallery: 'GALLERY',
      venue: 'VENUE & MAP',
      qr: 'QR INVITATION',
      rsvp: 'RSVP',
      reopen: 'Reopen Sealed Envelope',
    },
    footer: {
      quote: '“Thank you for being such an integral part of our youth and our journey towards happiness.”',
      tagline: 'With All Our Love • Dedicated to our lifelong happiness',
    },
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem('wedding_lang') || 'vi';
    } catch {
      return 'vi';
    }
  });

  const toggleLanguage = () => {
    const next = language === 'vi' ? 'en' : 'vi';
    setLanguage(next);
    try {
      localStorage.setItem('wedding_lang', next);
    } catch {
      // Ignore
    }
  };

  const t = translations[language] || translations.vi;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
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
