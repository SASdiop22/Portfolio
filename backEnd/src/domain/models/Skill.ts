export class Skill {
  constructor(
    public id: string,
    public title: string,
    public category: string, 
    public order: number = 0,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}
}
