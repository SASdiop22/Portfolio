import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@infrastructure/database/config/data-source';
import { EducationEntity } from '@infrastructure/entities/EducationEntity';
import { EducationRepository } from '@infrastructure/repositories/EducationRepository';
import { ListEducationUseCase } from '@use-cases/education/ListEducationUseCase';
import { GetCurrentEducationUseCase } from '@use-cases/education/GetCurrentEducationUseCase';
import { GetEducationUseCase } from '@use-cases/education/GetEducationUseCase';
import { CreateEducationUseCase } from '@use-cases/education/CreateEducationUseCase';
import { UpdateEducationUseCase } from '@use-cases/education/UpdateEducationUseCase';
import { DeleteEducationUseCase } from '@use-cases/education/DeleteEducationUseCase';

const repository = new EducationRepository(AppDataSource.getRepository(EducationEntity));
const listUseCase = new ListEducationUseCase(repository);
const currentUseCase = new GetCurrentEducationUseCase(repository);
const getUseCase = new GetEducationUseCase(repository);
const createUseCase = new CreateEducationUseCase(repository);
const updateUseCase = new UpdateEducationUseCase(repository);
const deleteUseCase = new DeleteEducationUseCase(repository);

export class EducationController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await listUseCase.execute();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async current(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await currentUseCase.execute();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await getUseCase.execute(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await createUseCase.execute(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await updateUseCase.execute(req.params.id, req.body);
      res.status(200).json({ success: true, data: result });
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
