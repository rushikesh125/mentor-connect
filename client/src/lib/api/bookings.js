import apiClient from './axios';

/**
 * Create a new booking
 * @param {Object} bookingData - {mentorId, startTime, topic}
 */
export const createBooking = async (bookingData) => {
  const response = await apiClient.post('/bookings', bookingData);
  return response.data;
};

/**
 * Get user's bookings
 */
export const getMyBookings = async () => {
  const response = await apiClient.get('/bookings/my');
  return response.data;
};

/**
 * Get booking by ID
 * @param {string} bookingId
 */
export const getBookingById = async (bookingId) => {
  const response = await apiClient.get(`/bookings/${bookingId}`);
  return response.data;
};

/**
 * Complete a session (mentee)
 * @param {string} sessionId
 */
export const completeSession = async (sessionId) => {
  const response = await apiClient.post(`/bookings/${sessionId}/complete`);
  return response.data;
};

/**
 * Cancel a booking
 * @param {string} bookingId
 */
export const cancelBooking = async (bookingId) => {
  const response = await apiClient.delete(`/bookings/${bookingId}`);
  return response.data;
};
