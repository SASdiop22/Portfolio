import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@infrastructure/database/config/data-source';
import { SkillEntity } from '@infrastructure/entities/SkillEntity';
import { SkillRepository } from '@infrastructure/repositories/SkillRepository';
import { ListSkillUseCase } from '@use-cases/skill/ListSkillUseCase';
import { ListSkillByCategoryUseCase } from '@use-cases/skill/ListSkillByCategoryUseCase';
import { ListSkillCategoriesUseCase } from '@use-cases/skill/ListSkillCategoriesUseCase';
import { GetSkillUseCase } from '@use-cases/skill/GetSkillUseCase';
import { CreateSkillUseCase } from '@use-cases/skill/CreateSkillUseCase';
import { UpdateSkillUseCase } from '@use-cases/skill/UpdateSkillUseCase';
import { DeleteSkillUseCase } from '@use-cases/skill/DeleteSkillUseCase';

const repository = new SkillRepository(AppDataSource.getRepository(SkillEntity));
const listUseCase = new ListSkillUseCase(repository);
const byCategoryUseCase = new ListSkillByCategoryUseCase(repository);
const categoriesUseCase = new ListSkillCategoriesUseCase(repository);
const getUseCase = new GetSkillUseCase(repository);
const createUseCase = new CreateSkillUseCase(repository);
const updateUseCase = new UpdateSkillUseCase(repository);
const deleteUseCase = new DeleteSkillUseCase(repository);

export class SkillController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = typeof req.query.category === 'string' ? req.query.category : undefined;
      const result = category
        ? await byCategoryUseCase.execute(category)
        : await listUseCase.execute();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async categories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({ success: true, data: await categoriesUseCase.execute() });
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
