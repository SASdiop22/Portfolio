export class ContactMessage {
  constructor(
    public id: string,
    public name: string,
    public email: string,
    public subject: string,
    public message: string,
    public read: boolean = false,
    public createdAt: Date = new Date()
  ) {}
}

