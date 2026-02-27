import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FailuresModule } from './modules/failures/failures.module';
import { AiModule } from './modules/ai/ai.module';
import { ValidatorModule } from './modules/validator/validator.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { TelemetryParserGateway } from './modules/temelemtry-parser/temelemtry-parser.gateway';
@Module({
  imports: [
    FailuresModule,
    AiModule,
    ValidatorModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        BACKEND_PORT: Joi.number().required(),
        FRONTEND_PORT: Joi.number().required(),
        FRONTEND_URL: Joi.string().required(),
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService, TelemetryParserGateway],
})
export class AppModule {}
