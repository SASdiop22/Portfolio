import { Router } from 'express';
import { LanguageController } from '@infrastructure/controllers/LanguageController';
import { authMiddleware } from '@infrastructure/middlewares/auth.middleware';
import { validate } from '@infrastructure/middlewares/validate.middleware';
import { CreateLanguageDto } from '@infrastructure/dto/language/CreateLanguageDto';
import { UpdateLanguageDto } from '@infrastructure/dto/language/UpdateLanguageDto';

const router = Router();

router.get('/', LanguageController.list);
router.get('/:id', LanguageController.get);
router.post('/', authMiddleware, validate(CreateLanguageDto), LanguageController.create);
router.put('/:id', authMiddleware, validate(UpdateLanguageDto), LanguageController.update);
router.delete('/:id', authMiddleware, LanguageController.remove);

export default router;
