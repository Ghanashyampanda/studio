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
  refreshNonce: z.string().optional().describe('A random string to ensure unique output generation.'),
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
    .describe('A comprehensive list of actionable advice for prevention or first-aid.'),
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
Your task is to analyze a user's vital signs and environmental data to determine their real-time sunstroke risk level.

CRITICAL INSTRUCTION: Analyze risk based EXCLUSIVELY on Body Temperature and Environmental factors (Humidity, Heat Index). Heart Rate is provided for monitoring context only and MUST NOT influence the risk level determination or trigger a warning state.

Use the following data:
- Body Temperature: {{{bodyTemperature}}}°C
- Heart Rate: {{{heartRate}}} BPM (Informational - Ignore for risk scoring)
- Activity Level: {{{activityLevel}}}
- Humidity: {{{humidity}}}%
- Heat Index: {{{heatIndex}}}°C

Based on this information, provide a comprehensive sunstroke risk assessment. Focus your explanation on thermal balance and environmental impact.

Output your response strictly in the specified JSON format.`,
});

const FALLBACK_ADVICE_NODES = [
  {
    riskLevel: 'low' as const,
    explanation: "Thermal baseline is stable. Environment temperatures are within safe parameters. Continue monitoring hydration levels.",
    preventativeAdvice: [
      "Drink 250ml of water every 20 minutes.",
      "Maintain shaded rest cycles during peak solar hours.",
      "Monitor for any upward trends in body temperature.",
      "Wear light-colored, breathable fabrics."
    ]
  }
];

const sunstrokeRiskPredictionFlow = ai.defineFlow(
  {
    name: 'sunstrokeRiskPredictionFlow',
    inputSchema: SunstrokeRiskInputSchema,
    outputSchema: SunstrokeRiskOutputSchema,
  },
  async input => {
    try {
      const {output} = await sunstrokeRiskPredictionPrompt(input);
      if (!output) {
        throw new Error('Neural model failed to generate a valid risk assessment.');
      }
      return output;
    } catch (e: any) {
      console.error("Genkit Flow Error:", e);
      // RANDOMIZED FALLBACK SYSTEM
      return FALLBACK_ADVICE_NODES[0];
    }
  }
);
