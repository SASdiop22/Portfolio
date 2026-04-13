export class Experience {
  constructor(
    public id: string,
    public company: string,
    public position: string,
    public city: string,
    public title: string,
    public description: string,
    public startDate: Date,
    public endDate?: Date,
    public current: boolean = false,
    public link?: string, // Lien vers repo ou site
    public order: number = 0,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}
}
