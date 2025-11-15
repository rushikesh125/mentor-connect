import apiClient from './axios';

/**
 * Search mentors with filters
 * @param {Object} filters - {university, program, expertise, page, limit}
 */
export const searchMentors = async (filters = {}) => {
  const params = new URLSearchParams();
  
  Object.keys(filters).forEach(key => {
    if (filters[key]) params.append(key, filters[key]);
  });
  
  const response = await apiClient.get(`/mentors/search?${params.toString()}`);
  return response.data;
};

/**
 * Get mentor by ID
 * @param {string} mentorId
 */
export const getMentorById = async (mentorId) => {
  const response = await apiClient.get(`/mentors/${mentorId}`);
  return response.data;
};

/**
 * Get all approved mentors
 */
export const getAllMentors = async () => {
  const response = await apiClient.get('/mentors');
  return response.data;
};
