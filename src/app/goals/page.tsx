'use client';

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Goal } from '@/lib/types';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Edit3, PlusCircle, Target, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const goalSchema = z.object({
  description: z.string().min(3, 'Description is required.'),
  targetMetric: z.enum(['weight', 'lift_pr', 'workout_frequency', 'custom']),
  targetValue: z.coerce.number().positive('Target value must be positive.'),
  currentValue: z.coerce.number().optional(),
  unit: z.string().optional(),
  deadline: z.string().optional(),
});

type GoalFormValues = z.infer<typeof goalSchema>;

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const { toast } = useToast();

  // Load goals from localStorage on mount
  useEffect(() => {
    const storedGoals = localStorage.getItem('aiSuperCoachGoals');
    if (storedGoals) {
      setGoals(JSON.parse(storedGoals));
    }
  }, []);

  // Save goals to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('aiSuperCoachGoals', JSON.stringify(goals));
  }, [goals]);

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      description: '',
      targetMetric: 'custom',
      targetValue: 0,
      currentValue: 0,
      unit: '',
      deadline: '',
    },
  });
  
  useEffect(() => {
    if (editingGoal) {
      form.reset({
        description: editingGoal.description,
        targetMetric: editingGoal.targetMetric,
        targetValue: Number(editingGoal.targetValue),
        currentValue: Number(editingGoal.currentValue) || 0,
        unit: editingGoal.unit || '',
        deadline: editingGoal.deadline ? new Date(editingGoal.deadline).toISOString().split('T')[0] : '',
      });
    } else {
      form.reset({
        description: '', targetMetric: 'custom', targetValue: 0, currentValue: 0, unit: '', deadline: ''
      });
    }
  }, [editingGoal, form, isDialogOpen]);


  const onSubmit: SubmitHandler<GoalFormValues> = (data) => {
    if (editingGoal) {
      setGoals(goals.map(g => g.id === editingGoal.id ? { ...editingGoal, ...data, targetValue: data.targetValue, currentValue: data.currentValue, isAchieved: (data.currentValue || 0) >= data.targetValue } : g));
      toast({ title: 'Goal Updated!', description: 'Your goal has been successfully updated.' });
    } else {
      const newGoal: Goal = {
        id: crypto.randomUUID(),
        ...data,
        targetValue: data.targetValue,
        currentValue: data.currentValue || 0,
        isAchieved: (data.currentValue || 0) >= data.targetValue,
        createdAt: new Date().toISOString(),
      };
      setGoals([...goals, newGoal]);
      toast({ title: 'Goal Set!', description: 'Your new goal has been added.' });
    }
    setIsDialogOpen(false);
    setEditingGoal(null);
    form.reset();
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
    toast({ title: 'Goal Deleted', description: 'The goal has been removed.', variant: 'destructive' });
  };
  
  const toggleAchieved = (id: string) => {
    setGoals(goals.map(g => g.id === id ? {...g, isAchieved: !g.isAchieved, currentValue: !g.isAchieved ? g.targetValue : g.currentValue} : g));
  };

  const openEditDialog = (goal: Goal) => {
    setEditingGoal(goal);
    setIsDialogOpen(true);
  };
  
  const openNewDialog = () => {
    setEditingGoal(null);
    form.reset();
    setIsDialogOpen(true);
  };


  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Your Fitness Goals" 
        description="Define what you want to achieve and track your progress."
        actions={
          <Button onClick={openNewDialog}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Goal
          </Button>
        }
      />

      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingGoal(null); }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editingGoal ? 'Edit Goal' : 'Add New Goal'}</DialogTitle>
            <DialogDescription>
              {editingGoal ? 'Update the details of your goal.' : 'Set a new fitness objective for yourself.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Input placeholder="e.g., Run a 5K, Lose 5kg" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="targetMetric"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metric Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select metric" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="weight">Weight (kg/lbs)</SelectItem>
                        <SelectItem value="lift_pr">Lift PR (kg/lbs)</SelectItem>
                        <SelectItem value="workout_frequency">Workouts per Week</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="currentValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Value</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 0" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="targetValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Value</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 5" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit (Optional)</FormLabel>
                    <FormControl><Input placeholder="e.g., kg, reps, km" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deadline (Optional)</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {setIsDialogOpen(false); setEditingGoal(null);}}>Cancel</Button>
                <Button type="submit">{editingGoal ? 'Update Goal' : 'Add Goal'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {goals.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Goals Yet</h3>
            <p className="text-muted-foreground mb-4">Start by adding your first fitness goal!</p>
            <Button onClick={openNewDialog}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const progress = Number(goal.targetValue) > 0 ? Math.min(100, ((Number(goal.currentValue) || 0) / Number(goal.targetValue)) * 100) : 0;
            return (
              <Card key={goal.id} className={`flex flex-col ${goal.isAchieved ? 'border-green-500 bg-green-500/10' : ''}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{goal.description}</CardTitle>
                    {goal.isAchieved && <CheckCircle className="h-6 w-6 text-green-500" />}
                  </div>
                  <CardDescription>
                    Target: {goal.targetValue} {goal.unit || ''}
                    {goal.deadline && ` by ${new Date(goal.deadline).toLocaleDateString()}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="mb-2">
                    Current: {goal.currentValue || 0} {goal.unit || ''}
                  </div>
                  <Progress value={progress} aria-label={`${progress.toFixed(0)}% complete`} className={goal.isAchieved ? '[&>*]:bg-green-500' : ''} />
                  <p className="text-xs text-muted-foreground mt-1">{progress.toFixed(0)}% complete</p>
                </CardContent>
                <CardFooter className="flex justify-between gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(goal)}>
                    <Edit3 className="mr-1 h-3 w-3" /> Edit
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteGoal(goal.id)} className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {!goal.isAchieved ? (
                    <Button size="sm" variant="outline" onClick={() => toggleAchieved(goal.id)}>Mark Achieved</Button>
                  ) : (
                     <Button size="sm" variant="outline" onClick={() => toggleAchieved(goal.id)}>Mark Unachieved</Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
