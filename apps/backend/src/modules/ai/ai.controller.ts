import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { PrismaService } from 'src/database/prisma.service';
import { FailureAnalyzeDto } from './dto/failure-analyze.dto';

@Controller('/ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly prismaService: PrismaService,
  ) {}

  @Post('/failure-analyze')
  async analyzeAiFailure(@Body() failure: FailureAnalyzeDto) {
    const uav = await this.prismaService.uAVdata.findUnique({
      where: { id: failure.uavDataId },
    });

    if (!uav) {
      throw new Error('Uav data cannot be found');
    }
    const aiAnalyze = await this.aiService.analyzeFailure({
      failure,
      uav,
      responseLang: failure.responseLanguage,
    });
    return {
      analysis: aiAnalyze,
      telemetry: uav,
    };
  }
}
