'use server';
/**
 * @fileOverview A Genkit flow for predicting sunstroke risk based on vital signs and environmental data.
 *
 * - predictSunstrokeRisk - A function that handles the sunstroke risk prediction process.
 * - SunstrokeRiskInput - The input type for the predictSunstrokeRisk function.
 * - SunstrokeRiskOutput - The return type for the predictSunstrokeRisk function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SunstrokeRiskInputSchema = z.object({
  bodyTemperature: z
    .number()
    .describe('Current body temperature in Celsius, e.g., 37.0.'),
  heartRate: z.number().describe('Current heart rate in beats per minute (BPM).'),
  activityLevel: z
    .enum(['sedentary', 'light', 'moderate', 'high'])
    .describe('Current activity level of the user.'),
  humidity: z.number().min(0).max(100).describe('Current environmental humidity in percentage.'),
  heatIndex: z
    .number()
    .describe('Current heat index in Celsius, calculated from temperature and humidity.'),
});
export type SunstrokeRiskInput = z.infer<typeof SunstrokeRiskInputSchema>;

const SunstrokeRiskOutputSchema = z.object({
  riskLevel: z
    .enum(['low', 'moderate', 'high', 'critical'])
    .describe('The assessed sunstroke risk level.'),
  explanation: z
    .string()
    .describe('A detailed explanation of the risk assessment.'),
  preventativeAdvice: z
    .array(z.string())
    .describe('Actionable advice for prevention or first-aid, if needed.'),
});
export type SunstrokeRiskOutput = z.infer<typeof SunstrokeRiskOutputSchema>;

export async function predictSunstrokeRisk(
  input: SunstrokeRiskInput
): Promise<SunstrokeRiskOutput> {
  return sunstrokeRiskPredictionFlow(input);
}

const sunstrokeRiskPredictionPrompt = ai.definePrompt({
  name: 'sunstrokeRiskPredictionPrompt',
  input: {schema: SunstrokeRiskInputSchema},
  output: {schema: SunstrokeRiskOutputSchema},
  prompt: `You are an expert AI assistant specializing in sunstroke risk assessment and prevention.
Your task is to analyze a user's vital signs and environmental data to determine their real-time sunstroke risk level and provide a clear explanation along with actionable preventative or first-aid advice.

Use the following data:
- Body Temperature: {{{bodyTemperature}}}°C
- Heart Rate: {{{heartRate}}} BPM
- Activity Level: {{{activityLevel}}}
- Humidity: {{{humidity}}}%
- Heat Index: {{{heatIndex}}}°C

Based on this information, provide a comprehensive sunstroke risk assessment. Focus on practical, immediate advice tailored to the current situation. If the risk is critical, emphasize urgent first-aid steps.

Consider the typical thresholds and conditions for sunstroke risk, and apply them to the provided data.

Output your response in the specified JSON format.`,
});

const sunstrokeRiskPredictionFlow = ai.defineFlow(
  {
    name: 'sunstrokeRiskPredictionFlow',
    inputSchema: SunstrokeRiskInputSchema,
    outputSchema: SunstrokeRiskOutputSchema,
  },
  async input => {
    try {
      const {output} = await sunstrokeRiskPredictionPrompt(input);
      return output!;
    } catch (e: any) {
      if (e.message?.includes('429') || e.message?.includes('RESOURCE_EXHAUSTED')) {
        return {
          riskLevel: 'low',
          explanation: "The AI Risk Engine is currently at capacity. Analysis is temporarily paused to preserve system resources. Manual monitoring of vitals is recommended.",
          preventativeAdvice: ["Keep body temperature below 39°C", "Monitor heart rate for spikes", "Drink cool water frequently"]
        };
      }
      throw e;
    }
  }
);
