import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesController } from './courses.controller';
import { CoursesService } from './services/courses.service';
import { Course } from './entities/courses.entity';
import { CourseMapper } from './entities/courses-maper.entity';
import LessonMapper from './entities/lessons-maper.entity';
import { Lesson } from './entities/lessons.entity';
import Quiz from './entities/quiz.entity';
import Video from './entities/video.entity';
import { Module as ModuleEntity } from './entities/module.entity';
import { Enrollment } from './entities/enrollment';
import MaterialMapper from './entities/material-mapper';
import { CareerPath } from './entities/career-path.entity';
import { RoadMap } from './entities/roadmap.entity';
import { CareerPathMapper } from './entities/career-mapper.entity';
import { RoadmapMapper } from './entities/roadmap-mapper.entity';
import { CareerEnrollment } from './entities/career-enrollment.entity';
import { RoadmapEnrollment } from './entities/roadmap-enrollment.entity';
import User from '../users/entities/user.entity';
import QuizService from './services/quiz.service';
import VideoService from './services/video.service';
import CareerPathService from './services/career.path.service';
import RoadMapService from './services/roadmap.service';
import CareerEnrollmentService from './services/career.enrollment.service';
import UsersModule from '../users/users.module';
import EnrollmentService from './services/enrollment.service';
import RoadMapEnrollmentService from './services/roadmap.enrollment.service';
import ModuleService from './services/module.service';
import LessonService from './services/lesson.service';
import LessonMapperService from './services/lesson.mapper';
import MaterialMapperService from './services/material.mapper.service';
import CourseMapperService from './services/courses.mapper.service';
import QuizGroup from './entities/quiz.group.entity';
import QuizGroupService from './services/quiz.group.service';
import ArticleService from './services/article.service';
import Article from './entities/article.entity';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([
      Course,
      ModuleEntity,
      CourseMapper,
      LessonMapper,
      Lesson,
      Quiz,
      Video,
      Enrollment,
      MaterialMapper,
      CareerPath,
      RoadMap,
      CareerPathMapper,
      RoadmapMapper,
      CareerEnrollment,
      RoadmapEnrollment,
      User,
      QuizGroup,
      Article,
    ]),
  ],
  controllers: [CoursesController],
  providers: [
    CareerPathService,
    RoadMapService,
    CoursesService,
    QuizService,
    VideoService,
    CareerEnrollmentService,
    EnrollmentService,
    RoadMapEnrollmentService,
    ModuleService,
    LessonService,
    LessonMapperService,
    MaterialMapperService,
    CourseMapperService,
    QuizGroupService,
    ArticleService,
  ],
  exports: [
    CareerPathService,
    RoadMapService,
    CoursesService,
    QuizService,
    ArticleService,
    VideoService,
    LessonService,
    LessonMapperService,
    MaterialMapperService,
    ModuleService,
    CourseMapperService,
    QuizGroupService,
  ],
})
export class CoursesModule {}
