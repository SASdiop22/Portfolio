export class Strength {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public order: number = 0,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}
}

