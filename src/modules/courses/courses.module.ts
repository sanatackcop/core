import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { Course } from './entities/courses.entity';
import { CourseMapper } from './entities/courses-maper.entity';
import { LessonMapper } from './entities/lessons-maper.entity';
import { Lesson } from './entities/lessons.entity';
import { Quiz } from './entities/quiz.entity';
import { Resource } from './entities/resource.entity';
import { VideoResource } from './entities/video-lessons.entity';
import { Module as ModuleEntity } from './entities/module.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      ModuleEntity,
      CourseMapper,
      LessonMapper,
      Lesson,
      Resource,
      Quiz,
      VideoResource,
    ]),
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
