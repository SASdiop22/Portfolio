export class Skill {
  constructor(
    public id: string,
    public title: string,
    public category: string, // "Langages", "Frameworks", "Outils", "Bases de données", etc.
    public level?: number, // 0-100 (optionnel)
    public icon?: string,
    public order: number = 0,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}
}
