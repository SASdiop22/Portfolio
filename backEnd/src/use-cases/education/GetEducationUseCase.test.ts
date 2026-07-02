import { GetEducationUseCase } from './GetEducationUseCase';
import { IEducationRepository } from '@domain/interfaces/IEducationRepository';
import { EducationModel } from '@domain/models/Education';
import { NotFoundException } from '@shared/exceptions/NotFoundException';

interface FullEducationRepository extends IEducationRepository {
  findById(id: string): Promise<EducationModel | null>;
}

describe('GetEducationUseCase', () => {
  it('returns the entry when it exists', async () => {
    const entry = new EducationModel();
    const repository = {
      findById: jest.fn().mockResolvedValue(entry),
    } as unknown as FullEducationRepository;
    const sut = new GetEducationUseCase(repository);

    const result = await sut.execute('1');

    expect(result).toBe(entry);
  });

  it('throws NotFoundException when the entry does not exist', async () => {
    const repository = {
      findById: jest.fn().mockResolvedValue(null),
    } as unknown as FullEducationRepository;
    const sut = new GetEducationUseCase(repository);

    await expect(sut.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
