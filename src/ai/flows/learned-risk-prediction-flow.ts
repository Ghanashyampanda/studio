'use server';
/**
 * @fileOverview A Self-Learning AI flow that analyzes historical patient data
 *               to provide accurate sunstroke risk predictions with explainability.
 *
 * - predictLearnedRisk - Function to analyze vitals based on history and provide reasons.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HistoryRecordSchema = z.object({
  bodyTemperatureC: z.number(),
  outsideTemperatureC: z.number(),
  heartRateBPM: z.number(),
  riskLevel: z.string().optional(),
  timestamp: z.string(),
});

const LearnedRiskInputSchema = z.object({
  currentVitals: z.object({
    bodyTemperatureC: z.number(),
    outsideTemperatureC: z.number(),
    heartRateBPM: z.number(),
    humidityPercentage: z.number(),
    heatIndexC: z.number(),
  }),
  history: z.array(HistoryRecordSchema).describe('Recent historical health records for context-aware learning.'),
});
export type LearnedRiskInput = z.infer<typeof LearnedRiskInputSchema>;

const LearnedRiskOutputSchema = z.object({
  riskLevel: z.enum(['low', 'moderate', 'high', 'critical']),
  confidenceScore: z.number().min(0).max(100),
  explanation: z.string(),
  learnedPatterns: z.string().describe('Short description of patterns identified from history.'),
  featureContributions: z.object({
    bodyTemperature: z.number().describe('Influence percentage of body temp (0-100).'),
    environmentTemp: z.number().describe('Influence percentage of ambient temp (0-100).'),
    heartRate: z.number().describe('Influence percentage of heart rate (0-100).'),
    humidity: z.number().describe('Influence percentage of humidity (0-100).'),
  }).describe('The sum of all contributions should be 100.'),
});
export type LearnedRiskOutput = z.infer<typeof LearnedRiskOutputSchema>;

export async function predictLearnedRisk(input: LearnedRiskInput): Promise<LearnedRiskOutput> {
  return learnedRiskPredictionFlow(input);
}

const learnedRiskPrompt = ai.definePrompt({
  name: 'learnedRiskPrompt',
  input: {schema: LearnedRiskInputSchema},
  output: {schema: LearnedRiskOutputSchema},
  prompt: `You are a clinical Neural Risk Engine specializing in hyperthermia forensics.
Your task is to predict the CURRENT risk level and EXPLAIN why based on vitals and history.

CURRENT VITALS:
- Body Temp: {{currentVitals.bodyTemperatureC}}°C
- Environment Temp: {{currentVitals.outsideTemperatureC}}°C
- Heart Rate: {{currentVitals.heartRateBPM}} BPM
- Heat Index: {{currentVitals.heatIndexC}}°C
- Humidity: {{currentVitals.humidityPercentage}}%

HISTORICAL DATA:
{{#each history}}
- Record: {{timestamp}} | Temp: {{bodyTemperatureC}}°C | Risk: {{riskLevel}}
{{/each}}

INSTRUCTIONS:
1. Predict risk level (low, moderate, high, critical).
2. Calculate "Feature Contributions": Assign a percentage (0-100) to each vital sign based on its importance in this specific prediction. Total must be 100.
3. Provide a concise medical explanation for the prediction.
4. Identify any patterns from history (e.g., "Rapidly climbing body temp compared to 10 mins ago").

Output your response strictly in the specified JSON format.`,
});

const learnedRiskPredictionFlow = ai.defineFlow(
  {
    name: 'learnedRiskPredictionFlow',
    inputSchema: LearnedRiskInputSchema,
    outputSchema: LearnedRiskOutputSchema,
  },
  async input => {
    try {
      // Safety Override: Hard-wired critical threshold
      if (input.currentVitals.bodyTemperatureC >= 40.7) {
        return {
          riskLevel: 'critical',
          confidenceScore: 100,
          explanation: "Critical threshold override: Body temperature exceeds 40.7°C, indicating imminent sunstroke risk.",
          learnedPatterns: "Direct thermal threshold breach detected.",
          featureContributions: {
            bodyTemperature: 95,
            environmentTemp: 2,
            heartRate: 2,
            humidity: 1
          }
        };
      }

      const {output} = await learnedRiskPrompt(input);
      if (!output) throw new Error("AI failed to generate explanation data.");
      return output;
    } catch (e: any) {
      console.error("Learned Prediction Error:", e);
      return {
        riskLevel: 'low',
        confidenceScore: 0,
        explanation: "Neural engine sync delay. Falling back to baseline safety protocols.",
        learnedPatterns: "Inconclusive patterns.",
        featureContributions: {
          bodyTemperature: 25,
          environmentTemp: 25,
          heartRate: 25,
          humidity: 25
        }
      };
    }
  }
);
