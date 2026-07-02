import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@infrastructure/database/config/data-source';
import { StrengthEntity } from '@infrastructure/entities/StrengthEntity';
import { StrengthRepository } from '@infrastructure/repositories/StrengthRepository';
import { ListStrengthUseCase } from '@use-cases/strength/ListStrengthUseCase';
import { GetStrengthUseCase } from '@use-cases/strength/GetStrengthUseCase';
import { CreateStrengthUseCase } from '@use-cases/strength/CreateStrengthUseCase';
import { UpdateStrengthUseCase } from '@use-cases/strength/UpdateStrengthUseCase';
import { DeleteStrengthUseCase } from '@use-cases/strength/DeleteStrengthUseCase';

const repository = new StrengthRepository(AppDataSource.getRepository(StrengthEntity));
const listUseCase = new ListStrengthUseCase(repository);
const getUseCase = new GetStrengthUseCase(repository);
const createUseCase = new CreateStrengthUseCase(repository);
const updateUseCase = new UpdateStrengthUseCase(repository);
const deleteUseCase = new DeleteStrengthUseCase(repository);

export class StrengthController {
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
