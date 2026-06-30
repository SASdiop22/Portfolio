import { ContactMessageModel } from '@domain/models/ContactMessage';
import { CreateContactMessageDto } from '@infrastructure/dto/contact-message/CreateContactMessageDto';

export interface IContactMessageCreator {
  create(data: Partial<ContactMessageModel>): Promise<ContactMessageModel>;
}

export class CreateContactMessageUseCase {
  constructor(private readonly repository: IContactMessageCreator) {}

  async execute(data: CreateContactMessageDto): Promise<ContactMessageModel> {
    return this.repository.create(data);
  }
}
