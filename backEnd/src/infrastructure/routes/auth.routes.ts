import { Router } from 'express';
import { AuthController } from '@infrastructure/controllers/AuthController';
import { validate } from '@infrastructure/middlewares/validate.middleware';
import { LoginDto } from '@infrastructure/dto/auth/LoginDto';

const router = Router();

router.post('/login', validate(LoginDto), AuthController.login);

export default router;
