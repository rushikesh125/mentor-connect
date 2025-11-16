import express from 'express';
import { completeMentorProfile, searchMentors, getMentorProfile } from '../controllers/mentorController.js';
import { authorize, protect } from '../middlewares/auth.js';


const mentorRoutes = express.Router();

mentorRoutes.post('/profile', protect, authorize('mentor'), completeMentorProfile);
mentorRoutes.get('/search', searchMentors);
mentorRoutes.get('/:id', getMentorProfile);

export default mentorRoutes;