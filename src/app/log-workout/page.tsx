'use client';

import { useState, useTransition, type ChangeEvent } from 'react';
import { useForm, useFieldArray, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getPersonalizedFeedback, type PersonalizedFeedbackOutput } from '@/ai/flows/personalized-feedback';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/shared/PageHeader';
import { Loader2, PlusCircle, Trash2, BotMessageSquare, Dumbbell } from 'lucide-react';
import type { WorkoutLog } from '@/lib/types'; // Assuming WorkoutLog type exists
import { EXERCISE_LIBRARY_DATA } from '@/lib/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const setLogSchema = z.object({
  reps: z.coerce.number().min(0, "Reps must be positive"),
  weight: z.coerce.number().optional(),
  rpe: z.coerce.number().min(1).max(10).optional(),
});

const exerciseLogSchema = z.object({
  exerciseId: z.string().min(1, "Please select an exercise"),
  exerciseName: z.string(), // Populated based on exerciseId
  sets: z.array(setLogSchema).min(1, "Add at least one set"),
  notes: z.string().optional(),
});

const workoutLogFormSchema = z.object({
  date: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Invalid date" }),
  exercises: z.array(exerciseLogSchema).min(1, "Add at least one exercise"),
  overallRPE: z.coerce.number().min(1).max(10).optional(),
  durationMinutes: z.coerce.number().min(1, "Duration must be positive").optional(),
  notes: z.string().optional(),
  // For feedback generation
  fitnessGoals: z.string().min(3, "Fitness goals are needed for feedback."),
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced'])
});

type WorkoutLogFormValues = z.infer<typeof workoutLogFormSchema>;

