'use server';
/**
 * @fileOverview A Genkit flow for generating personalized heat safety and health tips.
 *
 * - generateHealthTips - A function that handles the tips generation process.
 * - HealthTipsInput - The input type for the generateHealthTips function.
 * - HealthTipsOutput - The return type for the generateHealthTips function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HealthTipsInputSchema = z.object({
  bodyTemperatureC: z.number().describe('Current core body temperature in Celsius.'),
  outsideTemperatureC: z.number().describe('Current ambient outside temperature in Celsius.'),
  humidityPercentage: z.number().describe('Current environmental humidity percentage.'),
  activityLevel: z.string().describe('The user\'s current activity level.'),
});
export type HealthTipsInput = z.infer<typeof HealthTipsInputSchema>;

const TipCategorySchema = z.object({
  title: z.string().describe('Title of the tip category (e.g., Hydration, Clothing, Environment).'),
  icon: z.string().describe('A Lucide icon name string that matches the category (e.g., Droplets, Shirt, Home).'),
  tips: z.array(z.string()).describe('A list of actionable tips for this category.'),
});

const HealthTipsOutputSchema = z.object({
  summary: z.string().describe('A brief, encouraging summary of the current health state.'),
  categories: z.array(TipCategorySchema).describe('Actionable tip categories.'),
  urgentNotice: z.string().optional().describe('A critical warning if conditions are dangerous.'),
});
export type HealthTipsOutput = z.infer<typeof HealthTipsOutputSchema>;

export async function generateHealthTips(input: HealthTipsInput): Promise<HealthTipsOutput> {
  return healthTipsFlow(input);
}

const healthTipsPrompt = ai.definePrompt({
  name: 'healthTipsPrompt',
  input: {schema: HealthTipsInputSchema},
  output: {schema: HealthTipsOutputSchema},
  prompt: `You are a professional AI health advisor specializing in thermal safety and hyperthermia prevention.
Your goal is to provide personalized, actionable, and encouraging health tips to a user based on their current vitals and environment.

Current Data:
- Body Temperature: {{{bodyTemperatureC}}}°C
- Outside Temperature: {{{outsideTemperatureC}}}°C
- Humidity: {{{humidityPercentage}}}%
- Activity Level: {{{activityLevel}}}

Based on this data, generate a set of personalized tips categorized by Hydration, Activity Management, Clothing/Protection, and Environment.

If the body temperature is over 38.5°C, prioritize cooling and immediate rest.
If the outside temperature is over 35°C, emphasize frequent hydration and shade.

Provide your response in the specified JSON format. Ensure icons suggested are standard Lucide icon names like 'Droplets', 'Shirt', 'Wind', 'Sun', 'Heart', 'Coffee'.`,
});

const healthTipsFlow = ai.defineFlow(
  {
    name: 'healthTipsFlow',
    inputSchema: HealthTipsInputSchema,
    outputSchema: HealthTipsOutputSchema,
  },
  async (input) => {
    try {
      const {output} = await healthTipsPrompt(input);
      return output!;
    } catch (e: any) {
      if (e.message?.includes('429') || e.message?.includes('RESOURCE_EXHAUSTED')) {
        return {
          summary: "AI services are currently busy, but your safety is our priority.",
          categories: [
            {
              title: "Hydration",
              icon: "Droplets",
              tips: ["Drink 250ml of water every 20 minutes.", "Avoid caffeine and high-sugar drinks."]
            },
            {
              title: "Cooling",
              icon: "Wind",
              tips: ["Move to a shaded or air-conditioned area.", "Apply cool water to your skin."]
            }
          ]
        };
      }
      throw e;
    }
  }
);
