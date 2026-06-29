import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '@infrastructure/database/config/data-source';
import { ProjectEntity } from '@infrastructure/entities/ProjectEntity';
import { ProjectRepository } from '@infrastructure/repositories/ProjectRepository';
import { ListProjectUseCase } from '@use-cases/project/ListProjectUseCase';
import { ListFeaturedProjectUseCase } from '@use-cases/project/ListFeaturedProjectUseCase';
import { GetProjectUseCase } from '@use-cases/project/GetProjectUseCase';
import { CreateProjectUseCase } from '@use-cases/project/CreateProjectUseCase';
import { UpdateProjectUseCase } from '@use-cases/project/UpdateProjectUseCase';
import { DeleteProjectUseCase } from '@use-cases/project/DeleteProjectUseCase';

const repository = new ProjectRepository(AppDataSource.getRepository(ProjectEntity));
const listUseCase = new ListProjectUseCase(repository);
const featuredUseCase = new ListFeaturedProjectUseCase(repository);
const getUseCase = new GetProjectUseCase(repository);
const createUseCase = new CreateProjectUseCase(repository);
const updateUseCase = new UpdateProjectUseCase(repository);
const deleteUseCase = new DeleteProjectUseCase(repository);

export class ProjectController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = req.query.featured === 'true' ? await featuredUseCase.execute() : await listUseCase.execute();
      res.status(200).json({ success: true, data: result });
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
