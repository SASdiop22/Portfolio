import { Router } from 'express';
import { StrengthController } from '@infrastructure/controllers/StrengthController';
import { authMiddleware } from '@infrastructure/middlewares/auth.middleware';
import { validate } from '@infrastructure/middlewares/validate.middleware';
import { CreateStrengthDto } from '@infrastructure/dto/strength/CreateStrengthDto';
import { UpdateStrengthDto } from '@infrastructure/dto/strength/UpdateStrengthDto';

const router = Router();

router.get('/', StrengthController.list);
router.get('/:id', StrengthController.get);
router.post('/', authMiddleware, validate(CreateStrengthDto), StrengthController.create);
router.put('/:id', authMiddleware, validate(UpdateStrengthDto), StrengthController.update);
router.delete('/:id', authMiddleware, StrengthController.remove);

export default router;
