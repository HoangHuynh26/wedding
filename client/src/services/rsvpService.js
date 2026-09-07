import axios from 'axios';

// Base API URL can be overridden via VITE_API_URL or defaults to relative '/api'
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

/**
 * RSVP Service
 */
export const rsvpService = {
  /**
   * Submit guest RSVP
   * @param {Object} data
   * @param {string} data.fullName
   * @param {string} data.location
   * @param {boolean} [data.attendance=true]
   */
  async submitRSVP(data) {
    try {
      const response = await apiClient.post('/api/rsvp', {
        fullName: data.fullName,
        location: data.location,
        side: data.side,
        message: data.message,
        attendance: data.attendance ?? true,
      });
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Lỗi khi gửi phản hồi RSVP.');
      }
      if (error.code === 'ECONNABORTED') {
        throw new Error('Kết nối quá thời gian chờ. Vui lòng thử lại sau giây lát.');
      }
      throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng hoặc thử lại.');
    }
  },

  /**
   * Retrieve all confirmed RSVPs
   */
  async getRSVPs() {
    try {
      const response = await apiClient.get('/api/rsvp');
      return response.data;
    } catch (error) {
      console.error('Error fetching RSVPs:', error);
      throw error;
    }
  },
};

export default rsvpService;
