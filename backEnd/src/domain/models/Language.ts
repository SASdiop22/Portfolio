export class Language {
  constructor(
    public id: string,
    public title: string,
    public level: string, // "Natif", "Courant", "Intermédiaire", "Débutant", "A1", "B2", "C1", etc.
    public order: number = 0,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}
}
