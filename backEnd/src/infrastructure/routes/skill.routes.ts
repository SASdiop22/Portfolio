import { Router } from 'express';
import { SkillController } from '@infrastructure/controllers/SkillController';
import { authMiddleware } from '@infrastructure/middlewares/auth.middleware';
import { validate } from '@infrastructure/middlewares/validate.middleware';
import { CreateSkillDto } from '@infrastructure/dto/skill/CreateSkillDto';
import { UpdateSkillDto } from '@infrastructure/dto/skill/UpdateSkillDto';

const router = Router();

router.get('/', SkillController.list);
router.get('/categories', SkillController.categories);
router.get('/:id', SkillController.get);
router.post('/', authMiddleware, validate(CreateSkillDto), SkillController.create);
router.put('/:id', authMiddleware, validate(UpdateSkillDto), SkillController.update);
router.delete('/:id', authMiddleware, SkillController.remove);

export default router;
