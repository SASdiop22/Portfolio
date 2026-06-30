import { CreateStrengthUseCase } from './CreateStrengthUseCase';
import { StrengthModel } from '@domain/models/Strength';

interface IStrengthCreator {
  create(data: Partial<StrengthModel>): Promise<StrengthModel>;
}

describe('CreateStrengthUseCase', () => {
  it('creates and returns the new entry', async () => {
    const created = new StrengthModel();
    const repository: IStrengthCreator = { create: jest.fn().mockResolvedValue(created) };
    const sut = new CreateStrengthUseCase(repository);
    const input = { title: 'Adaptability', description: 'desc' };

    const result = await sut.execute(input);

    expect(repository.create).toHaveBeenCalledWith(input);
    expect(result).toBe(created);
  });
});
