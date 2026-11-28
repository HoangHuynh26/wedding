import axios from 'axios';
import { recordLocalRsvpConfirmation } from '../store/cmsStore';

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
      const invitationType =
        data.invitationType === 'groom' || data.invitationType === 'chu-re' ? 'groom' : 'bride';
      const response = await apiClient.post('/api/rsvp', {
        fullName: data.fullName,
        side: data.side,
        invitationType,
        language: data.language || 'vi',
        message: data.message,
        attendance: data.attendance ?? true,
      });

      // Mirror attendance confirmation ONLY (strictly without `message`) into website CMS store
      recordLocalRsvpConfirmation(
        response.data?.confirmation || {
          fullName: data.fullName,
          side: data.side,
          invitationType,
          language: data.language || 'vi',
          attendance: data.attendance ?? true,
        }
      );

      return response.data;
    } catch (error) {
      if (error.response?.status === 400 && /name/i.test(error.response?.data?.message || '')) {
        const err = new Error('VALIDATION_NAME');
        err.code = 'VALIDATION_NAME';
        throw err;
      }
      if (error.code === 'ECONNABORTED') {
        const err = new Error('TIMEOUT');
        err.code = 'TIMEOUT';
        throw err;
      }
      if (!error.response) {
        const err = new Error('NETWORK');
        err.code = 'NETWORK';
        throw err;
      }
      const err = new Error('SERVER');
      err.code = 'SERVER';
      throw err;
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
