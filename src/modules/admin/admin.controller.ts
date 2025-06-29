import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CoursesService } from '../courses/services/courses.service';
import {
  ArticleDto,
  CourseModuleDto,
  CreateCareerPathDto,
  CreateNewCourseDto,
  CreateRoadmapDto,
  LessonDto,
  MaterialLessonMapDto,
  ModuleDto,
  ModuleLessonDto,
  QuizDto,
  // UpdateArticleDto,
  UpdateCourseDto,
  UpdateLessonDto,
  UpdateModuleDto,
  UpdateQuizDto,
  UpdateVideoDto,
  VideoDto,
} from '../courses/entities/dto';
import RoadMapService from '../courses/services/roadmap.service';
import CareerPathService from '../courses/services/career.path.service';
import VideoService from '../courses/services/video.service';
import LessonService from '../courses/services/lesson.service';
import LessonMapperService from '../courses/services/lesson.mapper';
import MaterialMapperService from '../courses/services/material.mapper.service';
import ModuleService from '../courses/services/module.service';
import CourseMapperService from '../courses/services/courses.mapper.service';
import { MaterialType } from '../courses/entities/material-mapper';
import Video from '../courses/entities/video.entity';
import QuizGroupService from '../courses/services/quiz.group.service';
import QuizGroup from '../courses/entities/quiz.group.entity';
import ArticleService from '../courses/services/article.service';
import Article from '../courses/entities/article.entity';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly roadmapService: RoadMapService,
    private readonly careerPathService: CareerPathService,
    private readonly quizGroupService: QuizGroupService,
    private readonly videoService: VideoService,
    private readonly articleService: ArticleService,
    private readonly lessonService: LessonService,
    private readonly materialMapper: MaterialMapperService,
    private readonly moduleService: ModuleService,
    private readonly lessonMapper: LessonMapperService,
    private readonly courseMapper: CourseMapperService
  ) {}

  @Get('/courses')
  async getCourses(@Query('userId') userId: string) {
    return await this.coursesService.list(userId);
  }

  @Post('/courses/new-course')
  async uploadCourse(@Body() course: CreateNewCourseDto) {
    return await this.coursesService.create(course);
  }

  @Get('/mapper/:course_id/modules')
  async getAllMappedModules(@Param('course_id') course_id: string) {
    try {
      return await this.courseMapper.getAllLinkedByModules(course_id);
    } catch (error: unknown) {
      console.log({ error });
    }
  }

  @Post('mapper/:course_id/modules')
  async linkModuleToCourses(
    @Param('course_id') id: string,
    @Body() module: CourseModuleDto
  ) {
    try {
      return await this.courseMapper.create({
        course: { id },
        module: { id: module.module_id },
        order: module.order,
      });
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) throw error;
      else throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('roadmaps/new-roadmap')
  async uploadRoadmap(@Body() data: CreateRoadmapDto) {
    return await this.roadmapService.create(data);
  }

  @Post('careerpaths/new-careerpath')
  async uploadCareerPath(@Body() data: CreateCareerPathDto) {
    return await this.careerPathService.create(data);
  }

  @Post('/quizzes')
  async createNewQuiz(@Body() data: QuizDto) {
    return await this.quizGroupService.create(data);
  }

  @Get('/quizzes')
  async getAllQuiz() {
    return (await this.quizGroupService.getAll()).map((quizGroup) => ({
      ...quizGroup,
      type: MaterialType.QUIZ_GROUP,
    }));
  }

  @Post('/videos')
  async createNewVideo(@Body() data: VideoDto) {
    return await this.videoService.create(data);
  }

  @Get('/videos')
  async getAllVideos() {
    return await this.videoService.getAll();
  }

  // *** Articles
  @Post('/article')
  async createNewArticle(@Body() data: ArticleDto) {
    return await this.articleService.create(data);
  }

  @Get('/articles')
  async getAllArticles() {
    return await this.articleService.getAll();
  }

  @Post('/lessons')
  async createLesson(@Body() lesson: LessonDto) {
    return await this.lessonService.create(lesson);
  }

  @Get('/lessons')
  async getLessons() {
    return await this.lessonService.find();
  }

  @Post('/mapper/material')
  async linkMaterial(@Body() link_material: MaterialLessonMapDto) {
    let material: QuizGroup | Video | Article;

    if (link_material.type == MaterialType.QUIZ_GROUP)
      material = await this.quizGroupService.findOne(link_material.material_id);
    else if (link_material.type == MaterialType.VIDEO)
      material = await this.videoService.findOne(link_material.material_id);
    else if (link_material.type == MaterialType.ARTICLE)
      material = await this.articleService.findOne(link_material.material_id);

    console.log({ material, link_material });
    if (!material)
      throw new HttpException(
        `Material with ID ${link_material.material_id} not found`,
        HttpStatus.NOT_FOUND
      );
    return await this.materialMapper.create({
      lesson: { id: link_material.lesson_id },
      material_type: link_material.type,
      order: link_material.order,
      material_id: material.id,
      material_duration: material.duration,
    });
  }

  @Get('/mapper/:lesson_id/materials')
  async getAllMappedQuizzes(@Param('lesson_id') lesson_id: string) {
    try {
      const h = await this.materialMapper.findAllMaterialsByLesson(lesson_id);
      console.dir({ h }, { depth: null });
      return h;
    } catch (error: unknown) {
      console.log({ error });
    }
  }

  @Get('/modules')
  async getAllModules() {
    try {
      return await this.moduleService.getAll();
    } catch (err) {
      console.log(err);
    }
  }
  @Get('modules/:id')
  async getSingleModule(@Param('id') id: string) {
    try {
      return await this.moduleService.findOne(id);
    } catch (error: unknown) {
      console.log({ error });
      throw new HttpException(error, 500);
    }
  }

  @Get('lessons/:id')
  async getSingleLesson(@Param('id') id: string) {
    try {
      return await this.lessonService.findOne(id);
    } catch (error: unknown) {
      console.log({ error });
      throw new HttpException(error, 500);
    }
  }

  @Get('quizzes/:id')
  async getSingleQuiz(@Param('id') id: string) {
    try {
      return await this.quizGroupService.findOne(id);
    } catch (error: unknown) {
      console.log({ error });
      throw new HttpException(error, 500);
    }
  }
  @Get('videos/:id')
  async getSingleVideo(@Param('id') id: string) {
    try {
      return await this.videoService.findOne(id);
    } catch (error: unknown) {
      console.log({ error });
      throw new HttpException(error, 500);
    }
  }

  @Get('articles/:id')
  async getSingleArticle(@Param('id') id: string) {
    try {
      return await this.articleService.findOne(id);
    } catch (error: unknown) {
      console.log({ error });
      throw new HttpException(error, 500);
    }
  }

  @Post('/modules')
  async createModule(@Body() module: ModuleDto) {
    try {
      return await this.moduleService.create(module);
    } catch (err) {
      console.log(err);
    }
  }

  @Post('mapper/:module_id/lesson')
  async linkLessonToModule(
    @Param('module_id') id: string,
    @Body() lesson: ModuleLessonDto
  ) {
    try {
      return await this.lessonMapper.create({
        module: { id },
        lesson: { id: lesson.lesson_id },
        order: lesson.order,
      });
    } catch (error) {
      console.log(error);
    }
  }

  @Get('/mapper/:module_id/lessons')
  async getAllMappedLessons(@Param('module_id') module_id: string) {
    try {
      return await this.lessonMapper.getAllLinkedByLessons(module_id);
    } catch (error: unknown) {
      console.log({ error });
    }
  }

  @Get('/roadmaps')
  async getAllRoadmaps() {
    try {
      return await this.roadmapService.getAll();
    } catch (err) {
      console.log(err);
    }
  }

  @Delete('/courses/:course_id')
  async deleteCourse(@Param('course_id') course_id: string) {
    try {
      return await this.coursesService.delete(course_id);
    } catch (err) {
      console.log(err);
    }
  }

  @Delete('/lessons/:lesson_id')
  async deleteLesson(@Param('lesson_id') lesson_id: string) {
    try {
      return await this.lessonService.delete(lesson_id);
    } catch (err) {
      console.log(err);
    }
  }

  @Delete('/quizzes/:quiz_id')
  async deleteQuiz(@Param('quiz_id') quiz_id: string) {
    try {
      return await this.quizGroupService.delete(quiz_id);
    } catch (err) {
      console.log(err);
    }
  }

  @Delete('/resources/:resource_id')
  async deleteResource(@Param('resource_id') resource_id: string) {
    try {
      return await this.articleService.delete(resource_id);
    } catch (err) {
      console.log(err);
    }
  }

  @Delete('/articles/:article_id')
  async deleteArticle(@Param('article_id') article_id: string) {
    try {
      return await this.articleService.delete(article_id);
    } catch (err) {
      console.log(err);
    }
  }

  @Delete('/videos/:video_id')
  async deleteVideo(@Param('video_id') video_id: string) {
    try {
      return await this.videoService.delete(video_id);
    } catch (err) {
      console.log(err);
    }
  }
  @Delete('/modules/:module_id')
  async deleteModule(@Param('module_id') module_id: string) {
    try {
      return await this.moduleService.delete(module_id);
    } catch (err) {
      console.log(err);
    }
  }

  @Patch('/courses/:course_id')
  async updateCourse(
    @Param('course_id') course_id: string,
    @Body() dto: UpdateCourseDto
  ) {
    try {
      return await this.coursesService.updateCourse(course_id, dto);
    } catch (err) {
      console.log(err);
    }
  }

  @Patch('/modules/:module_id')
  async updateModule(
    @Param('module_id') module_id: string,
    @Body() dto: UpdateModuleDto
  ) {
    try {
      return await this.moduleService.update(module_id, dto);
    } catch (err) {
      console.log(err);
    }
  }

  @Patch('/lessons/:lesson_id')
  async updateLesson(
    @Param('lesson_id') lesson_id: string,
    @Body() dto: UpdateLessonDto
  ) {
    try {
      return await this.lessonService.update(lesson_id, dto);
    } catch (err) {
      console.log(err);
    }
  }

  // @Patch('/articles/:article_id')
  // async updateArticle(
  //   @Param('article_id') article_id: string,
  //   @Body() dto: UpdateArticleDto
  // ) {
  //   try {
  //     return await this.articleService.update(article_id, dto);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }

  @Patch('/quizzes/:quiz_id')
  async updateQuiz(
    @Param('quiz_id') quiz_id: string,
    @Body() dto: UpdateQuizDto
  ) {
    try {
      return await this.quizGroupService.update(quiz_id, dto);
    } catch (err) {
      console.log(err);
    }
  }

  @Patch('/videos/:video_id')
  async updateVideo(
    @Param('video_id') video_id: string,
    @Body() dto: UpdateVideoDto
  ) {
    try {
      return await this.videoService.update(video_id, dto);
    } catch (err) {
      console.log(err);
    }
  }
}
