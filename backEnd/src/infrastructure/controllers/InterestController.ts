import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@infrastructure/database/config/data-source';
import { InterestEntity } from '@infrastructure/entities/InterestEntity';
import { InterestRepository } from '@infrastructure/repositories/InterestRepository';
import { ListInterestUseCase } from '@use-cases/interest/ListInterestUseCase';
import { GetInterestUseCase } from '@use-cases/interest/GetInterestUseCase';
import { CreateInterestUseCase } from '@use-cases/interest/CreateInterestUseCase';
import { UpdateInterestUseCase } from '@use-cases/interest/UpdateInterestUseCase';
import { DeleteInterestUseCase } from '@use-cases/interest/DeleteInterestUseCase';

const repository = new InterestRepository(AppDataSource.getRepository(InterestEntity));
const listUseCase = new ListInterestUseCase(repository);
const getUseCase = new GetInterestUseCase(repository);
const createUseCase = new CreateInterestUseCase(repository);
const updateUseCase = new UpdateInterestUseCase(repository);
const deleteUseCase = new DeleteInterestUseCase(repository);

export class InterestController {
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
