import { FailureType, Severity } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class FailureAnalyzeDto {
  @IsEnum(Severity)
  severity: Severity;

  @IsString()
  id: string;

  timestamp: Date;

  @IsEnum(FailureType)
  type: FailureType;

  @IsOptional()
  @IsString()
  description: string | null;

  @IsBoolean()
  isResolved: boolean;

  @IsString()
  uavDataId: string;

  @IsString()
  responseLanguage: string;
}
