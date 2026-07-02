import { Router } from 'express';
import { ProjectController } from '@infrastructure/controllers/ProjectController';
import { authMiddleware } from '@infrastructure/middlewares/auth.middleware';
import { validate } from '@infrastructure/middlewares/validate.middleware';
import { CreateProjectDto } from '@infrastructure/dto/project/CreateProjectDto';
import { UpdateProjectDto } from '@infrastructure/dto/project/UpdateProjectDto';

const router = Router();

router.get('/', ProjectController.list);
router.get('/:id', ProjectController.get);
router.post('/', authMiddleware, validate(CreateProjectDto), ProjectController.create);
router.put('/:id', authMiddleware, validate(UpdateProjectDto), ProjectController.update);
router.delete('/:id', authMiddleware, ProjectController.remove);

export default router;
