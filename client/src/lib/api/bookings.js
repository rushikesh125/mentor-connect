import apiClient from './axios';

/**
 * Transform booking/session data from API response
 */
const transformBooking = (booking) => {
  if (!booking) return null;
  
  return {
    ...booking,
    _id: booking._id || booking.id,
    mentor: booking.mentor ? {
      id: booking.mentor._id,
      _id: booking.mentor._id,
      fullName: booking.mentor.profile?.fullName || booking.mentor.fullName,
      email: booking.mentor.email,
      university: booking.mentor.profile?.university || booking.mentor.university,
      program: booking.mentor.profile?.program || booking.mentor.program,
    } : null,
    mentee: booking.mentee ? {
      id: booking.mentee._id,
      _id: booking.mentee._id,
      fullName: booking.mentee.fullName,
      email: booking.mentee.email,
      university: booking.mentee.university,
      program: booking.mentee.program,
    } : null,
  };
};

/**
 * Create a new booking
 * @param {Object} bookingData - {mentorId, startTime, topic}
 */
export const createBooking = async (bookingData) => {
  const response = await apiClient.post('/bookings', bookingData);
  return transformBooking(response.data);
};

/**
 * Get user's bookings
 */
export const getMyBookings = async () => {
  const response = await apiClient.get('/bookings/my');
  const bookingsArray = response.data.bookings || response.data;
  return bookingsArray.map(transformBooking);
};

/**
 * Get booking by ID
 * @param {string} bookingId
 */
export const getBookingById = async (bookingId) => {
  const response = await apiClient.get(`/bookings/${bookingId}`);
  return transformBooking(response.data);
};

/**
 * Complete a session (mentee)
 * @param {string} sessionId
 */
export const completeSession = async (sessionId) => {
  const response = await apiClient.post(`/bookings/${sessionId}/complete`);
  return transformBooking(response.data);
};

/**
 * Cancel a booking
 * @param {string} bookingId
 */
export const cancelBooking = async (bookingId) => {
  const response = await apiClient.delete(`/bookings/${bookingId}`);
  return response.data;
};
