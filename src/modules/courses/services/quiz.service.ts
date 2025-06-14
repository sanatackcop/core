import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Quiz from '../entities/quiz.entity';
import { Repository, Equal, FindManyOptions } from 'typeorm';
import { QuizDto } from '../entities/dto';

@Injectable()
export default class QuizService {
  constructor(
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>
  ) {}

  create(quiz: QuizDto) {
    return this.quizRepository.save(this.quizRepository.create(quiz));
  }

  async findOne(id: string) {
    return this.quizRepository.findOne({
      where: { id: Equal(id) },
    });
  }

  findAll(where: FindManyOptions<Quiz>) {
    return this.quizRepository.find(where);
  }

  getAll() {
    return this.quizRepository.find();
  }
}
