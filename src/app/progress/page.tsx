
'use client';

import { useState, useEffect, useMemo } from 'react'; // Added useMemo
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, LineChart, PieChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart';
import { TrendingUp, CalendarDays, Zap, Weight, AlertCircle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore'; // Removed 'where' as it's not used yet
import type { WorkoutLog, Goal } from '@/lib/types';
import { Bar, Line, Pie } from 'recharts'; // Assuming these are still needed by ChartContainer's children
import { Button } from '@/components/ui/button';


const chartConfigFreq: ChartConfig = {
  workouts: {
    label: "Workouts",
    color: "hsl(var(--chart-1))",
  },
};
const chartConfigWeight: ChartConfig = {
  weight: {
    label: "Weight (kg)",
    color: "hsl(var(--chart-2))",
  },
};
const chartConfigGoals: ChartConfig = {
  Completed: { label: "Completed", color: "hsl(var(--chart-1))" }, // Key matches processed data
  'In Progress': { label: "In Progress", color: "hsl(var(--chart-2))" }, // Key matches processed data
  'Pending': { label: "Pending", color: "hsl(var(--chart-3))" }, // Key matches processed data
};


export default function ProgressPage() {
  const [clientMounted, setClientMounted] = useState(false);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setClientMounted(true);
  }, []);

  // Data Fetching useEffect
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch workout logs
        const logsQuery = query(collection(db, 'workoutlogs'), orderBy('date', 'desc'));
        const logsSnapshot = await getDocs(logsQuery);
        const fetchedLogs: WorkoutLog[] = logsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            date: data.date, 
            exercises: data.exercises,
            overallRPE: data.overallRPE,
            durationMinutes: data.durationMinutes,
            notes: data.notes,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
          };
        });
        setWorkoutLogs(fetchedLogs);

        // Fetch goals
        const goalsQuery = query(collection(db, 'goals'), orderBy('createdAt', 'desc'));
        const goalsSnapshot = await getDocs(goalsQuery);
        const fetchedGoals: Goal[] = goalsSnapshot.docs.map(doc => {
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

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load progress data. Please try refreshing the page.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  
  // Memoized calculations
  const totalWorkoutsCount = useMemo(() => workoutLogs.length, [workoutLogs]);

  const { goalsAchievedCount, totalGoalsCount } = useMemo(() => {
    const achieved = goals.filter(g => g.isAchieved).length;
    return { goalsAchievedCount: achieved, totalGoalsCount: goals.length };
  }, [goals]);

  const workoutFrequencyData = useMemo(() => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1); 
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyCounts: { [key: string]: number } = {};
    const monthOrder: string[] = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleString('default', { month: 'short' });
      monthlyCounts[monthKey] = 0;
      monthOrder.push(monthKey);
    }
    
    workoutLogs.forEach(log => {
      const logDate = new Date(log.date);
      if (logDate >= sixMonthsAgo) {
        const monthKey = logDate.toLocaleString('default', { month: 'short' });
        if (monthlyCounts[monthKey] !== undefined) {
          monthlyCounts[monthKey]++;
        }
      }
    });
    return monthOrder.map(month => ({ month, workouts: monthlyCounts[month] }));
  }, [workoutLogs]);

  const goalProgressData = useMemo(() => {
    let completedGoals = 0;
    let inProgressGoals = 0;
    let pendingGoals = 0;
    goals.forEach(goal => {
      if (goal.isAchieved) {
        completedGoals++;
      } else if (goal.currentValue && Number(goal.currentValue) > 0 && Number(goal.currentValue) < Number(goal.targetValue)) {
        inProgressGoals++;
      } else {
        pendingGoals++;
      }
    });
    return [
      { name: 'Completed', value: completedGoals, fill: chartConfigGoals['Completed'].color as string },
      { name: 'In Progress', value: inProgressGoals, fill: chartConfigGoals['In Progress'].color as string },
      { name: 'Pending', value: pendingGoals, fill: chartConfigGoals['Pending'].color as string },
    ].filter(item => item.value > 0);
  }, [goals]);

  const consistencyStreak = useMemo(() => {
    let currentStreak = 0;
    let longestStreak = 0;
    if (workoutLogs.length > 0) {
        const sortedLogs = [...workoutLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const uniqueWorkoutDays = [...new Set(sortedLogs.map(log => new Date(log.date).setHours(0,0,0,0)))];
        
        if (uniqueWorkoutDays.length > 0) {
            currentStreak = 1; 
            longestStreak = 1;
            for (let i = 1; i < uniqueWorkoutDays.length; i++) {
                const diff = (uniqueWorkoutDays[i] - uniqueWorkoutDays[i-1]) / (1000 * 60 * 60 * 24);
                if (diff === 1) {
                    currentStreak++;
                } else {
                    longestStreak = Math.max(longestStreak, currentStreak);
                    currentStreak = 1; 
                }
            }
            longestStreak = Math.max(longestStreak, currentStreak); 
        }
    }
    return longestStreak;
  }, [workoutLogs]);

  const { currentWeight, weightChangeData } = useMemo(() => {
    const weightGoals = goals
      .filter(g => g.targetMetric === 'weight' && typeof g.currentValue === 'number' && g.createdAt)
      .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());

    if (weightGoals.length > 0) {
      return {
        currentWeight: Number(weightGoals[weightGoals.length - 1].currentValue),
        weightChangeData: weightGoals.map(g => ({
          date: new Date(g.createdAt!).toLocaleDateString('default', { month: 'short', day: 'numeric' }),
          weight: Number(g.currentValue),
        }))
      };
    }
    return { currentWeight: 'N/A', weightChangeData: [] };
  }, [goals]);

  if (!clientMounted || isLoading) {
    // Skeleton Loader (Simplified, as the original structure was tied to clientMounted only)
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Your Progress" description="Track your fitness journey and celebrate milestones." />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
             <Card key={i}>
              <CardHeader>
                <div className="h-5 w-3/4 bg-muted rounded animate-pulse mb-1"></div>
                <div className="h-4 w-1/2 bg-muted rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-1/4 bg-muted rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {[...Array(2)].map((_, i) => (
             <Card key={i}>
              <CardHeader>
                <div className="h-6 w-3/4 bg-muted rounded animate-pulse"></div>
                 <div className="h-4 w-1/2 bg-muted rounded animate-pulse mt-1"></div>
              </CardHeader>
              <CardContent className="h-64 bg-muted rounded animate-pulse"></CardContent>
            </Card>
          ))}
        </div>
         <Card>
            <CardHeader>
              <div className="h-6 w-1/4 bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-1/3 bg-muted rounded animate-pulse mt-1"></div>
            </CardHeader>
            <CardContent className="h-64 bg-muted rounded animate-pulse"></CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center h-[calc(100vh-200px)]">
        <AlertCircle className="w-16 h-16 text-destructive" />
        <h2 className="text-2xl font-semibold">Error Loading Progress</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Your Progress" description="Track your fitness journey and celebrate milestones." />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
            <CalendarDays className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWorkoutsCount}</div>
            {/* <p className="text-xs text-muted-foreground">+15% from last month</p> */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
            <Weight className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentWeight}{typeof currentWeight === 'number' ? ' kg' : ''}</div>
            {/* <p className="text-xs text-muted-foreground">-1.5 kg from last month</p> */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
            <Zap className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{consistencyStreak} days</div>
            <p className="text-xs text-muted-foreground">consecutive workout days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goals Achieved</CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goalsAchievedCount} / {totalGoalsCount}</div>
            {/* <p className="text-xs text-muted-foreground">Making great progress!</p> */}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Workout Frequency</CardTitle>
            <CardDescription>Number of workouts per month (last 6 months).</CardDescription>
          </CardHeader>
          <CardContent>
            {workoutFrequencyData.length > 0 ? (
              <ChartContainer config={chartConfigFreq} className="aspect-auto h-[300px]">
                <BarChart accessibilityLayer data={workoutFrequencyData}>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="workouts" fill="var(--color-workouts)" radius={4} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No workout data available for the last 6 months.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weight Change</CardTitle>
            <CardDescription>Your weight trend from 'weight' goals.</CardDescription>
          </CardHeader>
          <CardContent>
            {weightChangeData.length > 1 ? (
              <ChartContainer config={chartConfigWeight} className="aspect-auto h-[300px]">
                <LineChart accessibilityLayer data={weightChangeData} margin={{ left: 12, right: 12 }}>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line type="monotone" dataKey="weight" stroke="var(--color-weight)" strokeWidth={2} dot={false} />
                </LineChart>
              </ChartContainer>
            ) : (
               <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                {goals.some(g=>g.targetMetric === 'weight') ? "Need at least two 'weight' goal updates to show trend." : "No 'weight' goal data to display."}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Goal Progress</CardTitle>
          <CardDescription>Overview of your set goals.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          {goalProgressData.length > 0 ? (
             <ChartContainer config={chartConfigGoals} className="mx-auto aspect-square w-full max-w-[300px]">
                <PieChart accessibilityLayer>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={goalProgressData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    strokeWidth={5}
                  >
                    {goalProgressData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend
                    content={<ChartLegendContent nameKey="name" />}
                    className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                  />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No goal data available to display.
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
