import { Module } from '@nestjs/common';
import { QuizzModule } from '../quizz/quizz.module';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';

@Module({
  imports: [QuizzModule],
  controllers: [DevicesController],
  providers: [DevicesService],
})
export class DevicesModule {}
