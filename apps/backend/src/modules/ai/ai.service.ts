import { GoogleGenAI } from '@google/genai';
import {
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { FailureLog, Severity, UAVdata } from '@prisma/client';
import { getDefaultSuggestion } from './failure-default-suggestions';

const FAILURE_ANALYZE_PROMPT = `
You are an expert UAV (Unmanned Aerial Vehicle) Diagnostic Engineer. 
Analyze telemetry data to diagnose flight failures for a drone.

### TELEMETRY CONTEXT:
- Velocity: {airspeed} m/s, {groundspeed} m/s
- Attitude: Pitch {pitch}°, Roll {roll}°
- Environment: Temp {temperature}°C
- Servo: {servoCurrent}, vibration: {vibration} (m/s²  [X, Y, Z])
- System: Battery {battery}%, Altitude: {altitude}
- Error Log: {failureDescription}

### TASK:
1. Identify the likely Root Cause (Mechanical, Software, or Environmental).
2. Assess the Severity, possible types: {severity}.
3. Provide a brief technical explanation.
4. Suggest a specific Maintenance Action.

### OUTPUT FORMAT:
Return ONLY a valid JSON object with this structure:
{{
  "root_cause": "Detailed technical classification",
  "severity":  a value from this - {severity},
  "explanation": "Correlation-based technical reasoning",
  "suggested_action": "Specific repair step"
}}

The language of the response is: {lang}
`;
const AI_MODEL = 'gemini-2.5-flash';
const RESPONSE_TYPE = 'application/json';
export interface AiAnalysis {
  root_cause: string;
  severity: string;
  explanation: string;
  suggested_action: string;
}

@Injectable()
export class AiService {
  constructor(
    @Inject('AI_CLIENT')
    private readonly googleGenAI: GoogleGenAI,
  ) {}

  async analyzeFailure(data: {
    uav: UAVdata;
    failure: FailureLog;
    responseLang: string;
  }): Promise<AiAnalysis> {
    const defaultAnalysis = getDefaultSuggestion({
      failure: data.failure,
      responseLang: data.responseLang,
    });
    if (defaultAnalysis) return defaultAnalysis;

    const finalPrompt = FAILURE_ANALYZE_PROMPT.replace(
      '{airspeed}',
      data.uav.airspeed?.toString() ?? '0',
    )
      .replace('{pitch}', data.uav.pitch?.toString() ?? '0')
      .replace('{groundspeed}', data.uav.groundspeed?.toString() ?? '0')
      .replace('{servoCurrent}', data.uav.servoCurrent?.toString() ?? '0')
      .replace('{vibration}', data.uav.vibration?.toString() ?? '0')
      .replace('{roll}', data.uav.roll?.toString() ?? '0')
      .replace('{severity}', JSON.stringify(Object.keys(Severity)))
      .replace('{temperature}', data.uav.temperature?.toString() ?? 'N/A')
      .replace('{battery}', data.uav.battRem?.toString() ?? 'N/A')
      .replace('{altitude}', data.uav.altitude?.toString() ?? 'N/A')
      .replace(
        '{failureDescription}',
        data.failure.description ?? 'Unknown Error',
      )
      .replace('{lang}', data.responseLang ?? 'English');

    try {
      const resp = await this.googleGenAI.models.generateContent({
        model: AI_MODEL,
        contents: finalPrompt,
        config: {
          responseMimeType: RESPONSE_TYPE,
        },
      });
      if (!resp.text) {
        throw new ServiceUnavailableException('Empty response from Gemini');
      }
      const result = JSON.parse(resp.text) as AiAnalysis;
      return result;
    } catch (err: unknown) {
      console.error('AI Analysis Failed:', err);
      throw err;
    }
  }
}
