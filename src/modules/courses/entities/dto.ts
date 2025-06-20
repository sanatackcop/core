import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDefined,
  IsEnum,
  IsLowercase,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { MaterialType } from './material-mapper';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { LinkQuiz } from './quiz.entity';
import { LinkVideo } from './video.entity';
import { LinkResource } from './resource.entity';

export enum Level {
  'BEGINNER' = 'BEGINNER',
  'INTERMEDIATE' = 'INTERMEDIATE',
  'ADVANCED' = 'ADVANCED',
}

export interface CreateResourceDto {
  id?: string;
  title: string;
  description?: string;
  type: 'video' | 'document' | 'link' | 'code';
  url?: string;
  content?: string;
  isExisting?: boolean;
}

export interface VideoInput {
  url: string;
}

export interface CreateQuizDto {
  id?: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  isExisting?: boolean;
}

export interface CreateLessonDto {
  id?: string;
  name: string;
  description?: string;
  order: number;
  videos?: VideoInput[];
  resources?: CreateResourceDto[];
  quizzes?: CreateQuizDto[];
  isExisting?: boolean;
}

export interface CreateModuleDto {
  id?: string;
  title: string;
  lessons: CreateLessonDto[];
  isExisting?: boolean;
}

export class CourseInfoDto {
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsArray()
  @IsString({ each: true })
  prerequisites: string[];

  @IsArray()
  @IsString({ each: true })
  new_skills_result: string[];

  @IsObject()
  learning_outcome: { [key: string]: number };
}

export class CreateNewCourseDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsEnum(Level)
  level: Level;

  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @ApiProperty()
  @Type(() => CourseInfoDto)
  course_info?: CourseInfoDto;

  @IsNotEmpty()
  @IsBoolean()
  isPublish: boolean;
}

export interface CoursesReport {
  completedCourses: number;
  totalHours: number;
  streakDays: number;
  certifications: number;
}

export class CreateRoadmapDto {
  title: string;
  description?: string;
  existingCourseIds?: string[];
  newCourses?: CreateNewCourseDto[];
}

export class CreateCareerPathDto {
  title: string;
  description: string;
  existingRoadmapIds?: string[];
  newRoadmaps?: CreateRoadmapDto[];
}

export class CareerPathContext {
  id: string;
  title: string;
  description?: string;
}

export interface CoursesContext {
  id: string;
  title: string;
  description: string;
  level: Level;
  course_info: {
    durationHours: number;
    tags: string[];
    new_skills_result: string[];
    learning_outcome: { [key: string]: number };
    prerequisites: string[];
  };
  projectsCount: number;
  isPublished: boolean;
  isEnrolled: boolean;
  enrolledCount: number;
  completionRate: number;
  progress?: number;
  current_material?: string;
}
export interface CourseDetails extends CoursesContext {
  modules: ModuleDetails[];
}

export interface ModuleDetails {
  id: string;
  title: string;
  lessons: LessonDetails[];
}

export declare type Material = LinkResource | LinkVideo | LinkQuiz;

export interface LessonDetails {
  id: string;
  name: string;
  description?: string;
  order: number;
  materials: Material[];
}

export class ModuleDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;
}
export class LessonDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;
}

export class MaterialLessonMapDto {
  @IsNotEmpty()
  @IsUUID('4')
  lesson_id: string;

  @IsNotEmpty()
  @IsUUID('4')
  material_id: string;

  @IsNotEmpty({ message: 'نوع المورد مطلوب' })
  @IsLowercase()
  @IsEnum(MaterialType, { message: 'نوع المورد غير صالح' })
  type: MaterialType;

  @IsNotEmpty()
  @IsNumber()
  order: number;
}

export class ModuleLessonDto {
  @IsNotEmpty()
  @IsUUID('4')
  lesson_id: string;

  @IsNotEmpty()
  @IsNumber()
  order: number;
}

export class CourseModuleDto {
  @IsNotEmpty()
  @IsUUID('4')
  module_id: string;

  @IsNotEmpty()
  @IsNumber()
  order: number;
}

export class ResourceDto {
  @IsNotEmpty({ message: 'العنوان مطلوب' })
  @IsString()
  title: string;

  @IsString()
  description?: string;

  @IsNotEmpty({ message: 'نوع المورد مطلوب' })
  @IsLowercase()
  @IsEnum(MaterialType, { message: 'نوع المورد غير صالح' })
  type: MaterialType;

  @IsUrl({}, { message: 'الرابط غير صالح' })
  url?: string;

  @IsString()
  content?: string;
}

export class QuizDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsNotEmpty()
  correctAnswer: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  explanation?: string;

  @IsArray()
  @ArrayMinSize(4)
  @ArrayMaxSize(4)
  @IsString({ each: true }) // validate that each element is a string
  options: string[];

  @IsNumber({}, { message: 'المدة يجب أن تكون رقمًا' })
  @Min(0, { message: 'المدة يجب أن تكون رقمًا موجبًا' })
  duration: number;
}

export class VideoDto {
  @IsNotEmpty({ message: 'رابط الفيديو مطلوب' })
  @IsUrl({}, { message: 'رابط YouTube غير صالح' })
  youtubeId: string; // full embed URL expected

  @IsNotEmpty({ message: 'العنوان مطلوب' })
  @IsString({ message: 'العنوان يجب أن يكون نصًا' })
  title: string;

  @IsOptional()
  @IsString({ message: 'الوصف يجب أن يكون نصًا' })
  description?: string;

  @IsNumber({}, { message: 'المدة يجب أن تكون رقمًا' })
  @Min(0, { message: 'المدة يجب أن تكون رقمًا موجبًا' })
  duration: number;
}

export interface User {
  id: string;
}

export interface RequestType {
  user: User;
}

export class RoadmapDetails {
  id: string;
  title: string;
  description?: string;
  courses: CourseDetails[];
  isEnrolled?: boolean;
}

export class CareerPathDetails extends CareerPathContext {
  roadmaps: RoadmapDetails[];
  isEnrolled?: boolean;
}
