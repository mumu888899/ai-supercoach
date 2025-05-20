import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/shared/PageHeader';
import { ArrowRight, Sparkles, Dumbbell, LineChart, Target, Library } from 'lucide-react';

const features = [
  {
    title: 'Generate Workout Plan',
    description: 'Let AI craft a personalized workout plan just for you.',
    href: '/generate-plan',
    icon: <Sparkles className="h-8 w-8 text-primary" />,
    cta: 'Get Started',
  },
  {
    title: 'Log Workout',
    description: 'Track your exercises, sets, reps, and effort levels.',
    href: '/log-workout',
    icon: <Dumbbell className="h-8 w-8 text-primary" />,
    cta: 'Log Now',
  },
  {
    title: 'Track Progress',
    description: 'Visualize your journey with charts and summaries.',
    href: '/progress',
    icon: <LineChart className="h-8 w-8 text-primary" />,
    cta: 'View Progress',
  },
  {
    title: 'Set Goals',
    description: 'Define your fitness objectives and monitor achievements.',
    href: '/goals',
    icon: <Target className="h-8 w-8 text-primary" />,
    cta: 'Set Goals',
  },
  {
    title: 'Exercise Library',
    description: 'Explore exercises with detailed instructions and visuals.',
    href: '/exercises',
    icon: <Library className="h-8 w-8 text-primary" />,
    cta: 'Browse Library',
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Welcome to AI SuperCoach" description="Your personalized AI fitness partner. Let's get started!" />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="flex flex-col transition-all hover:shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                {feature.icon}
                <Link href={feature.href} legacyBehavior>
                  <Button variant="ghost" size="icon" className="text-accent-foreground hover:bg-accent/20">
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <CardTitle className="mt-4 text-xl">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
             <div className="p-6 pt-0">
               <Link href={feature.href} legacyBehavior>
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  {feature.cta}
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <Card className="transition-all hover:shadow-lg">
        <CardHeader>
          <CardTitle>Quick Tip</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Consistency is key! Try to log your workouts regularly to get the most accurate feedback and track your progress effectively.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
