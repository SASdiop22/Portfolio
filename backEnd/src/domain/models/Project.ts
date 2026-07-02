export class ProjectModel {
  public id: string;
  public title: string;
  public description: string;
  public longDescription: string;
  public technologies: string[];
  public imageUrl: string;
  public demoUrl: string;
  public githubUrl: string;
  public featured: boolean;
  public order: number;
  public createdAt: Date;
  public updatedAt: Date;
}
