import { Router } from 'express';
import { ExperienceController } from '@infrastructure/controllers/ExperienceController';
import { authMiddleware } from '@infrastructure/middlewares/auth.middleware';
import { validate } from '@infrastructure/middlewares/validate.middleware';
import { CreateExperienceDto } from '@infrastructure/dto/experience/CreateExperienceDto';
import { UpdateExperienceDto } from '@infrastructure/dto/experience/UpdateExperienceDto';

const router = Router();

router.get('/', ExperienceController.list);
router.get('/current', ExperienceController.current);
router.get('/:id', ExperienceController.get);
router.post('/', authMiddleware, validate(CreateExperienceDto), ExperienceController.create);
router.put('/:id', authMiddleware, validate(UpdateExperienceDto), ExperienceController.update);
router.delete('/:id', authMiddleware, ExperienceController.remove);

export default router;
