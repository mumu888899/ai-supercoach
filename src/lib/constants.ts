import { LayoutDashboard, Sparkles, Dumbbell, LineChart, Target, Library, type LucideIcon } from 'lucide-react';
import type { Exercise } from '@/lib/types';

export interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_LINKS: NavLink[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/generate-plan', label: 'Generate Plan', icon: Sparkles },
  { href: '/log-workout', label: 'Log Workout', icon: Dumbbell },
  { href: '/progress', label: 'Progress', icon: LineChart },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/exercises', label: 'Exercises', icon: Library },
];

export const EXERCISE_LIBRARY_DATA: Exercise[] = [
  {
    id: '1',
    name: 'Push Up',
    instructions: '1. Start in a plank position. 2. Lower your body until your chest nearly touches the floor. 3. Push back up to the starting position.',
    imageUrl: '/images/push-up.png',
    dataAiHint: 'fitness exercise',
    equipment: ['Bodyweight'],
    targetMuscles: ['Chest', 'Shoulders', 'Triceps'],
    difficulty: 'Beginner',
  },
  {
    id: '2',
    name: 'Squat',
    instructions: '1. Stand with your feet shoulder-width apart. 2. Lower your hips as if sitting in a chair. 3. Keep your chest up and back straight. 4. Return to the starting position.',
    imageUrl: '/images/squat.png',
    dataAiHint: 'fitness workout',
    equipment: ['Bodyweight', 'Barbell', 'Dumbbells'],
    targetMuscles: ['Quads', 'Glutes', 'Hamstrings'],
    difficulty: 'Beginner',
  },
  {
    id: '3',
    name: 'Plank',
    instructions: '1. Hold a push-up position with your forearms on the ground. 2. Keep your body in a straight line from head to heels. 3. Engage your core.',
    imageUrl: '/images/plank.png',
    dataAiHint: 'yoga core',
    equipment: ['Bodyweight'],
    targetMuscles: ['Core', 'Abs'],
    difficulty: 'Beginner',
  },
  {
    id: '4',
    name: 'Bicep Curl',
    instructions: '1. Stand or sit holding dumbbells with an underhand grip. 2. Curl the weights up towards your shoulders. 3. Lower slowly.',
    imageUrl: '/images/bicep-curl.png',
    dataAiHint: 'weightlifting arm',
    equipment: ['Dumbbells', 'Barbell'],
    targetMuscles: ['Biceps'],
    difficulty: 'Beginner',
  },
  {
    id: '5',
    name: 'Lunge',
    instructions: '1. Step forward with one leg. 2. Lower your hips until both knees are bent at a 90-degree angle. 3. Push back to the starting position. Repeat with the other leg.',
    imageUrl: '/images/lunge.png',
    dataAiHint: 'fitness leg',
    equipment: ['Bodyweight', 'Dumbbells'],
    targetMuscles: ['Quads', 'Glutes', 'Hamstrings'],
    difficulty: 'Intermediate',
  },
  {
    id: '6',
    name: 'Deadlift',
    instructions: '1. Stand with feet hip-width apart, barbell over midfoot. 2. Hinge at hips, slight knee bend, grip bar outside knees. 3. Keep back straight, chest up. 4. Lift by extending hips and knees, keeping bar close to body. 5. Lower by reversing motion.',
    imageUrl: '/images/deadlift.png',
    dataAiHint: 'powerlifting strength',
    equipment: ['Barbell'],
    targetMuscles: ['Back', 'Glutes', 'Hamstrings', 'Core'],
    difficulty: 'Advanced',
  },
];
