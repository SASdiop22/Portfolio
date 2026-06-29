import { Router } from 'express';
import { SocialLinkController } from '@infrastructure/controllers/SocialLinkController';
import { authMiddleware } from '@infrastructure/middlewares/auth.middleware';
import { validate } from '@infrastructure/middlewares/validate.middleware';
import { CreateSocialLinkDto } from '@infrastructure/dto/social-link/CreateSocialLinkDto';
import { UpdateSocialLinkDto } from '@infrastructure/dto/social-link/UpdateSocialLinkDto';

const router = Router();

router.get('/', SocialLinkController.list);
router.get('/:id', SocialLinkController.get);
router.post('/', authMiddleware, validate(CreateSocialLinkDto), SocialLinkController.create);
router.put('/:id', authMiddleware, validate(UpdateSocialLinkDto), SocialLinkController.update);
router.delete('/:id', authMiddleware, SocialLinkController.remove);

export default router;
