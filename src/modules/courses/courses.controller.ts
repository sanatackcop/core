import {
  Controller,
  Get,
  HttpException,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { CoursesService } from './services/courses.service';
import { CoursesContext } from './entities/dto';
import { Request } from 'express';
import RoadMapService from './services/roadmap.service';
import CareerPathService from './services/career.path.service';

@Controller('courses')
export class CoursesController {
  constructor(
    private readonly courseService: CoursesService,
    private readonly roadMapService: RoadMapService,
    private readonly careerPathService: CareerPathService
  ) {}

  @Get('/')
  async getAllCourses(
    @Query('user_id') user_id: string
  ): Promise<CoursesContext[]> {
    try {
      return await this.courseService.getAll(user_id);
    } catch (error: unknown) {
      console.log({ error });
      throw new HttpException(error, 500);
    }
  }

  @Get('/list')
  async getAllCourseDetails(
    @Query('user_id') user_id: string
  ): Promise<CoursesContext[]> {
    try {
      return await this.courseService.list(user_id);
    } catch (error: unknown) {
      throw new HttpException(error, 500);
    }
  }

  @Get('/current')
  async getCurrent(@Req() req: Request) {
    try {
      const userId = req.headers.user_id as string;
      return await this.courseService.getCurrentCoursesForUser(userId);
    } catch (error: unknown) {
      console.log(error);
    }
  }

  @Get('/report')
  async getCoursesReport(@Req() req: Request) {
    try {
      const userId = req.headers.user_id as string;
      const [completedCourses, totalHours, streakDays] = await Promise.all([
        this.courseService.countCompletedCourses(userId),
        this.courseService.getCompletedHours(userId),
        this.courseService.getStreak(userId),
      ]);
      return { completedCourses, totalHours, streakDays, certifications: 0 };
    } catch (error: unknown) {
      throw new HttpException(error, 500);
    }
  }

  @Get('/:course_id')
  async getCourseDetails(
    @Param('course_id') course_id: string,
    @Query('user_id') user_id: string
  ) {
    try {
      return await this.courseService.courseDetails(course_id, user_id);
    } catch (error: unknown) {
      console.log({ error });
      throw new HttpException(error, 500);
    }
  }

  @Get('roadmap/:id')
  async getRoadmapDetails(@Req() req: Request, @Param('id') id: string) {
    try {
      const userId = req.headers.user_id as string;
      return await this.roadMapService.roadmapDetailsUser(id, userId);
    } catch (error: unknown) {
      console.log({ error });
      throw new HttpException(error, 500);
    }
  }

  @Get('careerpath/:id')
  async getCareerPathDetails(@Req() req: Request, @Param('id') id: string) {
    try {
      const userId = req.headers.user_id as string;
      return this.careerPathService.careerPathDetailsUser(id, userId);
    } catch (error: unknown) {
      console.log({ error });
      throw new HttpException(error, 500);
    }
  }

  @Post('/enroll/:courseId')
  async enrollInCourse(
    @Req() req: Request,
    @Param('courseId') courseId: string
  ) {
    try {
      const userId = req.headers.user_id as string;
      return await this.courseService.enrollingCourse(userId, courseId);
    } catch (error: unknown) {
      console.log(error);
      throw new HttpException({ message: error }, 500);
    }
  }

  @Post('/enroll/roadmap/:roadmapId')
  async enrollInRoadmap(
    @Req() req: Request,
    @Param('roadmapId') roadmapId: string
  ) {
    try {
      const userId = req.headers.user_id as string;
      return await this.roadMapService.enrollingRoadmap(userId, roadmapId);
    } catch (error: unknown) {
      console.log(error);
      throw new HttpException({ message: error }, 500);
    }
  }

  @Post('/enroll/careerpath/:careerpathId')
  async enrollInCareerPath(
    @Req() req: Request,
    @Param('careerpathId') courseId: string
  ) {
    try {
      const userId = req.headers.user_id as string;
      return await this.careerPathService.enrollinCareerpath(userId, courseId);
    } catch (error: unknown) {
      console.log(error);
      throw new HttpException({ message: error }, 500);
    }
  }

  @Get('/progress/:courseId')
  get(@Query('user_id') user_id: string, @Param('courseId') courseId: string) {
    return {
      progress: this.courseService.getProgressCourses(user_id, courseId),
    };
  }

  @Patch('/progress/:courseId/:materialId')
  async update(
    @Param('courseId') courseId: string,
    @Param('materialId') materialId: string,
    @Query('user_id') userId: string
  ) {
    await this.courseService.increaseProgress(userId, courseId, materialId);
    return { success: true };
  }

  @Get('/list/careerpath')
  async getAllCareerPaths() {
    try {
      return await this.careerPathService.listCareerPaths();
    } catch (error: unknown) {
      throw new HttpException(error, 500);
    }
  }

  @Get('/list/roadmap')
  async getAllRoadmaps() {
    try {
      return await this.roadMapService.listRoadmaps();
    } catch (error: unknown) {
      throw new HttpException(error, 500);
    }
  }
}
