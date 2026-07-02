import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@infrastructure/database/config/data-source';
import { ExperienceEntity } from '@infrastructure/entities/ExperienceEntity';
import { ExperienceRepository } from '@infrastructure/repositories/ExperienceRepository';
import { ListExperienceUseCase } from '@use-cases/experience/ListExperienceUseCase';
import { GetCurrentExperienceUseCase } from '@use-cases/experience/GetCurrentExperienceUseCase';
import { GetExperienceUseCase } from '@use-cases/experience/GetExperienceUseCase';
import { CreateExperienceUseCase } from '@use-cases/experience/CreateExperienceUseCase';
import { UpdateExperienceUseCase } from '@use-cases/experience/UpdateExperienceUseCase';
import { DeleteExperienceUseCase } from '@use-cases/experience/DeleteExperienceUseCase';

const repository = new ExperienceRepository(AppDataSource.getRepository(ExperienceEntity));
const listUseCase = new ListExperienceUseCase(repository);
const currentUseCase = new GetCurrentExperienceUseCase(repository);
const getUseCase = new GetExperienceUseCase(repository);
const createUseCase = new CreateExperienceUseCase(repository);
const updateUseCase = new UpdateExperienceUseCase(repository);
const deleteUseCase = new DeleteExperienceUseCase(repository);

export class ExperienceController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({ success: true, data: await listUseCase.execute() });
    } catch (error) {
      next(error);
    }
  }

  static async current(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({ success: true, data: await currentUseCase.execute() });
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
