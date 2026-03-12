'use server';
/**
 * @fileOverview An AI agent that provides immediate, AI-tailored preventative and first-aid guidance
 *               when a high-risk sunstroke state is detected.
 *
 * - getPreventativeFirstAidGuidance - A function that handles the generation of guidance.
 * - PreventativeFirstAidGuidanceInput - The input type for the getPreventativeFirstAidGuidance function.
 * - PreventativeFirstAidGuidanceOutput - The return type for the getPreventativeFirstAidGuidance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PreventativeFirstAidGuidanceInputSchema = z.object({
  currentBodyTemperature: z.number().describe('The user\u0027s current body temperature in Celsius.'),
  currentHeartRate: z.number().describe('The user\u0027s current heart rate in beats per minute.'),
  humidity: z.number().describe('The current environmental humidity percentage.'),
  heatIndex: z.number().describe('The current environmental heat index in Celsius.'),
  riskLevel: z.enum(['low', 'moderate', 'high', 'critical']).describe('The detected sunstroke risk level for the user.'),
  symptoms: z.array(z.string()).describe('A list of symptoms the user is currently experiencing.').optional(),
});
export type PreventativeFirstAidGuidanceInput = z.infer<typeof PreventativeFirstAidGuidanceInputSchema>;

const PreventativeFirstAidGuidanceOutputSchema = z.object({
  guidance: z.string().describe('Immediate, actionable preventative and first-aid guidance tailored to the situation.'),
});
export type PreventativeFirstAidGuidanceOutput = z.infer<typeof PreventativeFirstAidGuidanceOutputSchema>;

export async function getPreventativeFirstAidGuidance(input: PreventativeFirstAidGuidanceInput): Promise<PreventativeFirstAidGuidanceOutput> {
  return preventativeFirstAidGuidanceFlow(input);
}

const preventativeFirstAidPrompt = ai.definePrompt({
  name: 'preventativeFirstAidPrompt',
  input: {schema: PreventativeFirstAidGuidanceInputSchema},
  output: {schema: PreventativeFirstAidGuidanceOutputSchema},
  prompt: `You are an expert in health and safety, specializing in sunstroke prevention and first aid.
Your goal is to provide immediate, actionable, and personalized guidance to a user at high risk of sunstroke.

Based on the following real-time data, provide clear preventative and first-aid advice. Focus on what the user should do right now.

User Data:
- Current Body Temperature: {{{currentBodyTemperature}}}°C
- Current Heart Rate: {{{currentHeartRate}}} bpm
- Environmental Humidity: {{{humidity}}}%
- Heat Index: {{{heatIndex}}}°C
- Sunstroke Risk Level: {{{riskLevel}}}
{{#if symptoms}}
- Current Symptoms: {{#each symptoms}}- {{{this}}}{{/each}}
{{/if}}

Provide guidance that includes:
1.  Immediate actions to take (e.g., move to shade, hydrate, loosen clothing).
2.  Specific first-aid steps based on symptoms or high risk.
3.  When to seek emergency medical attention.
4.  Preventative tips for the current situation.

Keep the language clear, concise, and easy to understand for someone who might be in distress.
Prioritize safety and prompt action.`,
});

const preventativeFirstAidGuidanceFlow = ai.defineFlow(
  {
    name: 'preventativeFirstAidGuidanceFlow',
    inputSchema: PreventativeFirstAidGuidanceInputSchema,
    outputSchema: PreventativeFirstAidGuidanceOutputSchema,
  },
  async (input) => {
    const {output} = await preventativeFirstAidPrompt(input);
    return output!;
  }
);
