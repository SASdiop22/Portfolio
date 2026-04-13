export class SocialLink {
  constructor(
    public id: string,
    public platform: string, // "GitHub", "LinkedIn", "Twitter", etc.
    public url: string,
    public logo?: string,
    public order: number = 0,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}
}
