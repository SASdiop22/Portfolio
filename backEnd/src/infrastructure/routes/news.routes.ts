import { Router } from 'express';
import { NewsController } from '@infrastructure/controllers/NewsController';
import { authMiddleware } from '@infrastructure/middlewares/auth.middleware';
import { validate } from '@infrastructure/middlewares/validate.middleware';
import { CreateNewsDto } from '@infrastructure/dto/news/CreateNewsDto';
import { UpdateNewsDto } from '@infrastructure/dto/news/UpdateNewsDto';

const router = Router();

router.get('/', NewsController.list);
router.get('/recent', NewsController.recent);
router.get('/:id', NewsController.get);
router.post('/', authMiddleware, validate(CreateNewsDto), NewsController.create);
router.put('/:id', authMiddleware, validate(UpdateNewsDto), NewsController.update);
router.delete('/:id', authMiddleware, NewsController.remove);

export default router;
