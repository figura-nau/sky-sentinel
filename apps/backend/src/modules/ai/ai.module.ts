import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    AiService,
    {
      provide: 'AI_CLIENT',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const apikey = configService.get<string>('GOOGLE_AI_KEY');
        return apikey;
      },
    },
  ],
})
export class AiModule {}
