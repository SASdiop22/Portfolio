import { Router } from 'express';
import { EducationController } from '@infrastructure/controllers/EducationController';
import { authMiddleware } from '@infrastructure/middlewares/auth.middleware';
import { validate } from '@infrastructure/middlewares/validate.middleware';
import { CreateEducationDto } from '@infrastructure/dto/education/CreateEducationDto';
import { UpdateEducationDto } from '@infrastructure/dto/education/UpdateEducationDto';

const router = Router();

router.get('/', EducationController.list);
router.get('/current', EducationController.current);
router.get('/:id', EducationController.get);
router.post('/', authMiddleware, validate(CreateEducationDto), EducationController.create);
router.put('/:id', authMiddleware, validate(UpdateEducationDto), EducationController.update);
router.delete('/:id', authMiddleware, EducationController.remove);

export default router;
