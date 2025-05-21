'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react'; // Added React, useCallback, useMemo
import { useForm, type SubmitHandler } from 'react-hook-form';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  Timestamp, 
  query, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
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

// Define GoalCard component
interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
  onToggleAchieved: (id: string) => void;
}

const GoalCard = React.memo(({ goal, onEdit, onDelete, onToggleAchieved }: GoalCardProps) => {
  const progress = useMemo(() => 
    Number(goal.targetValue) > 0 ? Math.min(100, ((Number(goal.currentValue) || 0) / Number(goal.targetValue)) * 100) : 0
  , [goal.currentValue, goal.targetValue]);

  return (
    <Card className={`flex flex-col ${goal.isAchieved ? 'border-green-500 bg-green-500/10' : ''}`}>
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
        <Button variant="outline" size="sm" onClick={() => onEdit(goal)}>
          <Edit3 className="mr-1 h-3 w-3" /> Edit
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(goal.id)} className="text-destructive hover:bg-destructive/10">
          <Trash2 className="h-4 w-4" />
        </Button>
        {!goal.isAchieved ? (
          <Button size="sm" variant="outline" onClick={() => onToggleAchieved(goal.id)}>Mark Achieved</Button>
        ) : (
            <Button size="sm" variant="outline" onClick={() => onToggleAchieved(goal.id)}>Mark Unachieved</Button>
        )}
      </CardFooter>
    </Card>
  );
});
GoalCard.displayName = 'GoalCard'; // For better debugging

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isLoading, setIsLoading] = useState(true); 
  const { toast } = useToast();

  const fetchGoals = useCallback(async () => { // Wrapped fetchGoals in useCallback
    setIsLoading(true);
    try {
      const goalsQuery = query(collection(db, 'goals'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(goalsQuery);
      const fetchedGoals: Goal[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          description: data.description,
          targetMetric: data.targetMetric,
          targetValue: data.targetValue,
          currentValue: data.currentValue,
          unit: data.unit,
          deadline: data.deadline ? (data.deadline.toDate ? data.deadline.toDate().toISOString().split('T')[0] : data.deadline) : undefined,
          isAchieved: data.isAchieved,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(), 
        };
      });
      setGoals(fetchedGoals);
    } catch (error) {
      console.error("Error fetching goals: ", error);
      toast({ title: 'Error', description: 'Failed to fetch goals. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]); // Added toast as dependency, assuming it's stable. If not, it should be memoized too or removed if not directly used by fetchGoals logic.

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]); // fetchGoals is now a dependency

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


  const onSubmit: SubmitHandler<GoalFormValues> = async (data) => {
    try {
      if (editingGoal) {
        // Update existing goal
        const goalRef = doc(db, 'goals', editingGoal.id);
        const updatedGoalData = {
          ...data,
          deadline: data.deadline || null, // Ensure undefined is stored as null or handled
          isAchieved: (data.currentValue || 0) >= data.targetValue,
          // createdAt will not be updated, or use serverTimestamp.FieldValue.serverTimestamp() if needed for an 'updatedAt' field
        };
        await updateDoc(goalRef, updatedGoalData);
        toast({ title: 'Goal Updated!', description: 'Your goal has been successfully updated.' });
      } else {
        // Add new goal
        const newGoalData = {
          ...data,
          currentValue: data.currentValue || 0,
          isAchieved: (data.currentValue || 0) >= data.targetValue,
          createdAt: serverTimestamp(), 
          deadline: data.deadline || null,
        };
        await addDoc(collection(db, 'goals'), newGoalData);
        toast({ title: 'Goal Set!', description: 'Your new goal has been added.' });
      }
      setIsDialogOpen(false);
      setEditingGoal(null);
      form.reset();
      fetchGoals(); 
    } catch (error) {
      console.error("Error saving goal: ", error);
      toast({ title: 'Error', description: 'Failed to save goal. Please try again.', variant: 'destructive' });
    }
  }; // onSubmit does not need useCallback as it's directly used by form.handleSubmit

  const deleteGoal = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, 'goals', id));
      toast({ title: 'Goal Deleted', description: 'The goal has been removed.'});
      fetchGoals(); 
    } catch (error) {
      console.error("Error deleting goal: ", error);
      toast({ title: 'Error', description: 'Failed to delete goal. Please try again.', variant: 'destructive' });
    }
  }, [fetchGoals, toast]);
  
  const toggleAchieved = useCallback(async (id: string) => {
    const goalToToggle = goals.find(g => g.id === id);
    if (!goalToToggle) return;

    try {
      const goalRef = doc(db, 'goals', id);
      const newAchievedState = !goalToToggle.isAchieved;
      await updateDoc(goalRef, {
        isAchieved: newAchievedState,
        currentValue: newAchievedState ? goalToToggle.targetValue : goalToToggle.currentValue, 
      });
      toast({ title: 'Goal Updated!', description: `Goal marked as ${newAchievedState ? 'achieved' : 'unachieved'}.` });
      fetchGoals(); 
    } catch (error) {
      console.error("Error updating goal achievement: ", error);
      toast({ title: 'Error', description: 'Failed to update goal. Please try again.', variant: 'destructive' });
    }
  }, [goals, fetchGoals, toast]); // goals is a dependency here

  const openEditDialog = useCallback((goal: Goal) => {
    setEditingGoal(goal);
    setIsDialogOpen(true);
  }, []); // No dependencies if setEditingGoal and setIsDialogOpen are stable
  
  const openNewDialog = useCallback(() => {
    setEditingGoal(null);
    form.reset(); // form might be a dependency if not stable
    setIsDialogOpen(true);
  }, [form]); // Added form as dependency


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

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Target className="h-12 w-12 animate-pulse text-primary" /> 
          <p className="ml-3 text-muted-foreground">Loading your goals...</p>
        </div>
      ) : goals.length === 0 ? (
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
          {goals.map((goal) => (
            <GoalCard 
              key={goal.id} 
              goal={goal} 
              onEdit={openEditDialog} 
              onDelete={deleteGoal} 
              onToggleAchieved={toggleAchieved} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
