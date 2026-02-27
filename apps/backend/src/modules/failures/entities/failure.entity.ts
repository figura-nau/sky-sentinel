import { FailureType, Severity } from '@prisma/client';
export class Failure {
  id: number;
  timestamp: Date;
  type: FailureType;
  severity: Severity;
  description: string;
  isResolved: boolean;
}
