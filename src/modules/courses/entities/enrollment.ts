import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from './courses.entity';
import { User } from 'src/modules/users/entities/user.entity';

@Entity({ name: 'enrollment' })
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Course, (course) => course.enrollment, {
    onDelete: 'SET NULL',
    nullable: false,
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @ManyToOne(() => User, (user) => user.enrollment, {
    onDelete: 'SET NULL',
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt: Date;
}
