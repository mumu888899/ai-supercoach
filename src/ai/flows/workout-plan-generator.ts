'use server';

/**
 * @fileOverview Generates a personalized workout plan based on user input.
 *
 * - generateWorkoutPlan - A function that generates a workout plan.
 * - WorkoutPlanInput - The input type for the generateWorkoutPlan function.
 * - WorkoutPlanOutput - The return type for the generateWorkoutPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WorkoutPlanInputSchema = z.object({
  fitnessGoal: z
    .string()
    .describe("The user's fitness goal, e.g., 'lose weight', 'build muscle', 'increase endurance'."),
  fitnessLevel: z
    .string()
    .describe("The user's fitness level, e.g., 'beginner', 'intermediate', 'advanced'."),
  equipmentAvailable: z
    .string()
    .describe("The equipment available to the user, e.g., 'dumbbells, barbell, bench', 'bodyweight only', 'full gym'."),
  preferredDuration: z
    .string()
    .describe("The user's preferred workout duration in minutes, e.g., '30 minutes', '45 minutes', '60 minutes'."),
});

export type WorkoutPlanInput = z.infer<typeof WorkoutPlanInputSchema>;

const WorkoutPlanOutputSchema = z.object({
  workoutPlan: z.string().describe('The generated workout plan.'),
});

export type WorkoutPlanOutput = z.infer<typeof WorkoutPlanOutputSchema>;

export async function generateWorkoutPlan(input: WorkoutPlanInput): Promise<WorkoutPlanOutput> {
  return generateWorkoutPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'workoutPlanPrompt',
  input: {schema: WorkoutPlanInputSchema},
  output: {schema: WorkoutPlanOutputSchema},
  prompt: `You are a personal trainer. Generate a workout plan based on the user's fitness goal, fitness level, available equipment, and preferred duration.

Fitness Goal: {{{fitnessGoal}}}
Fitness Level: {{{fitnessLevel}}}
Equipment Available: {{{equipmentAvailable}}}
Preferred Duration: {{{preferredDuration}}}

Workout Plan:`,
});

const generateWorkoutPlanFlow = ai.defineFlow(
  {
    name: 'generateWorkoutPlanFlow',
    inputSchema: WorkoutPlanInputSchema,
    outputSchema: WorkoutPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
