// src/routes/authRoutes.js
import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';


import { registerSchema, loginSchema } from '../validations/authValidation.js';
import { protect } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';

const authRoutes = express.Router();

authRoutes.post('/register', validate(registerSchema), register);
authRoutes.post('/login', validate(loginSchema), login);
authRoutes.get('/me', protect, getMe);

export default authRoutes;