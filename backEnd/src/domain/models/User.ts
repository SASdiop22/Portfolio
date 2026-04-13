export class User {
  constructor(
    public id: string,
    public firstName: string,
    public lastName: string,
    public email: string,
    public password: string,
    public birthDate: Date,
    public desiredPosition: string,
    public tagline: string,
    public photo?: string,
    // Informations de contact
    public city?: string,
    public mobility?: string,
    public phone?: string,
    // Dates
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}
}
