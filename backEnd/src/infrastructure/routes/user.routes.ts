import { Router } from 'express';
import { UserController } from '@infrastructure/controllers/UserController';
import { authMiddleware } from '@infrastructure/middlewares/auth.middleware';
import { validate } from '@infrastructure/middlewares/validate.middleware';
import { uploadUserPhoto } from '@infrastructure/middlewares/upload.middleware';
import { UpdateUserProfileDto } from '@infrastructure/dto/user/UpdateUserProfileDto';

const router = Router();

router.get('/profile', UserController.getProfile);
router.put(
  '/profile',
  authMiddleware,
  validate(UpdateUserProfileDto),
  UserController.updateProfile,
);
router.post('/photo', authMiddleware, uploadUserPhoto.single('photo'), UserController.uploadPhoto);

export default router;
