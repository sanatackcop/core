import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, FindManyOptions, Repository } from 'typeorm';
import MaterialMapper, { MaterialType } from '../entities/material-mapper';
import Article from '../entities/article.entity';

@Injectable()
export default class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(MaterialMapper)
    private readonly materialMapperRepository: Repository<MaterialMapper>
  ) {}

  create(createArticlesDto: Partial<Article>): Promise<Article> {
    return this.articleRepository.save(
      this.articleRepository.create(createArticlesDto)
    );
  }

  async getAll(): Promise<Article[]> {
    return this.articleRepository.find();
  }

  findAll(where: FindManyOptions<Article>) {
    return this.articleRepository.find(where);
  }

  async findOne(id: string): Promise<Article> {
    return await this.articleRepository.findOne({
      where: {
        id: Equal(id),
      },
    });
  }

  async delete(articleId: string) {
    await this.materialMapperRepository.delete({
      material_id: articleId,
      material_type: MaterialType.ARTICLE,
    });
    const result = await this.articleRepository.delete(articleId);
    if (result.affected === 0) {
      throw new NotFoundException(`Article with ID ${articleId} not found`);
    }
  }

  // async update(articleId: string, dto: UpdateArticleDto) {
  //   const result = await this.articleRepository.update(articleId, dto);
  //   if (result.affected === 0) {
  //     throw new NotFoundException(`Article with ID ${articleId} not found`);
  //   }
  //   return result;
  // }
}
