import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@infrastructure/database/config/data-source';
import { NewsEntity } from '@infrastructure/entities/NewsEntity';
import { NewsRepository } from '@infrastructure/repositories/NewsRepository';
import { ListNewsUseCase } from '@use-cases/news/ListNewsUseCase';
import { ListNewsByCategoryUseCase } from '@use-cases/news/ListNewsByCategoryUseCase';
import { ListRecentNewsUseCase } from '@use-cases/news/ListRecentNewsUseCase';
import { GetNewsUseCase } from '@use-cases/news/GetNewsUseCase';
import { CreateNewsUseCase } from '@use-cases/news/CreateNewsUseCase';
import { UpdateNewsUseCase } from '@use-cases/news/UpdateNewsUseCase';
import { DeleteNewsUseCase } from '@use-cases/news/DeleteNewsUseCase';

const repository = new NewsRepository(AppDataSource.getRepository(NewsEntity));
const listUseCase = new ListNewsUseCase(repository);
const byCategoryUseCase = new ListNewsByCategoryUseCase(repository);
const recentUseCase = new ListRecentNewsUseCase(repository);
const getUseCase = new GetNewsUseCase(repository);
const createUseCase = new CreateNewsUseCase(repository);
const updateUseCase = new UpdateNewsUseCase(repository);
const deleteUseCase = new DeleteNewsUseCase(repository);

export class NewsController {
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

  static async recent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit, 10) : 5;
      res.status(200).json({ success: true, data: await recentUseCase.execute(limit) });
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
