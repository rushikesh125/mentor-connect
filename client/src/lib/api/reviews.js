import apiClient from './axios';

/**
 * Create a review
 * @param {Object} reviewData - {sessionId, rating, comment}
 */
export const createReview = async (reviewData) => {
  const response = await apiClient.post('/reviews', reviewData);
  return response.data;
};

/**
 * Get reviews for a mentor
 * @param {string} mentorId
 */
export const getMentorReviews = async (mentorId) => {
  const response = await apiClient.get(`/reviews/mentor/${mentorId}`);
  return response.data;
};

/**
 * Get my reviews (as reviewer)
 */
export const getMyReviews = async () => {
  const response = await apiClient.get('/reviews/my');
  return response.data;
};
