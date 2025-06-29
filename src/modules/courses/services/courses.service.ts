import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { Course } from '../entities/courses.entity';
import {
  CourseDetails,
  CoursesContext,
  CreateNewCourseDto,
  ModuleDetails,
  UpdateCourseDto,
} from '../entities/dto';
import UsersService from 'src/modules/users/users.service';
import EnrollmentService from './enrollment.service';
import ModuleService from './module.service';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly moduleService: ModuleService,
    private readonly userService: UsersService,
    private readonly enrollmentService: EnrollmentService
  ) {}

  create(course: CreateNewCourseDto): Promise<Course> {
    return this.courseRepository.save(
      this.courseRepository.create({
        title: course.title,
        description: course.description,
        level: course.level,
        topic: course.topic,
        course_info: course.course_info,
        isPublished: course.isPublish,
        material_count: 0,
      })
    );
  }

  findOne(id: string) {
    return this.courseRepository.findOne({
      where: { id: Equal(id) },
    });
  }

  findModuleById(id: string) {
    return this.moduleService.findOne(id);
  }

  async getAll(user_id: string): Promise<CoursesContext[]> {
    const courses = await this.courseRepository.find();
    const enrollments = await this.enrollmentService.findCurrentCoursesForUser(
      user_id,
      { course: true }
    );

    const enrolledCourseIds = new Set(enrollments.map((e) => e.course.id));

    return courses.map((course) => ({
      ...course,
      course_info: {
        ...course.course_info,
        durationHours: Math.floor(course.course_info.durationHours / 60 / 60),
      },
      isEnrolled: enrolledCourseIds.has(course.id),
      enrollment: enrollments.find((e) => e.course.id === course.id) || null,
      projectsCount: 0,
      completionRate:
        course.completionCount && course.enrolledCount
          ? (course.completionCount / course.enrolledCount) * 100
          : 0,
    }));
  }

  async list(userId: string): Promise<CoursesContext[]> {
    const courses = await this.courseRepository.find({
      order: { created_at: 'DESC' },
    });

    if (!courses || courses.length === 0) return [];

    return Promise.all(
      courses.map((course) => this.courseDetails(course.id, userId))
    );
  }

  async delete(courseId: string) {
    const result = await this.courseRepository.delete(courseId);
    if (result.affected === 0) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }
  }

  async updateCourse(courseId: string, dto: UpdateCourseDto) {
    const result = await this.courseRepository.update(courseId, dto);
    if (result.affected === 0) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }
    return result;
  }

  async getProgressCourses(userId: string, course_id: string): Promise<number> {
    const course = await this.courseRepository.findOneBy({
      id: course_id,
    });
    const getEnrollment = await this.enrollmentService.findOneByCourseAndUser(
      course.id,
      userId
    );
    return Math.floor(
      (getEnrollment.progress_counter / course.material_count) * 100
    );
  }

  async increaseProgress(
    userId: string,
    course_id: string,
    current_material_id: string
  ): Promise<void> {
    return await this.enrollmentService.updateProgressCount(
      userId,
      course_id,
      current_material_id
    );
  }

  async enrollingCourse(userId: string, courseId: string) {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });
    if (!course) {
      throw new Error('Course not found');
    }
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const enrollment = await this.enrollmentService.findOneByCourseAndUser(
      courseId,
      userId
    );
    if (enrollment) throw new Error('User is already enrolled in this course');

    await this.update(course.id, {
      enrolledCount: course.enrolledCount + 1,
    });
    return await this.enrollmentService.create(user, course);
  }

  async courseDetails(
    course_id: string,
    user_id: string
  ): Promise<CourseDetails> {
    const enrollment = await this.enrollmentService.findOneByCourseAndUser(
      course_id,
      user_id,
      {
        course: {
          courseMappers: {
            module: { lessonMappers: { lesson: { materialMapper: true } } },
          },
        },
      }
    );

    let course: Course;

    if (!enrollment)
      course = await this.courseRepository.findOne({
        where: { id: Equal(course_id) },
        relations: {
          courseMappers: {
            module: { lessonMappers: { lesson: { materialMapper: true } } },
          },
        },
      });
    else course = enrollment.course;

    if (!course)
      throw new HttpException('Course not found', HttpStatus.NOT_FOUND);

    return {
      ...course,
      course_info: {
        ...course.course_info,
        durationHours: Math.floor(course.course_info.durationHours / 60 / 60),
      },
      isEnrolled: false,
      projectsCount: 0,
      completionRate: course.completionCount
        ? (course.completionCount / course.enrolledCount) * 100
        : 0,
      modules: (
        await Promise.all(
          course.courseMappers.map(async (mapper) => {
            if (mapper.module)
              return await this.moduleService.getDetails(mapper.module);
          })
        )
      ).map((module) => {
        if (!module) return [] as unknown as ModuleDetails;
        const courseMapper = course.courseMappers.find(
          (mapper) => mapper.module.id === module.id
        );
        return { ...module, order: courseMapper.order };
      }),
      ...(() => {
        return enrollment
          ? {
              current_material: enrollment.current_material_id,
              isEnrolled: true,
              progress: Math.floor(
                (enrollment.progress_counter / course.material_count) * 100
              ),
            }
          : {};
      })(),
    };
  }

  update(course_id: string, course: Partial<Course>) {
    return this.courseRepository.update(course_id, course);
  }

  async getCurrentCoursesForUser(userId: string) {
    const currentCourses =
      await this.enrollmentService.findCurrentCoursesForUser(userId, {
        course: true,
      });

    return currentCourses.map((cc) => ({
      id: cc.course.id,
      title: cc.course.title,
      description: cc.course.description?.substring(0, 100),
      level: cc.course.level,
      isPublished: cc.course.isPublished,
      course_info: cc.course.course_info,
      created_at: cc.course.created_at,
      progress: Math.floor(
        (cc.progress_counter / cc.course.material_count) * 100
      ),
    }));
  }

  async countCompletedCourses(userId: string) {
    return await this.enrollmentService.getCompletedCoursesCount(userId);
  }

  async getCompletedHours(userId: string) {
    return await this.enrollmentService.getCompletedHours(userId);
  }

  async getStreak(userId: string) {
    return await this.enrollmentService.getStreak(userId);
  }
}
