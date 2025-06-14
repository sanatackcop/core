import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { Module } from './module.entity';
import { Lesson } from './lessons.entity';
import AbstractEntity from '@libs/db/abstract.base.entity';

@Entity('lesson_mapper')
export default class LessonMapper extends AbstractEntity {
  @ManyToOne(() => Module, (module) => module.lessonMappers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'module_id' })
  module: Module;

  @ManyToOne(() => Lesson, (lesson) => lesson.lessonMapper, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @Column({ type: 'int' })
  order: number;
}
