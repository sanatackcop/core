import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Equal, In, Repository } from 'typeorm';
import MaterialMapper, { MaterialType } from '../entities/material-mapper';
import QuizService from './quiz.service';
import { LinkQuiz } from '../entities/quiz.entity';
import { LinkVideo } from '../entities/video.entity';
import { LinkResource } from '../entities/resource.entity';
import VideoService from './video.service';
import ResourceService from './resource.service';

@Injectable()
export default class MaterialMapperService {
  constructor(
    @InjectRepository(MaterialMapper)
    private readonly lessonMapperRepo: Repository<MaterialMapper>,
    private readonly quizService: QuizService,
    private readonly videoService: VideoService,
    private readonly resourceService: ResourceService
  ) {}

  create(map: DeepPartial<MaterialMapper>) {
    return this.lessonMapperRepo.save(this.lessonMapperRepo.create(map));
  }

  getMaterials(lesson_id: string): Promise<MaterialMapper[]> {
    return this.lessonMapperRepo.find({
      where: { lesson: { id: lesson_id } },
    });
  }

  async findAllMaterialsByLesson(lesson_id: string): Promise<{
    quizzes: LinkQuiz[];
    videos: LinkVideo[];
    resources: LinkResource[];
  }> {
    const [quizzes, videos, resources] = await Promise.all([
      this.getTypedMaterials(lesson_id, MaterialType.QUIZ, this.quizService),
      this.getTypedMaterials(lesson_id, MaterialType.VIDEO, this.videoService),
      this.getTypedMaterials(
        lesson_id,
        MaterialType.RESOURCE,
        this.resourceService
      ),
    ]);

    return { quizzes, videos, resources };
  }

  getTypedMaterials = async <T extends { id: string }, U extends MaterialType>(
    lesson_id: string,
    type: U,
    service: { findAll: (options: any) => Promise<T[]> }
  ): Promise<(T & { order: number; type: U })[]> => {
    const material = await this.lessonMapperRepo.find({
      where: { lesson: { id: Equal(lesson_id) } },
    });
    const filtered = material.filter((m) => m.material_type === type);
    const items = await service.findAll({
      where: {
        id: In(filtered.map((m) => m.material_id)),
      },
    });

    return items.map((item) => {
      const matched = filtered.find((m) => m.material_id === item.id);
      return {
        ...item,
        order: matched?.order ?? 0,
        type,
      };
    });
  };
}
