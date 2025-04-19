import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CourseMapper } from './courses-maper.entity';
import { LessonMapper } from './lessons-maper.entity';

@Entity({ name: 'module' })
export class Module {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  title: string;

  @OneToMany(() => CourseMapper, (mapper) => mapper.module)
  courseMappers: CourseMapper[];

  @OneToMany(() => LessonMapper, (mapper) => mapper.module)
  lessonMappers: LessonMapper[];
}
