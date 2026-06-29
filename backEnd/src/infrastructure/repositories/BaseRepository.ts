import { Repository, ObjectLiteral, FindOptionsWhere, DeepPartial } from 'typeorm';

export abstract class BaseRepository<TModel, TEntity extends ObjectLiteral> {
  constructor(protected readonly repository: Repository<TEntity>) {}

  protected abstract toModel(entity: TEntity): TModel;

  async findAll(): Promise<TModel[]> {
    const entities = await this.repository.find();
    return entities.map((entity) => this.toModel(entity));
  }

  async findById(id: string): Promise<TModel | null> {
    const entity = await this.repository.findOne({
      where: { id } as unknown as FindOptionsWhere<TEntity>,
    });
    return entity ? this.toModel(entity) : null;
  }

  async create(data: Partial<TModel>): Promise<TModel> {
    const entity = this.repository.create(data as unknown as DeepPartial<TEntity>);
    const saved = await this.repository.save(entity);
    return this.toModel(saved);
  }

  async update(id: string, data: Partial<TModel>): Promise<TModel | null> {
    await this.repository.update(id, data as unknown as Partial<TEntity>);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
