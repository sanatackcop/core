import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { AdminService } from './admin.service';
import { CoursesModule } from '../courses/courses.module';

@Module({
  imports: [CoursesModule],
  controllers: [ApiController],
  providers: [AdminService],
})
export class AdminModule {}
