/**
 * Centralized Wedding Configuration
 * All couple details, venue coordinates, schedule, story milestones,
 * and media URLs are defined here for effortless customization.
 */
export const weddingConfig = {
  // Couple Information
  groom: {
    name: 'Trần Lê Đình Huy',
    shortName: 'Đình Huy',
    dob: '14.10.1997',
    role: 'Chú Rể',
    parents: 'Ông Trần Đình Lý',
    bio: 'Một chàng trai chân thành, ấm áp và luôn trân trọng từng khoảnh khắc bình yên bên gia đình và người thương.',
    avatar: '/groom.jpg',
    phone: '0987 654 321',
  },
  bride: {
    name: 'Nguyễn Thị Thu Hiền',
    shortName: 'Thu Hiền',
    dob: '23.11.1999',
    role: 'Cô Dâu',
    parents: 'Ông Nguyễn Thanh Tâm & Bà Nguyễn Xuân Mai',
    bio: 'Cô gái dịu dàng, thông minh và tràn đầy năng lượng tích cực, luôn mang lại nụ cười và sự ấm áp cho mọi người.',
    avatar: '/bride.jpg',
    phone: '0912 345 678',
  },
  couplePhoto: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',

  // Wedding Date & Time
  // Target: January 17, 2027 at 11:20 AM
  event: {
    dateDisplay: '17 · 01 · 2027',
    fullDateDisplay: 'Chủ Nhật, ngày 17 tháng 01 năm 2027',
    timeDisplay: '11:20 AM',
    receptionTime: '17:30 - Đón khách & Tiệc trà khai vị',
    ceremonyTime: '18:30 - Khai tiệc & Nghi lễ thành hôn',
    dinnerTime: '19:00 - Tiệc mừng thân mật & Âm nhạc',
    isoDate: '2027-01-17T11:20:00+07:00',
  },

  // Venue & Location
  venue: {
    name: 'TRUNG TÂM TIỆC CƯỚI ĐỒNG NAI',
    hall: 'Grand Ballroom - Sảnh Hoàng Gia',
    address: '1322/768, Khu phố Thiện Tân, Phường Trảng Dài, TP. Biên Hòa, Tỉnh Đồng Nai',
    addressShort: '1322/768 KP. Thiện Tân, P. Trảng Dài, TP. Biên Hòa, Đồng Nai',
    phone: '(+84) 251 388 9999',
    coordinates: { latitude: 11.015738, longitude: 106.864480 },
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=11.015738%2C106.864480',
    embedMapUrl: 'https://www.google.com/maps?q=11.015738,106.864480&z=16&output=embed',
  },

  // QR Code & Invitation Link
  invitationUrl: typeof window !== 'undefined' ? window.location.origin : 'https://wedding.dinhhuy-thuhien.love',

  // Love Story Timeline
  story: [
    {
      year: '2022',
      title: 'Lần Đầu Gặp Gỡ',
      subtitle: 'Một chiều thu dịu dàng tại góc quán quen',
      description: 'Chúng mình tình cờ gặp nhau tại một buổi workshop nghệ thuật. Ánh nhìn đầu tiên, nụ cười bỡ ngỡ và câu chuyện kéo dài đến khi phố xá đã lên đèn.',
      image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80',
    },
    {
      year: '2023',
      title: 'Hẹn Hò & Gắn Kết',
      subtitle: 'Khi hai trái tim cùng chung nhịp đập',
      description: 'Buổi hẹn hò chính thức đầu tiên với bao bồi hồi rung động. Những lời sẻ chia chân thành về ước mơ và tương lai đã gắn kết hai tâm hồn lại gần nhau hơn.',
      image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80',
    },
    {
      year: '2025',
      title: 'Trưởng Thành Bên Nhau',
      subtitle: 'Vượt qua thử thách và cùng nhau đi khắp nơi',
      description: 'Cùng nhau đi qua nhiều vùng đất mới, học cách thấu hiểu, kiên nhẫn và luôn là điểm tựa bình yên nhất của nhau trong mọi chặng đường.',
      image: 'https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=800&q=80',
    },
    {
      year: '2026',
      title: 'Lời Hứa Trọn Đời',
      subtitle: 'Khoảnh khắc thiêng liêng dưới hoàng hôn',
      description: 'Dưới ánh hoàng hôn rực rỡ, chiếc nhẫn được trao đi cùng lời hẹn ước trăm năm. Giọt nước mắt hạnh phúc và nụ cười rạng ngời: "Em đồng ý!".',
      image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
    },
    {
      year: '2027',
      title: 'Ngày Thành Hôn',
      subtitle: 'Khởi đầu cho chương hạnh phúc mới',
      description: 'Hôm nay, ngày 17.01.2027, trong sự chúc phúc của hai bên gia đình và bè bạn, chúng mình chính thức nắm tay nhau bước vào ngưỡng cửa hôn nhân.',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    },
  ],

  // Gallery Photos (Responsive & Lightbox ready)
  gallery: [
    {
      id: 1,
      src: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
      title: 'Khoảnh Khắc Bình Yên',
      caption: 'Nụ cười hạnh phúc trong ánh nắng sớm mai',
      category: 'pre-wedding',
    },
    {
      id: 2,
      src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
      title: 'Lời Hẹn Ước',
      caption: 'Bàn tay nắm chặt không rời',
      category: 'engagement',
    },
    {
      id: 3,
      src: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=600&q=80',
      title: 'Tình Yêu Nở Hoa',
      caption: 'Giữa không gian ngập tràn hoa tươi và ánh sáng',
      category: 'portrait',
    },
    {
      id: 4,
      src: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80',
      title: 'Ánh Nhìn Ngọt Ngào',
      caption: 'Đôi mắt chứa đựng cả bầu trời thương nhớ',
      category: 'portrait',
    },
    {
      id: 5,
      src: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=600&q=80',
      title: 'Chuyến Đi Kỷ Niệm',
      caption: 'Cùng nhau ngắm hoàng hôn buông xuống chân đồi',
      category: 'travel',
    },
    {
      id: 6,
      src: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=1200&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=600&q=80',
      title: 'Vũ Điệu Hạnh Phúc',
      caption: 'Xoay tròn trong giai điệu của tình yêu',
      category: 'pre-wedding',
    },
  ],

  // Videos
  videos: {
    heroVideo: 'https://assets.mixkit.co/videos/preview/mixkit-young-wedding-couple-smiling-together-41315-large.mp4',
    heroPoster: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80',
    memoriesVideo: 'https://assets.mixkit.co/videos/preview/mixkit-bride-and-groom-posing-in-a-field-41312-large.mp4',
    memoriesPoster: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
  },

  // Romantic Background Music Catalog & Playlist
  playlist: [
    {
      id: 'young-and-beautiful',
      title: 'Young and Beautiful',
      artist: 'Lana Del Rey',
      tag: 'Lãng Mạn & Cổ Điển',
      src: '/audio/young-and-beautiful.m4a',
      fallbackSrc: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/d7/0b/8a/d70b8adf-8a27-aafa-76a4-f59200be9ab0/mzaf_6008955516336655319.plus.aac.p.m4a',
    },
    {
      id: 'where-is-my-husband',
      title: 'Where Is My Husband',
      artist: 'RAYE',
      tag: 'Năng Động & Vui Tươi',
      src: '/audio/where-is-my-husband.m4a',
      fallbackSrc: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/6a/67/70/6a6770b5-4927-7854-5915-56b8c27b5520/mzaf_6725601798761594834.plus.aac.p.m4a',
    },
    {
      id: 'until-i-found-you',
      title: 'Until I Found You',
      artist: 'Stephen Sanchez',
      tag: 'Retro Tình Say',
      src: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/53/82/c1/5382c1d4-ddba-aa2b-90df-57268895fac9/mzaf_8926201202931541051.plus.aac.p.m4a',
      fallbackSrc: '/audio/young-and-beautiful.m4a',
    },
    {
      id: 'a-thousand-years',
      title: 'A Thousand Years',
      artist: 'Christina Perri',
      tag: 'Lời Hẹn Ước Trăm Năm',
      src: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/8e/3a/e7/8e3ae749-5e13-a9ca-fef6-61d615bc3087/mzaf_5415208554281396500.plus.aac.p.m4a',
      fallbackSrc: '/audio/young-and-beautiful.m4a',
    },
    {
      id: 'perfect',
      title: 'Perfect',
      artist: 'Ed Sheeran',
      tag: 'Ngọt Ngào Đắm Say',
      src: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/c7/ba/bc/c7babc66-f598-aaa6-bcf6-307281795817/mzaf_16337361235117168274.plus.aac.p.m4a',
      fallbackSrc: '/audio/young-and-beautiful.m4a',
    },
    {
      id: 'cant-help-falling-in-love',
      title: "Can't Help Falling in Love",
      artist: 'Kina Grannis',
      tag: 'Mộc Mạc Sâu Lắng',
      src: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/cf/dd/2e/cfdd2e01-c248-6845-daaf-e19b0d2f0577/mzaf_2042819518909429825.plus.aac.p.m4a',
      fallbackSrc: '/audio/young-and-beautiful.m4a',
    },
    {
      id: 'ngay-dau-tien',
      title: 'Ngày Đầu Tiên',
      artist: 'Đức Phúc',
      tag: 'Hạnh Phúc Rạng Ngời (Việt)',
      src: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/13/70/bb/1370bb20-716d-1c54-9b25-5aacce7966a1/mzaf_12643188274453591891.plus.aac.p.m4a',
      fallbackSrc: '/audio/young-and-beautiful.m4a',
    },
    {
      id: 'anh-nang-cua-anh',
      title: 'Ánh Nắng Của Anh',
      artist: 'Đức Phúc',
      tag: 'Ấm Áp Dịu Êm (Việt)',
      src: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/ea/e1/67/eae1675f-4946-e14e-c614-4a69b779a15d/mzaf_6109800472991969995.plus.aac.p.m4a',
      fallbackSrc: '/audio/young-and-beautiful.m4a',
    },
    {
      id: 'i-do',
      title: 'I Do',
      artist: '911 Band',
      tag: 'Giai Điệu Bất Hủ',
      src: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/64/a2/59/64a25929-8bad-f22a-2d00-0ebf51daf6c6/mzaf_13069824018575263394.plus.aac.p.m4a',
      fallbackSrc: '/audio/young-and-beautiful.m4a',
    },
  ],

  // Default Romantic Background Music
  music: {
    id: 'young-and-beautiful',
    title: 'Young and Beautiful',
    artist: 'Lana Del Rey',
    src: '/audio/young-and-beautiful.m4a',
    audioUrl: '/audio/young-and-beautiful.m4a',
    fallbackSrc: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/d7/0b/8a/d70b8adf-8a27-aafa-76a4-f59200be9ab0/mzaf_6008955516336655319.plus.aac.p.m4a',
    fallbackUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/d7/0b/8a/d70b8adf-8a27-aafa-76a4-f59200be9ab0/mzaf_6008955516336655319.plus.aac.p.m4a',
  },
};

export default weddingConfig;
