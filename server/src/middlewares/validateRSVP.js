/**
 * RSVP Request Validation Middleware
 */
const validateRSVP = (req, res, next) => {
  const { fullName, location } = req.body;
  const errors = [];

  // Check Full Name
  if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
    errors.push({ field: 'fullName', message: 'Vui lòng nhập họ và tên của bạn / Please enter your full name.' });
  } else if (fullName.trim().length < 2) {
    errors.push({ field: 'fullName', message: 'Tên phải có ít nhất 2 ký tự / Name must be at least 2 characters.' });
  } else if (fullName.trim().length > 80) {
    errors.push({ field: 'fullName', message: 'Tên không được vượt quá 80 ký tự / Name cannot exceed 80 characters.' });
  }

  // Optional Location sanitization check
  if (location !== undefined && location !== null && typeof location === 'string' && location.trim().length > 100) {
    errors.push({ field: 'location', message: 'Địa điểm không được vượt quá 100 ký tự / Location cannot exceed 100 characters.' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors[0].message,
      errors,
    });
  }

  // Sanitize values
  const rawType = String(req.body.invitationType || '').trim().toLowerCase();
  if (rawType === 'groom' || rawType === 'chu-re' || rawType === 'nha-trai') {
    req.body.invitationType = 'groom';
  } else {
    req.body.invitationType = 'bride';
  }

  const rawLang = String(req.body.language || '').trim().toLowerCase();
  const normalizedLang = rawLang === 'en' ? 'en' : rawLang === 'zh' || rawLang.startsWith('zh-') ? 'zh' : rawLang === 'vi' ? 'vi' : 'en';
  req.body.language = normalizedLang;

  const defaultSideByLang = {
    en: req.body.invitationType === 'groom' ? "Groom's Side" : "Bride's Side",
    vi: req.body.invitationType === 'groom' ? 'Nhà Trai (Chú Rể)' : 'Nhà Gái (Cô Dâu)',
    zh: req.body.invitationType === 'groom' ? '男方亲友（新郎方）' : '女方亲友（新娘方）',
  };
  const defaultSide = defaultSideByLang[normalizedLang] || defaultSideByLang.en;

  req.body.fullName = fullName.trim();
  req.body.location = location && typeof location === 'string' ? location.trim().substring(0, 100) : '';
  req.body.side = req.body.side ? String(req.body.side).trim().substring(0, 80) : defaultSide;
  req.body.message = req.body.message ? String(req.body.message).trim().substring(0, 1000) : '';

  if (req.body.attendance === undefined) {
    req.body.attendance = true;
  } else {
    req.body.attendance = Boolean(req.body.attendance);
  }

  next();
};

module.exports = validateRSVP;
