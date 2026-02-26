import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FailuresModule } from './modules/failures/failures.module';
import { AiModule } from './modules/ai/ai.module';
import { LogicEngineModule } from './modules/logic-engine/logic-engine.module';
import { ValidatorModule } from './modules/validator/validator.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    FailuresModule,
    AiModule,
    LogicEngineModule,
    ValidatorModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
