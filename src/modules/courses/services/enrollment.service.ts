import { Enrollment } from 'src/modules/courses/entities/enrollment';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Equal, FindOptionsRelations } from 'typeorm';
import User from 'src/modules/users/entities/user.entity';
import { Course } from '../entities/courses.entity';

@Injectable()
export default class EnrollmentService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>
  ) {}

  async create(user: User, course: Course) {
    return this.enrollmentRepo.save(
      this.enrollmentRepo.create({
        user,
        course,
        progress_counter: 0,
        is_finished: false,
      })
    );
  }

  async findOne(id: string) {
    return this.enrollmentRepo.findOne({
      where: { id: Equal(id) },
    });
  }

  async updateProgressCount(
    userId: string,
    course_id: string,
    current_material_id: string
  ) {
    console.log({ userId, course_id, current_material_id });
    const enrollment = await this.enrollmentRepo.findOne({
      where: {
        course: { id: Equal(course_id) },
        user: { id: Equal(userId) },
      },
      relations: { course: true },
    });
    if (!enrollment) throw new Error('Enrollment not found');

    if (enrollment.progress_counter + 1 <= enrollment.course.material_count)
      await this.enrollmentRepo.update(enrollment.id, {
        progress_counter: enrollment.progress_counter + 1,
        current_material_id,
      });
    else if (!enrollment.is_finished) {
      await this.enrollmentRepo.update(enrollment, {
        is_finished: true,
      });
    }
  }

  async findOneByCourseAndUser(
    course_id: string,
    user_id: string,
    relations?: FindOptionsRelations<Enrollment>
  ) {
    return this.enrollmentRepo.findOne({
      where: { course: { id: Equal(course_id) }, user: { id: Equal(user_id) } },
      relations,
    });
  }

  findCurrentCoursesForUser(
    user_id: string,
    relations?: FindOptionsRelations<Enrollment>
  ) {
    return this.enrollmentRepo.find({
      where: { user: { id: Equal(user_id) }, is_finished: false },
      relations,
    });
  }

  async getCompletedCoursesCount(user_id: string) {
    return this.enrollmentRepo.count({
      where: { user: { id: Equal(user_id) }, is_finished: true },
    });
  }

  async getCompletedHours(user_id: string): Promise<number> {
    const enrollments = await this.enrollmentRepo
      .createQueryBuilder('enrollment')
      .innerJoinAndSelect('enrollment.course', 'course')
      .innerJoin('enrollment.user', 'user')
      .where('user.id = :userId', { userId: user_id })
      .getMany();

    let totalHours = 0;

    for (const enrollment of enrollments) {
      const duration = enrollment.course.course_info.durationHours ?? 0;
      const totalMaterials = enrollment.course.material_count ?? 0;
      const progressDone = enrollment.progress_counter ?? 0;

      if (enrollment.is_finished) {
        totalHours += duration / 60 / 60;
      } else if (duration > 0 && totalMaterials > 0) {
        const progressRatio = progressDone / totalMaterials;
        totalHours += (duration / 60 / 60) * progressRatio;
      }
    }
    return Math.floor(totalHours);
  }

  async getStreak(userId: string): Promise<number> {
    const rawDates = await this.enrollmentRepo
      .createQueryBuilder('enrollment')
      .leftJoin('enrollment.user', 'user')
      .select("date_trunc('day', enrollment.updated_at)", 'day')
      .where('user.id = :userId', { userId })
      .andWhere("enrollment.updated_at >= CURRENT_DATE - INTERVAL '6 days'")
      .groupBy('day')
      .orderBy('day', 'DESC')
      .getRawMany();

    const activityDates: Date[] = rawDates.map((date) => new Date(date.day));
    if (activityDates.length === 0) return 0;

    let streak = 0;
    const current = new Date();
    current.setHours(0, 0, 0, 0);

    for (const day of activityDates) {
      const streakDay = new Date(day);
      streakDay.setHours(0, 0, 0, 0);

      if (streakDay.getTime() === current.getTime()) {
        streak++;
        current.setDate(current.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }
}
