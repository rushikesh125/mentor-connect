import express from 'express';
import { bookSession, getUserSessions, completeSession } from '../controllers/bookingController.js';
import { authorize, protect } from '../middlewares/auth.js';


const bookingRoutes = express.Router();

bookingRoutes.use(protect);
bookingRoutes.post('/', authorize('mentee'), bookSession);
bookingRoutes.get('/my', getUserSessions);
bookingRoutes.post('/:sessionId/complete', completeSession);

export default bookingRoutes;