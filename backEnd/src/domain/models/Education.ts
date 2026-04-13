export class Education {
  constructor(
    public id: string,
    public institution: string, // Université
    public city: string,
    public title: string,
    public specialization: string,
    public description: string,
    public startDate: Date,
    public endDate?: Date,
    public current: boolean = false,
    public order: number = 0,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}
}
