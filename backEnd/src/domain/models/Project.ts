export class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public longDescription?: string,
    public technologies: string[], // ["React", "Node.js", "PostgreSQL"]
    public imageUrl?: string,
    public demoUrl?: string,
    public githubUrl?: string,
    public featured: boolean = false,
    public order: number = 0,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}
}
