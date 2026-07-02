import { ContactMessageModel } from '@domain/models/ContactMessage';

export interface IContactMessageLister {
  findAll(): Promise<ContactMessageModel[]>;
}

export class ListContactMessageUseCase {
  constructor(private readonly repository: IContactMessageLister) {}

  async execute(): Promise<ContactMessageModel[]> {
    return this.repository.findAll();
  }
}
