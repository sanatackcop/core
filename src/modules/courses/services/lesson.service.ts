import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Equal, Repository } from 'typeorm';
import { Lesson } from '../entities/lessons.entity';
import MaterialMapper, { MaterialType } from '../entities/material-mapper';
import VideoService from './video.service';
import { Material, UpdateLessonDto } from '../entities/dto';
import { LinkVideo } from '../entities/video.entity';
import { LinkArticle } from '../entities/article.entity';
import QuizGroupService from './quiz.group.service';
import { QuizGroupIF } from '../entities/quiz.group.entity';
import ArticleService from './article.service';

@Injectable()
export default class LessonService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    private readonly quizGroupService: QuizGroupService,
    private readonly videoService: VideoService,
    private readonly articleService: ArticleService
  ) {}

  async create(module: DeepPartial<Lesson>) {
    return this.lessonRepository.save(this.lessonRepository.create(module));
  }

  async findOne(id: string) {
    return this.lessonRepository.findOne({
      where: { id: Equal(id) },
    });
  }

  find(): Promise<Lesson[]> {
    return this.lessonRepository.find();
  }

  async getDetails(lesson: DeepPartial<Lesson>): Promise<{
    id: string;
    name: string;
    description: string;
    materials: Material[]; // MaterialIF;
  }> {
    return {
      id: lesson.id,
      name: lesson.name,
      description: lesson.description,
      materials: (
        await Promise.all(
          lesson.materialMapper?.map(
            async (material: MaterialMapper): Promise<Material | null> => {
              if (material.material_type === MaterialType.QUIZ_GROUP) {
                const quizGroup = await this.quizGroupService.findOne(
                  material.material_id
                );
                if (!quizGroup) return null;

                const result: QuizGroupIF = {
                  ...quizGroup,
                  quizzes: (
                    await this.quizGroupService.getQuizzes(quizGroup.id)
                  ).quizzes.map((quiz) => ({
                    ...quiz,
                    type: MaterialType.QUIZ,
                  })),
                  order: material.order,
                  type: MaterialType.QUIZ_GROUP,
                };

                return result;
              }

              if (material.material_type === MaterialType.VIDEO) {
                const video = await this.videoService.findOne(
                  material.material_id
                );
                if (!video) return null;

                const result: LinkVideo = {
                  ...video,
                  order: material.order,
                  type: MaterialType.VIDEO,
                };

                return result;
              }

              if (material.material_type === MaterialType.ARTICLE) {
                const resource = await this.articleService.findOne(
                  material.material_id
                );
                if (!resource) return null;

                const result: LinkArticle = {
                  ...resource,
                  order: material.order,
                  type: MaterialType.ARTICLE,
                };

                return result;
              }

              return null;
            }
          ) ?? []
        )
      )
        .filter((m): m is Material => m !== null)
        .sort((a, b) => a.order - b.order),
    };
  }

  async delete(lessonId: string) {
    const result = await this.lessonRepository.delete(lessonId);
    if (result.affected === 0) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }
  }

  async update(lessonId: string, dto: UpdateLessonDto) {
    const result = await this.lessonRepository.update(lessonId, dto);
    if (result.affected === 0) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }
    return result;
  }
}
