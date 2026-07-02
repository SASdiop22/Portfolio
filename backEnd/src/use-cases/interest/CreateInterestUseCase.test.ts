import { CreateInterestUseCase } from './CreateInterestUseCase';
import { InterestModel } from '@domain/models/Interest';

interface IInterestCreator {
  create(data: Partial<InterestModel>): Promise<InterestModel>;
}

describe('CreateInterestUseCase', () => {
  it('creates and returns the new entry', async () => {
    const created = new InterestModel();
    const repository: IInterestCreator = { create: jest.fn().mockResolvedValue(created) };
    const sut = new CreateInterestUseCase(repository);
    const input = { title: 'Chess', description: 'desc' };

    const result = await sut.execute(input);

    expect(repository.create).toHaveBeenCalledWith(input);
    expect(result).toBe(created);
  });
});