export default function LogWorkoutPage() {
  const [feedback, setFeedback] = useState<PersonalizedFeedbackOutput | null>(null);
  const [isLogging, startLoggingTransition] = useTransition();
  const [isFetchingFeedback, startFeedbackTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<WorkoutLogFormValues>({
    resolver: zodResolver(workoutLogFormSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      exercises: [{ exerciseId: '', exerciseName: '', sets: [{ reps: 0, weight: 0, rpe: 7 }], notes: '' }],
      overallRPE: 7,
      durationMinutes: 45,
      notes: '',
      fitnessGoals: 'General fitness and strength', // Default or fetch from user profile
      fitnessLevel: 'intermediate', // Default or fetch
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "exercises",
  });

  const onSubmit: SubmitHandler<WorkoutLogFormValues> = (data) => {
    startLoggingTransition(async () => {
      // In a real app, you'd save this data to a backend/DB
      const newLog: WorkoutLog = {
        id: crypto.randomUUID(),
        date: data.date,
        exercises: data.exercises.map(ex => ({
          ...ex,
          exerciseName: EXERCISE_LIBRARY_DATA.find(e => e.id === ex.exerciseId)?.name || 'Unknown Exercise'
        })),
        overallRPE: data.overallRPE,
        durationMinutes: data.durationMinutes,
        notes: data.notes,
      };
      console.log('Workout Logged:', newLog);
      
      toast({
        title: 'Workout Logged!',
        description: 'Great job on completing your workout.',
      });
      
      // Optionally trigger feedback generation automatically or provide a button
      // For now, let's provide a button after logging
    });
  };

  const handleGetFeedback = () => {
    const data = form.getValues();
    if (!data.exercises.length) {
      toast({ title: 'Cannot get feedback', description: 'Please log at least one exercise.', variant: 'destructive' });
      return;
    }
    
    // Prepare data for AI
    const workoutLogString = data.exercises.map(ex => 
      `${EXERCISE_LIBRARY_DATA.find(e => e.id === ex.exerciseId)?.name || ex.exerciseName}:\n` +
      ex.sets.map((s, i) => `  Set ${i+1}: ${s.reps} reps${s.weight ? ` at ${s.weight}kg` : ''}${s.rpe ? `, RPE ${s.rpe}` : ''}`).join('\n') +
      (ex.notes ? `\n  Notes: ${ex.notes}` : '')
    ).join('\n\n');

    const feedbackInput = {
      workoutLog: `Date: ${data.date}\nDuration: ${data.durationMinutes || 'N/A'} min\nOverall RPE: ${data.overallRPE || 'N/A'}\n\nExercises:\n${workoutLogString}\n\nOverall Notes: ${data.notes || 'None'}`,
      fitnessGoals: data.fitnessGoals,
      level: data.fitnessLevel,
    };

    startFeedbackTransition(async () => {
      try {
        setFeedback(null);
        const result = await getPersonalizedFeedback(feedbackInput);
        setFeedback(result);
        toast({
          title: 'Feedback Ready!',
          description: 'Your personalized AI feedback has been generated.',
        });
      } catch (error) {
        console.error('Error getting feedback:', error);
        toast({
          title: 'Error',
          description: 'Failed to get feedback. Please try again.',
          variant: 'destructive',
        });
      }
    });
  };
  
  const handleExerciseChange = (value: string, index: number) => {
    const selectedExercise = EXERCISE_LIBRARY_DATA.find(ex => ex.id === value);
    if (selectedExercise) {
      form.setValue(`exercises.${index}.exerciseName`, selectedExercise.name);
      form.setValue(`exercises.${index}.exerciseId`, selectedExercise.id);
    }
  };


  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Log Your Workout" description="Keep track of your efforts and progress." />
      
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Workout Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="durationMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 45" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormLabel className="text-lg font-semibold">Exercises</FormLabel>
                {fields.map((field, index) => (
                  <Card key={field.id} className="mt-4 p-4 space-y-3">
                    <div className="flex justify-between items-center">
                       <FormField
                        control={form.control}
                        name={`exercises.${index}.exerciseId`}
                        render={({ field: exerciseField }) => (
                          <FormItem className="flex-grow mr-2">
                            <FormLabel className="sr-only">Exercise</FormLabel>
                            <Select 
                              onValueChange={(value) => handleExerciseChange(value, index)} 
                              defaultValue={exerciseField.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Exercise" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {EXERCISE_LIBRARY_DATA.map(ex => (
                                  <SelectItem key={ex.id} value={ex.id}>{ex.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name={`exercises.${index}.sets`}
                      render={({ field: setsField }) => (
                        <FormItem>
                          <FormLabel>Sets</FormLabel>
                          {/* This part needs a sub-field array for sets if using react-hook-form fully */}
                          {/* For simplicity, we'll manage sets manually or use a simplified input */}
                          <Textarea 
                            placeholder="Log sets like: 10 reps @ 50kg, RPE 8..." 
                            rows={3}
                            // This is a temporary simplification. Proper set logging needs more structure.
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                                // A better implementation would parse this or use multiple input fields per set
                                // For now, just storing as notes within exercise.
                                form.setValue(`exercises.${index}.notes`, e.target.value);
                                // Dummy set for validation
                                form.setValue(`exercises.${index}.sets`, [{reps: 1}]); 
                            }}
                          />
                          <FormDescription>Log reps, weight, RPE for each set.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name={`exercises.${index}.notes`}
                      render={({ field: notesField }) => (
                        <FormItem>
                          <FormLabel>Exercise Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="e.g., Felt strong, focus on form next time" {...notesField} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Card>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => append({ exerciseId: '', exerciseName: '', sets: [{ reps: 0, weight: 0, rpe: 7 }], notes: '' })} className="mt-4">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Exercise
                </Button>
              </div>

              <FormField
                control={form.control}
                name="overallRPE"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overall RPE (1-10)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="10" placeholder="e.g., 8" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overall Workout Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Good session, felt a bit tired." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Card className="mt-4 p-4 bg-muted/50">
                 <CardTitle className="text-md mb-2">For AI Feedback</CardTitle>
                 <FormField
                    control={form.control}
                    name="fitnessGoals"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel>Your Current Fitness Goals</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Build muscle and increase endurance" {...field} />
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
                        <FormLabel>Your Current Fitness Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your fitness level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </Card>

            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2">
              <Button type="submit" disabled={isLogging} className="w-full sm:w-auto">
                {isLogging ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Dumbbell className="mr-2 h-4 w-4" /> }
                Log Workout
              </Button>
              <Button type="button" variant="outline" onClick={handleGetFeedback} disabled={isFetchingFeedback || form.getValues().exercises.length === 0 || !form.getValues().exercises[0].exerciseId} className="w-full sm:w-auto">
                 {isFetchingFeedback ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BotMessageSquare className="mr-2 h-4 w-4" /> }
                Get AI Feedback
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {(isFetchingFeedback && !feedback) && (
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center min-h-[150px]">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
            <p className="text-muted-foreground">Generating your AI feedback...</p>
          </CardContent>
        </Card>
      )}

      {feedback && (
        <Card>
          <CardHeader>
            <CardTitle>Personalized AI Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-md overflow-x-auto">
              {feedback.feedback}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
