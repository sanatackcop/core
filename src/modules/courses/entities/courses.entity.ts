import { Entity, Column, OneToMany } from 'typeorm';
import { CourseMapper } from './courses-maper.entity';
import { Enrollment } from './enrollment';
import { RoadmapMapper } from 'src/modules/courses/entities/roadmap-mapper.entity';
import AbstractEntity from '@libs/db/abstract.base.entity';

export enum Level {
  BEGINNER = 'مبتدئ',
  INTERMEDIATE = 'متوسط',
  ADVANCED = 'متقدم',
}

export enum CourseTopic {
  Artificial_Intelligence = 'ذكاء اصطناعي',
  MACHINE_LEARNING = 'تعلم الآلة',
  BACKEND = 'الخلفية',
  FRONTEND = 'الواجهة الأمامية',
}

@Entity({ name: 'courses' })
export class Course extends AbstractEntity {
  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  level: Level;

  @Column({ type: 'jsonb' })
  course_info: {
    durationHours: number;
    tags: string[];
    new_skills_result: string[];
    learning_outcome: { [key: string]: number };
    prerequisites: string[];
  };

  @Column({ type: 'varchar' })
  topic: CourseTopic;

  @Column({ default: 0 })
  material_count: number;

  @Column({ default: 0 })
  enrolledCount: number;

  @Column({ default: 0 })
  completionCount: number;

  @Column({ default: false })
  isPublished: boolean;

  @OneToMany(() => CourseMapper, (mapper) => mapper.course)
  courseMappers: CourseMapper[];

  @OneToMany(() => Enrollment, (course) => course.course)
  enrollment: Enrollment[];

  @OneToMany(() => RoadmapMapper, (mapper) => mapper.course)
  roadmapMappers: RoadmapMapper[];
}
