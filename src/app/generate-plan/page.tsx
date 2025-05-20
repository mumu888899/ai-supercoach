'use client';

import { useState, useTransition } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateWorkoutPlan, type WorkoutPlanOutput } from '@/ai/flows/workout-plan-generator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/shared/PageHeader';
import { Loader2, Sparkles } from 'lucide-react';
import type { FitnessLevel } from '@/lib/types';

const workoutPlanSchema = z.object({
  fitnessGoal: z.string().min(3, 'Fitness goal is required.'),
  fitnessLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  equipmentAvailable: z.string().min(3, 'Please list available equipment.'),
  preferredDuration: z.string().min(2, 'Preferred duration is required (e.g., 30 minutes).'),
});

type WorkoutPlanFormValues = z.infer<typeof workoutPlanSchema>;

export default function GeneratePlanPage() {
  const [generatedPlan, setGeneratedPlan] = useState<WorkoutPlanOutput | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<WorkoutPlanFormValues>({
    resolver: zodResolver(workoutPlanSchema),
    defaultValues: {
      fitnessGoal: '',
      fitnessLevel: 'Beginner',
      equipmentAvailable: 'Bodyweight only',
      preferredDuration: '45 minutes',
    },
  });

  const onSubmit: SubmitHandler<WorkoutPlanFormValues> = (data) => {
    startTransition(async () => {
      try {
        setGeneratedPlan(null);
        const result = await generateWorkoutPlan(data);
        setGeneratedPlan(result);
        toast({
          title: 'Workout Plan Generated!',
          description: 'Your personalized plan is ready.',
        });
      } catch (error) {
        console.error('Error generating workout plan:', error);
        toast({
          title: 'Error',
          description: 'Failed to generate workout plan. Please try again.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="AI Workout Plan Generator" description="Tell us about your goals, and we'll create a plan for you." />
      
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Your Details</CardTitle>
              <CardDescription>Provide some information to help us tailor your plan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="fitnessGoal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Fitness Goal</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Lose weight, Build muscle" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fitnessLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Fitness Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your fitness level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="equipmentAvailable"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipment Available</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Dumbbells, resistance bands, full gym, bodyweight only" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preferredDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Workout Duration</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 30 minutes, 1 hour" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Generate Plan
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {isPending && !generatedPlan && (
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px]">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Generating your personalized plan...</p>
          </CardContent>
        </Card>
      )}

      {generatedPlan && (
        <Card>
          <CardHeader>
            <CardTitle>Your Personalized Workout Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-md overflow-x-auto">
              {generatedPlan.workoutPlan}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
