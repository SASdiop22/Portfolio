import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@infrastructure/database/config/data-source';
import { ContactMessageEntity } from '@infrastructure/entities/ContactMessageEntity';
import { ContactMessageRepository } from '@infrastructure/repositories/ContactMessageRepository';
import { CreateContactMessageUseCase } from '@use-cases/contact-message/CreateContactMessageUseCase';
import { ListContactMessageUseCase } from '@use-cases/contact-message/ListContactMessageUseCase';
import { ListUnreadContactMessageUseCase } from '@use-cases/contact-message/ListUnreadContactMessageUseCase';
import { MarkContactMessageAsReadUseCase } from '@use-cases/contact-message/MarkContactMessageAsReadUseCase';
import { DeleteContactMessageUseCase } from '@use-cases/contact-message/DeleteContactMessageUseCase';

const repository = new ContactMessageRepository(AppDataSource.getRepository(ContactMessageEntity));
const createUseCase = new CreateContactMessageUseCase(repository);
const listUseCase = new ListContactMessageUseCase(repository);
const unreadUseCase = new ListUnreadContactMessageUseCase(repository);
const markAsReadUseCase = new MarkContactMessageAsReadUseCase(repository);
const deleteUseCase = new DeleteContactMessageUseCase(repository);

export class ContactMessageController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json({ success: true, data: await createUseCase.execute(req.body) });
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result =
        req.query.unread === 'true' ? await unreadUseCase.execute() : await listUseCase.execute();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({ success: true, data: await markAsReadUseCase.execute(req.params.id) });
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await deleteUseCase.execute(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
