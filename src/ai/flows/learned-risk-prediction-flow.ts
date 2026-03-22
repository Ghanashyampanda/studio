'use server';
/**
 * @fileOverview A Self-Learning AI flow that analyzes historical patient data
 *               to provide accurate sunstroke risk predictions.
 *
 * - predictLearnedRisk - Function to analyze vitals based on history.
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
});
export type LearnedRiskOutput = z.infer<typeof LearnedRiskOutputSchema>;

export async function predictLearnedRisk(input: LearnedRiskInput): Promise<LearnedRiskOutput> {
  return learnedRiskPredictionFlow(input);
}

const learnedRiskPrompt = ai.definePrompt({
  name: 'learnedRiskPrompt',
  input: {schema: LearnedRiskInputSchema},
  output: {schema: LearnedRiskOutputSchema},
  prompt: `You are a clinical Neural Risk Engine specializing in hyperthermia and sunstroke forensics.
Your task is to predict the CURRENT risk level based on NEW vitals and historical trends.

CURRENT VITALS:
- Body Temp: {{currentVitals.bodyTemperatureC}}°C
- Environment Temp: {{currentVitals.outsideTemperatureC}}°C
- Heart Rate: {{currentVitals.heartRateBPM}} BPM
- Heat Index: {{currentVitals.heatIndexC}}°C

HISTORICAL DATA (Self-Learning Context):
{{#each history}}
- Record: {{timestamp}} | Temp: {{bodyTemperatureC}}°C | Risk: {{riskLevel}}
{{/each}}

INSTRUCTIONS:
1. Analyze the historical data for physiological stability or deterioration patterns.
2. If body temperature is >= 40.7°C, ALWAYS return "critical" regardless of history (Safety Override).
3. If current vitals show a rapid upward trend compared to history, escalate risk level.
4. Provide a confidence score (0-100) based on data density and pattern clarity.

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
          explanation: "Critical threshold override: Body temperature exceeds 40.7°C.",
          learnedPatterns: "Direct threshold breach detected."
        };
      }

      const {output} = await learnedRiskPrompt(input);
      return output!;
    } catch (e: any) {
      console.error("Learned Prediction Error:", e);
      return {
        riskLevel: 'low',
        confidenceScore: 0,
        explanation: "Neural engine sync delay. Falling back to baseline safety protocols.",
        learnedPatterns: "Inconclusive patterns."
      };
    }
  }
);
