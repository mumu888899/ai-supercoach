
'use client';

import React, { useState, useCallback } from 'react'; // Added React, useCallback
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { EXERCISE_LIBRARY_DATA } from '@/lib/constants';
import type { Exercise } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, Info, User } from 'lucide-react'; // Changed Barbell to Dumbbell


// Define ExerciseCard component
interface ExerciseCardProps {
  exercise: Exercise;
  onSelect: (exercise: Exercise) => void;
}

const ExerciseCard = React.memo(({ exercise, onSelect }: ExerciseCardProps) => {
  return (
    <Card 
      className="flex flex-col cursor-pointer transition-all hover:shadow-lg hover:border-primary"
      onClick={() => onSelect(exercise)}
    >
      <CardHeader className="p-0">
        <div className="aspect-video relative w-full overflow-hidden rounded-t-lg">
          <Image
            src={exercise.imageUrl || "https://placehold.co/600x400.png"}
            alt={exercise.name}
            layout="fill"
            objectFit="cover"
            data-ai-hint={exercise.dataAiHint || "fitness exercise"}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg mb-1">{exercise.name}</CardTitle>
        <div className="flex items-center text-xs text-muted-foreground mb-2">
          <Dumbbell className="h-3 w-3 mr-1" /> {exercise.equipment.join(', ')}
        </div>
          <div className="flex items-center text-xs text-muted-foreground">
          <User className="h-3 w-3 mr-1" /> {exercise.targetMuscles.slice(0,2).join(', ')}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Badge variant={exercise.difficulty === 'Beginner' ? 'secondary' : exercise.difficulty === 'Intermediate' ? 'outline' : 'default'}>
          {exercise.difficulty}
        </Badge>
      </CardFooter>
    </Card>
  );
});
ExerciseCard.displayName = 'ExerciseCard'; // For better debugging

export default function ExercisesPage() {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const handleSelectExercise = useCallback((exercise: Exercise) => {
    setSelectedExercise(exercise);
  }, []); // setSelectedExercise is stable

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Exercise Library" description="Discover new exercises and learn proper form." />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {EXERCISE_LIBRARY_DATA.map((exercise) => (
          <Dialog key={exercise.id} onOpenChange={(open) => !open && setSelectedExercise(null)}>
            <DialogTrigger asChild>
              <ExerciseCard exercise={exercise} onSelect={handleSelectExercise} />
            </DialogTrigger>
            {selectedExercise && selectedExercise.id === exercise.id && (
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedExercise.name}</DialogTitle>
                 <div className="aspect-video relative w-full overflow-hidden rounded-lg mt-2">
                    <Image
                      src={selectedExercise.imageUrl || "https://placehold.co/600x400.png"}
                      alt={selectedExercise.name}
                      layout="fill"
                      objectFit="cover"
                      data-ai-hint={selectedExercise.dataAiHint || "fitness exercise"}
                    />
                  </div>
              </DialogHeader>
              <div className="py-4 space-y-3">
                <div>
                  <h4 className="font-semibold mb-1">Instructions:</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{selectedExercise.instructions}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Equipment:</h4>
                  <p className="text-sm text-muted-foreground">{selectedExercise.equipment.join(', ')}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Target Muscles:</h4>
                  <p className="text-sm text-muted-foreground">{selectedExercise.targetMuscles.join(', ')}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Difficulty:</h4>
                  <Badge variant={selectedExercise.difficulty === 'Beginner' ? 'secondary' : selectedExercise.difficulty === 'Intermediate' ? 'outline' : 'default'}>
                    {selectedExercise.difficulty}
                  </Badge>
                </div>
              </div>
            </DialogContent>
            )}
          </Dialog>
        ))}
      </div>
    </div>
  );
}
