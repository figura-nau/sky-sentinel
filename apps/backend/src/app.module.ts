import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FailuresModule } from './modules/failures/failures.module';

@Module({
  imports: [FailuresModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
