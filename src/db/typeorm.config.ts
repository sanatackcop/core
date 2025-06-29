import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { migrationFiles } from './migrations';
import User from 'src/modules/users/entities/user.entity';
import { Course } from 'src/modules/courses/entities/courses.entity';
import { Module } from 'src/modules/courses/entities/module.entity';
import { CourseMapper } from 'src/modules/courses/entities/courses-maper.entity';
import LessonMapper from 'src/modules/courses/entities/lessons-maper.entity';
import { Lesson } from 'src/modules/courses/entities/lessons.entity';
import Quiz from 'src/modules/courses/entities/quiz.entity';
import Video from 'src/modules/courses/entities/video.entity';
import { Enrollment } from 'src/modules/courses/entities/enrollment';
import MaterialMapper from 'src/modules/courses/entities/material-mapper';
import { CareerPath } from 'src/modules/courses/entities/career-path.entity';
import { RoadMap } from 'src/modules/courses/entities/roadmap.entity';
import { CareerPathMapper } from 'src/modules/courses/entities/career-mapper.entity';
import { RoadmapMapper } from 'src/modules/courses/entities/roadmap-mapper.entity';
import { CareerEnrollment } from 'src/modules/courses/entities/career-enrollment.entity';
import { RoadmapEnrollment } from 'src/modules/courses/entities/roadmap-enrollment.entity';
import UsersAttributes from 'src/modules/users/entities/user.attributes.entity';
import { Otps } from 'src/modules/auth/entities/otp.entity';
import { Attempts } from 'src/modules/auth/entities/attempts.entity';
import Article from 'src/modules/courses/entities/article.entity';
import QuizGroup from 'src/modules/courses/entities/quiz.group.entity';

config();

const cfg = new ConfigService();

export const entities = [
  User,
  UsersAttributes,
  Otps,
  Attempts,
  Course,
  Module,
  CourseMapper,
  LessonMapper,
  Lesson,
  Quiz,
  QuizGroup,
  Video,
  Enrollment,
  MaterialMapper,
  CareerPath,
  RoadMap,
  CareerPathMapper,
  RoadmapMapper,
  CareerEnrollment,
  RoadmapEnrollment,
  Article,
];

const mainDataSource = new DataSource({
  type: 'postgres',
  host: cfg.get('MAIN_DB_HOST'),
  port: Number(cfg.get('MAIN_DB_PORT')),
  username: cfg.get('MAIN_DB_USERNAME'),
  password: cfg.get('MAIN_DB_PASSWORD'),
  database: cfg.get('MAIN_DB'),
  ssl: cfg.get('MAIN_DB_SSL') == 'true',
  entities: entities,
  logging: false,
  migrations: migrationFiles,
  migrationsRun: true,
  migrationsTableName: 'migrations',
});

export default mainDataSource;
