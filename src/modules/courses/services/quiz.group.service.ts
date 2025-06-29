import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, FindManyOptions, Repository } from 'typeorm';
import QuizService from './quiz.service';
import QuizGroup from '../entities/quiz.group.entity';
import { QuizDto } from '../entities/dto';

@Injectable()
export default class QuizGroupService {
  constructor(
    @InjectRepository(QuizGroup)
    private readonly quizGroupRepo: Repository<QuizGroup>,
    private readonly quizService: QuizService
  ) {}

  async create(quizzes: QuizDto) {
    const quiz_mapper = await this.quizGroupRepo.save(
      this.quizGroupRepo.create({
        title: quizzes.title,
        duration: quizzes.quizzes.reduce((acc) => (acc += 30), 0),
      })
    );

    if (!quiz_mapper) throw new Error('Quiz Mapper not created');

    for (const quiz of quizzes.quizzes)
      await this.quizService.create({
        ...quiz,
        quizGroup: { id: quiz_mapper.id },
      });
  }

  async findOne(id: string) {
    return this.quizGroupRepo.findOne({
      where: { id: Equal(id) },
    });
  }

  findAll(where: FindManyOptions<QuizGroup>) {
    return this.quizGroupRepo.find(where);
  }

  getAll(): Promise<QuizGroup[]> {
    return this.quizGroupRepo.find({ relations: { quizzes: true } });
  }

  getQuizzes(quiz_mapper_id: string): Promise<QuizGroup> {
    return this.quizGroupRepo.findOne({
      where: { id: Equal(quiz_mapper_id) },
      relations: { quizzes: true },
    });
  }

  delete(id: string) {
    return this.quizGroupRepo.delete({
      id: Equal(id),
    });
  }

  update(articleId: string, quiz_group: Partial<QuizGroup>) {
    return this.quizGroupRepo.update(articleId, quiz_group);
  }
}
