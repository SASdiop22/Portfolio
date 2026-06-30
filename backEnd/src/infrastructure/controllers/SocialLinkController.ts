import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@infrastructure/database/config/data-source';
import { SocialLinkEntity } from '@infrastructure/entities/SocialLinkEntity';
import { SocialLinkRepository } from '@infrastructure/repositories/SocialLinkRepository';
import { ListSocialLinkUseCase } from '@use-cases/social-link/ListSocialLinkUseCase';
import { GetSocialLinkUseCase } from '@use-cases/social-link/GetSocialLinkUseCase';
import { CreateSocialLinkUseCase } from '@use-cases/social-link/CreateSocialLinkUseCase';
import { UpdateSocialLinkUseCase } from '@use-cases/social-link/UpdateSocialLinkUseCase';
import { DeleteSocialLinkUseCase } from '@use-cases/social-link/DeleteSocialLinkUseCase';

const repository = new SocialLinkRepository(AppDataSource.getRepository(SocialLinkEntity));
const listUseCase = new ListSocialLinkUseCase(repository);
const getUseCase = new GetSocialLinkUseCase(repository);
const createUseCase = new CreateSocialLinkUseCase(repository);
const updateUseCase = new UpdateSocialLinkUseCase(repository);
const deleteUseCase = new DeleteSocialLinkUseCase(repository);

export class SocialLinkController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({ success: true, data: await listUseCase.execute() });
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({ success: true, data: await getUseCase.execute(req.params.id) });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json({ success: true, data: await createUseCase.execute(req.body) });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res
        .status(200)
        .json({ success: true, data: await updateUseCase.execute(req.params.id, req.body) });
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
