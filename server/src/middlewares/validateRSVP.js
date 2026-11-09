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

  // Check Location
  if (!location || typeof location !== 'string' || !location.trim()) {
    errors.push({ field: 'location', message: 'Vui lòng nhập nơi bạn đang ở / Please enter your location or city.' });
  } else if (location.trim().length < 2) {
    errors.push({ field: 'location', message: 'Địa điểm phải có ít nhất 2 ký tự / Location must be at least 2 characters.' });
  } else if (location.trim().length > 100) {
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
  req.body.fullName = fullName.trim();
  req.body.location = location.trim();
  req.body.side = req.body.side ? String(req.body.side).trim().substring(0, 80) : 'Nhà Gái (Cô Dâu)';
  req.body.message = req.body.message ? String(req.body.message).trim().substring(0, 1000) : '';

  if (req.body.attendance === undefined) {
    req.body.attendance = true;
  } else {
    req.body.attendance = Boolean(req.body.attendance);
  }

  next();
};

module.exports = validateRSVP;
