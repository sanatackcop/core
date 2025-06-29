import { Column, Entity, OneToMany } from 'typeorm';
import { CourseMapper } from './courses-maper.entity';
import LessonMapper from './lessons-maper.entity';
import AbstractEntity from '@libs/db/abstract.base.entity';

@Entity({ name: 'module' })
export class Module extends AbstractEntity {
  @Column({ nullable: false })
  title: string;

  @Column()
  description: string;

  @Column()
  duration: number;

  @OneToMany(() => CourseMapper, (mapper) => mapper.module)
  courseMappers: CourseMapper[];

  @OneToMany(() => LessonMapper, (mapper) => mapper.module)
  lessonMappers: LessonMapper[];
}
