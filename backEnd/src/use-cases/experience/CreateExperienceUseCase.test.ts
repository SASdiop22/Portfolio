import { CreateExperienceUseCase } from './CreateExperienceUseCase';
import { ExperienceModel } from '@domain/models/Experience';

interface IExperienceCreator {
  create(data: Partial<ExperienceModel>): Promise<ExperienceModel>;
}

describe('CreateExperienceUseCase', () => {
  it('creates and returns the new entry', async () => {
    const created = new ExperienceModel();
    const repository: IExperienceCreator = { create: jest.fn().mockResolvedValue(created) };
    const sut = new CreateExperienceUseCase(repository);
    const input = { company: 'Acme', position: 'Dev', city: 'Paris', title: 'Dev', description: 'desc', startDate: '2020-01-01' };

    const result = await sut.execute(input);

    expect(repository.create).toHaveBeenCalledWith(input);
    expect(result).toBe(created);
  });
});
