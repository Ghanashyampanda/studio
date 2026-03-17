'use server';
/**
 * @fileOverview A Genkit flow for the Interactive AI Chat Health Assistant.
 *
 * - chatAssistant - A function that handles the conversational medical guidance process.
 * - ChatAssistantInput - The input type for the chatAssistant function.
 * - ChatAssistantOutput - The return type for the chatAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const ChatAssistantInputSchema = z.object({
  history: z.array(MessageSchema).describe('The conversation history.'),
  message: z.string().describe('The new user message.'),
});
export type ChatAssistantInput = z.infer<typeof ChatAssistantInputSchema>;

const ChatAssistantOutputSchema = z.object({
  text: z.string().describe('The AI-generated response text.'),
});
export type ChatAssistantOutput = z.infer<typeof ChatAssistantOutputSchema>;

export async function chatAssistant(input: ChatAssistantInput): Promise<ChatAssistantOutput> {
  return chatAssistantFlow(input);
}

const chatAssistantPrompt = ai.definePrompt({
  name: 'chatAssistantPrompt',
  input: {schema: ChatAssistantInputSchema},
  output: {schema: ChatAssistantOutputSchema},
  prompt: `You are a professional AI Medical Assistant for SunCare Alert (formerly HeatGuard AI). 
Your specialty is thermal safety, hyperthermia prevention, and heat-related first aid.

GOALS:
1. Help users identify symptoms of sunstroke, heat exhaustion, and heat cramps.
2. Provide actionable prevention tips (hydration, clothing, environment).
3. Offer immediate emergency guidance if a user reports high core temperatures or critical symptoms.

TONE:
Concise, clinical, empathetic, and urgent when necessary.

CONSTRAINTS:
- Always include a brief disclaimer if providing medical advice: "I am an AI assistant, not a doctor. In an emergency, dial local emergency services immediately."
- If symptoms sound critical (confusion, temperature > 40°C, loss of consciousness), prioritize telling them to seek immediate medical help.
- Keep responses professional and avoid off-topic conversation.

CONVERSATION HISTORY:
{{#each history}}
- {{role}}: {{{content}}}
{{/each}}

NEW USER MESSAGE:
{{{message}}}`,
});

const chatAssistantFlow = ai.defineFlow(
  {
    name: 'chatAssistantFlow',
    inputSchema: ChatAssistantInputSchema,
    outputSchema: ChatAssistantOutputSchema,
  },
  async (input) => {
    try {
      const {output} = await chatAssistantPrompt(input);
      return output!;
    } catch (e: any) {
      console.error("Chat Flow Error:", e);
      return {
        text: "System Notice: I am currently experiencing a neural sync delay. If you are experiencing symptoms of heat stroke (high fever, confusion, rapid pulse), please move to a cool area and contact emergency services immediately."
      };
    }
  }
);
