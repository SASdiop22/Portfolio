import { CreateEducationUseCase } from './CreateEducationUseCase';
import { EducationModel } from '@domain/models/Education';

interface ICreator {
  create(data: Partial<EducationModel>): Promise<EducationModel>;
}

describe('CreateEducationUseCase', () => {
  it('creates and returns the new entry', async () => {
    const created = new EducationModel();
    const repository: ICreator = { create: jest.fn().mockResolvedValue(created) };
    const sut = new CreateEducationUseCase(repository);
    const input = { institution: 'MIT', city: 'Cambridge', title: 'BSc', specialization: 'CS', description: 'desc', startDate: '2020-01-01' };

    const result = await sut.execute(input);

    expect(repository.create).toHaveBeenCalledWith(input);
    expect(result).toBe(created);
  });
});
