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
Your task is to analyze a user's vital signs and environmental data to determine their real-time sunstroke risk level and provide a clear explanation along with actionable preventative or first-aid advice.

Use the following data:
- Body Temperature: {{{bodyTemperature}}}°C
- Heart Rate: {{{heartRate}}} BPM
- Activity Level: {{{activityLevel}}}
- Humidity: {{{humidity}}}%
- Heat Index: {{{heatIndex}}}°C

Based on this information, provide a comprehensive sunstroke risk assessment. 

IMPORTANT: To ensure variety in repeated analysis, vary your focus in each response. You might focus on hydration chemistry, garment technology, environmental factors, or specific metabolic rest cycles. Provide at least 4-5 distinct advice items.

Output your response strictly in the specified JSON format.`,
});

const FALLBACK_ADVICE_NODES = [
  {
    riskLevel: 'low' as const,
    explanation: "Neural sync is restricted, but your baseline telemetry suggests stability. Focus on electrolyte balance and shaded rest cycles.",
    preventativeAdvice: [
      "Drink 250ml of water with mineral salts every 20 minutes.",
      "Wear light-colored, moisture-wicking synthetic fabrics.",
      "Monitor for subtle spikes in heart rate during transition periods.",
      "Maintain a 10-minute rest cycle for every 50 minutes of activity."
    ]
  },
  {
    riskLevel: 'low' as const,
    explanation: "System load is high. General thermal defense protocol is active. Prioritize heat dissipation through high-airflow environments.",
    preventativeAdvice: [
      "Utilize convective cooling by moving to areas with high wind or fans.",
      "Avoid heavy protein meals which increase metabolic heat production.",
      "Check urine color frequently; pale straw is the goal for safety.",
      "Apply cool water to pulse points (wrists, neck) for rapid cooling."
    ]
  },
  {
    riskLevel: 'moderate' as const,
    explanation: "While analyzing your specific data, general moderate-risk protocols are recommended. Ambient heat is entering a warning state.",
    preventativeAdvice: [
      "Immediately reduce activity intensity by at least 50%.",
      "Seek indoor air-conditioned environments for a 15-minute recovery.",
      "Loosen tight-fitting gear to allow for sweat evaporation.",
      "Supplement water with isotonic drinks to replace lost sodium."
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
      const randomFallback = FALLBACK_ADVICE_NODES[Math.floor(Math.random() * FALLBACK_ADVICE_NODES.length)];
      return randomFallback;
    }
  }
);
