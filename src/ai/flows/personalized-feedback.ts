// src/ai/flows/personalized-feedback.ts
'use server';

/**
 * @fileOverview Provides personalized feedback based on workout logs.
 *
 * - getPersonalizedFeedback - A function that provides personalized feedback based on workout logs.
 * - PersonalizedFeedbackInput - The input type for the getPersonalizedFeedback function.
 * - PersonalizedFeedbackOutput - The return type for the getPersonalizedFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedFeedbackInputSchema = z.object({
  workoutLog: z
    .string()
    .describe(
      'The workout log including exercises, sets, reps, RPE, and free-form notes.'
    ),
  fitnessGoals: z.string().describe('The fitness goals of the user.'),
  level: z.string().describe('The fitness level of the user (beginner, intermediate, advanced).'),
});
export type PersonalizedFeedbackInput = z.infer<typeof PersonalizedFeedbackInputSchema>;

const PersonalizedFeedbackOutputSchema = z.object({
  feedback: z.string().describe('Personalized feedback based on the workout log.'),
});
export type PersonalizedFeedbackOutput = z.infer<typeof PersonalizedFeedbackOutputSchema>;

export async function getPersonalizedFeedback(
  input: PersonalizedFeedbackInput
): Promise<PersonalizedFeedbackOutput> {
  return personalizedFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedFeedbackPrompt',
  input: {schema: PersonalizedFeedbackInputSchema},
  output: {schema: PersonalizedFeedbackOutputSchema},
  prompt: `You are an AI SuperCoach, providing personalized feedback on workouts.

Analyze the workout log, RPE, exercises, and user notes, and provide concrete advice for future workouts, always considering the fitness goals and level of the user.

Fitness Goals: {{{fitnessGoals}}}
Fitness Level: {{{level}}}
Workout Log: {{{workoutLog}}}

Provide the feedback in a concise and actionable manner.
`,
});

const personalizedFeedbackFlow = ai.defineFlow(
  {
    name: 'personalizedFeedbackFlow',
    inputSchema: PersonalizedFeedbackInputSchema,
    outputSchema: PersonalizedFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
