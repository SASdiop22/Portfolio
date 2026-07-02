import { Router } from 'express';
import { ContactMessageController } from '@infrastructure/controllers/ContactMessageController';
import { authMiddleware } from '@infrastructure/middlewares/auth.middleware';
import { validate } from '@infrastructure/middlewares/validate.middleware';
import { CreateContactMessageDto } from '@infrastructure/dto/contact-message/CreateContactMessageDto';

const router = Router();

router.post('/', validate(CreateContactMessageDto), ContactMessageController.create);
router.get('/', authMiddleware, ContactMessageController.list);
router.patch('/:id/read', authMiddleware, ContactMessageController.markAsRead);
router.delete('/:id', authMiddleware, ContactMessageController.remove);

export default router;
