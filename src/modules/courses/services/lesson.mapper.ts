import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Equal, Repository } from 'typeorm';
import LessonMapper from '../entities/lessons-maper.entity';
import MaterialMapperService from './material.mapper.service';
import ModuleService from './module.service';

@Injectable()
export default class LessonMapperService {
  constructor(
    @InjectRepository(LessonMapper)
    private readonly lessonMapper: Repository<LessonMapper>,
    private readonly materialMapper: MaterialMapperService,
    private readonly moduleService: ModuleService
  ) {}

  async create(map: DeepPartial<LessonMapper>) {
    await this.lessonMapper.save(this.lessonMapper.create(map));
    const module = await this.moduleService.findOne(map.module.id);
    const { totalDuration } = await this.getMaterialsTotalDurationAndCount(
      module.id
    );
    await this.moduleService.update(module.id, { duration: totalDuration });
  }

  async getMaterialsTotalDurationAndCount(module_id: string): Promise<{
    sum: number;
    totalDuration: number;
  }> {
    const linkedLessons = await this.lessonMapper.find({
      where: { module: { id: module_id } },
      relations: { lesson: true },
    });
    let sum = 0;
    let totalDuration = 0;
    for (const lesson of linkedLessons) {
      const materials = await this.materialMapper.getMaterials(
        lesson.lesson.id
      );
      sum += materials.length;
      totalDuration += materials.reduce(
        (acc, material) => (acc += material.material_duration),
        0
      );
    }
    return { sum, totalDuration };
  }

  getAllLinkedByLessons(module_id: string) {
    return this.lessonMapper.find({
      where: { module: { id: Equal(module_id) } },
      relations: {
        lesson: true,
      },
    });
  }
}
