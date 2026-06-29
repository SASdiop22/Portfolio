import { BaseRepository } from './BaseRepository';
import { Repository } from 'typeorm';

interface FakeEntity {
  id: string;
  title: string;
}

interface FakeModel {
  id: string;
  title: string;
}

class TestRepository extends BaseRepository<FakeModel, FakeEntity> {
  protected toModel(entity: FakeEntity): FakeModel {
    return { id: entity.id, title: entity.title };
  }
}

function fakeRepository() {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
}

describe('BaseRepository', () => {
  it('findAll maps every entity through toModel', async () => {
    const repo = fakeRepository();
    repo.find.mockResolvedValue([{ id: '1', title: 'A' }, { id: '2', title: 'B' }]);
    const sut = new TestRepository(repo as unknown as Repository<FakeEntity>);

    const result = await sut.findAll();

    expect(result).toEqual([{ id: '1', title: 'A' }, { id: '2', title: 'B' }]);
  });

  it('findById returns null when nothing is found', async () => {
    const repo = fakeRepository();
    repo.findOne.mockResolvedValue(null);
    const sut = new TestRepository(repo as unknown as Repository<FakeEntity>);

    const result = await sut.findById('missing');

    expect(result).toBeNull();
  });

  it('findById maps the found entity through toModel', async () => {
    const repo = fakeRepository();
    repo.findOne.mockResolvedValue({ id: '1', title: 'A' });
    const sut = new TestRepository(repo as unknown as Repository<FakeEntity>);

    const result = await sut.findById('1');

    expect(result).toEqual({ id: '1', title: 'A' });
  });

  it('create saves the entity and returns the mapped model', async () => {
    const repo = fakeRepository();
    repo.create.mockReturnValue({ id: '1', title: 'A' });
    repo.save.mockResolvedValue({ id: '1', title: 'A' });
    const sut = new TestRepository(repo as unknown as Repository<FakeEntity>);

    const result = await sut.create({ title: 'A' });

    expect(repo.create).toHaveBeenCalledWith({ title: 'A' });
    expect(repo.save).toHaveBeenCalledWith({ id: '1', title: 'A' });
    expect(result).toEqual({ id: '1', title: 'A' });
  });

  it('update updates then returns the re-fetched mapped model', async () => {
    const repo = fakeRepository();
    repo.update.mockResolvedValue({ affected: 1 });
    repo.findOne.mockResolvedValue({ id: '1', title: 'Updated' });
    const sut = new TestRepository(repo as unknown as Repository<FakeEntity>);

    const result = await sut.update('1', { title: 'Updated' });

    expect(repo.update).toHaveBeenCalledWith('1', { title: 'Updated' });
    expect(result).toEqual({ id: '1', title: 'Updated' });
  });

  it('update returns null when the entity no longer exists after updating', async () => {
    const repo = fakeRepository();
    repo.update.mockResolvedValue({ affected: 0 });
    repo.findOne.mockResolvedValue(null);
    const sut = new TestRepository(repo as unknown as Repository<FakeEntity>);

    const result = await sut.update('missing', { title: 'X' });

    expect(result).toBeNull();
  });

  it('delete returns true when a row was affected', async () => {
    const repo = fakeRepository();
    repo.delete.mockResolvedValue({ affected: 1 });
    const sut = new TestRepository(repo as unknown as Repository<FakeEntity>);

    const result = await sut.delete('1');

    expect(result).toBe(true);
  });

  it('delete returns false when no row was affected', async () => {
    const repo = fakeRepository();
    repo.delete.mockResolvedValue({ affected: 0 });
    const sut = new TestRepository(repo as unknown as Repository<FakeEntity>);

    const result = await sut.delete('missing');

    expect(result).toBe(false);
  });
});
