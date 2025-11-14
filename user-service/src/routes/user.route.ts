import { Router } from 'express';
import { loginUser, registerUser } from '../controllers/user.controller.js';

const router = Router();

router.post('/register', registerUser);
router.get('/login', loginUser);

export default router;
