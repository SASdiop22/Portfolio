import { Router } from 'express';
import { InterestController } from '@infrastructure/controllers/InterestController';
import { authMiddleware } from '@infrastructure/middlewares/auth.middleware';
import { validate } from '@infrastructure/middlewares/validate.middleware';
import { CreateInterestDto } from '@infrastructure/dto/interest/CreateInterestDto';
import { UpdateInterestDto } from '@infrastructure/dto/interest/UpdateInterestDto';

const router = Router();

router.get('/', InterestController.list);
router.get('/:id', InterestController.get);
router.post('/', authMiddleware, validate(CreateInterestDto), InterestController.create);
router.put('/:id', authMiddleware, validate(UpdateInterestDto), InterestController.update);
router.delete('/:id', authMiddleware, InterestController.remove);

export default router;
