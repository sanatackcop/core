import { Column, Entity, JoinColumn, ManyToOne, Relation } from 'typeorm';
import AbstractEntity from '@libs/db/abstract.base.entity';
import { MaterialType } from './material-mapper';
import QuizGroup from './quiz.group.entity';

export declare type LinkQuiz = Quiz & {
  order: number;
  type: MaterialType.QUIZ;
};

@Entity({ name: 'quiz' })
export default class Quiz extends AbstractEntity {
  @Column({ nullable: false })
  question: string;

  @Column({ type: 'jsonb', nullable: false })
  options: string[];

  @Column({ nullable: false })
  correctAnswer: string;

  @Column({ type: 'text', nullable: true })
  explanation: string;

  @Column({ default: 0 })
  order: number;

  @ManyToOne(() => QuizGroup, (QuizGroup) => QuizGroup.quizzes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'quiz_group_id' })
  quizGroup: Relation<QuizGroup>;
}
