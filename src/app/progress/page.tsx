
'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, LineChart, PieChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart';
import { TrendingUp, CalendarDays, Zap, Weight } from 'lucide-react';

// Mock data - replace with actual data fetching and processing
const mockWorkoutFrequencyData = [
  { month: "Jan", workouts: 12, desktop: 12 },
  { month: "Feb", workouts: 15, desktop: 15 },
  { month: "Mar", workouts: 10, desktop: 10 },
  { month: "Apr", workouts: 18, desktop: 18 },
  { month: "May", workouts: 16, desktop: 16 },
  { month: "Jun", workouts: 20, desktop: 20 },
];

const mockWeightChangeData = [
  { date: "2024-01-01", weight: 75 },
  { date: "2024-02-01", weight: 74 },
  { date: "2024-03-01", weight: 73.5 },
  { date: "2024-04-01", weight: 72 },
  { date: "2024-05-01", weight: 71.5 },
  { date: "2024-06-01", weight: 70 },
];

const mockGoalProgressData = [
  { name: "Completed", value: 3, fill: "hsl(var(--chart-1))" },
  { name: "In Progress", value: 2, fill: "hsl(var(--chart-2))" },
  { name: "Pending", value: 1, fill: "hsl(var(--chart-3))" },
];

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
  completed: { label: "Completed", color: "hsl(var(--chart-1))" },
  inProgress: { label: "In Progress", color: "hsl(var(--chart-2))" },
  pending: { label: "Pending", color: "hsl(var(--chart-3))" },
};


export default function ProgressPage() {
  const [clientMounted, setClientMounted] = useState(false);
  useEffect(() => {
    setClientMounted(true);
  }, []);

  if (!clientMounted) {
    // Render placeholder or skeleton while waiting for client mount to avoid hydration mismatch with charts
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Your Progress" description="Track your fitness journey and celebrate milestones." />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3,4].map(i => (
            <Card key={i} className="h-[120px] animate-pulse bg-muted"></Card>
          ))}
        </div>
         <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <Card className="h-[350px] animate-pulse bg-muted"></Card>
            <Card className="h-[350px] animate-pulse bg-muted"></Card>
        </div>
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
            <div className="text-2xl font-bold">73</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
            <Weight className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">70 kg</div>
            <p className="text-xs text-muted-foreground">-1.5 kg from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consistency Streak</CardTitle>
            <Zap className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 days</div>
            <p className="text-xs text-muted-foreground">Keep it up!</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goals Achieved</CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3 / 5</div>
            <p className="text-xs text-muted-foreground">Making great progress!</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Workout Frequency</CardTitle>
            <CardDescription>Number of workouts per month.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfigFreq} className="aspect-auto h-[300px]">
              <BarChart accessibilityLayer data={mockWorkoutFrequencyData}>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="workouts" fill="var(--color-workouts)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weight Change</CardTitle>
            <CardDescription>Your weight trend over time.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfigWeight} className="aspect-auto h-[300px]">
              <LineChart accessibilityLayer data={mockWeightChangeData} margin={{ left: 12, right: 12 }}>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line type="monotone" dataKey="weight" stroke="var(--color-weight)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Goal Progress</CardTitle>
          <CardDescription>Overview of your set goals.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
           <ChartContainer config={chartConfigGoals} className="mx-auto aspect-square w-full max-w-[300px]">
              <PieChart accessibilityLayer>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={mockGoalProgressData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  strokeWidth={5}
                />
                <ChartLegend
                  content={<ChartLegendContent nameKey="name" />}
                  className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                />
              </PieChart>
            </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
