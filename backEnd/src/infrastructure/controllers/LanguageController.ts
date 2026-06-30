import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@infrastructure/database/config/data-source';
import { LanguageEntity } from '@infrastructure/entities/LanguageEntity';
import { LanguageRepository } from '@infrastructure/repositories/LanguageRepository';
import { ListLanguageUseCase } from '@use-cases/language/ListLanguageUseCase';
import { GetLanguageUseCase } from '@use-cases/language/GetLanguageUseCase';
import { CreateLanguageUseCase } from '@use-cases/language/CreateLanguageUseCase';
import { UpdateLanguageUseCase } from '@use-cases/language/UpdateLanguageUseCase';
import { DeleteLanguageUseCase } from '@use-cases/language/DeleteLanguageUseCase';

const repository = new LanguageRepository(AppDataSource.getRepository(LanguageEntity));
const listUseCase = new ListLanguageUseCase(repository);
const getUseCase = new GetLanguageUseCase(repository);
const createUseCase = new CreateLanguageUseCase(repository);
const updateUseCase = new UpdateLanguageUseCase(repository);
const deleteUseCase = new DeleteLanguageUseCase(repository);

export class LanguageController {
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
      res.status(200).json({ success: true, data: await updateUseCase.execute(req.params.id, req.body) });
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
