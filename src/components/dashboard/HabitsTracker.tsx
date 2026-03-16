
"use client";

import { useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, Flame, Plus, Loader2, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export function HabitsTracker() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [newHabit, setNewHabit] = useState('');

  const habitsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'habits');
  }, [db, user]);
  const { data: habits, isLoading } = useCollection(habitsQuery);

  const addHabit = () => {
    if (!db || !user || !newHabit.trim()) return;
    const habitsRef = collection(db, 'users', user.uid, 'habits');
    addDocumentNonBlocking(habitsRef, {
      userId: user.uid,
      title: newHabit,
      streak: 0,
      lastCheckInDate: '',
      createdAt: new Date().toISOString()
    });
    setNewHabit('');
    toast({ title: "Habit Protocol Initiated", description: "Node added to your wellness grid." });
  };

  const checkIn = (habit: any) => {
    if (!db || !user) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    if (habit.lastCheckInDate === today) {
      toast({ title: "Check-in Redundant", description: "Already synchronized for today." });
      return;
    }

    const habitRef = doc(db, 'users', user.uid, 'habits', habit.id);
    const newStreak = habit.streak + 1;
    
    updateDocumentNonBlocking(habitRef, {
      streak: newStreak,
      lastCheckInDate: today
    });

    toast({ title: "Check-in Successful", description: `Streak extended: ${newStreak} days.` });
  };

  return (
    <Card className="bg-card border-border shadow-sm rounded-[2.5rem] overflow-hidden">
      <CardHeader className="bg-muted/30 border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-3 font-black tracking-tight uppercase text-foreground">
              <Sparkles className="h-5 w-5 text-primary" />
              Habit Tracker
            </CardTitle>
            <CardDescription className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
              Core Physiological Discipline
            </CardDescription>
          </div>
          <Flame className="h-5 w-5 text-secondary animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        <div className="flex gap-2">
          <Input 
            placeholder="New Habit (e.g. Hydration)" 
            value={newHabit} 
            onChange={(e) => setNewHabit(e.target.value)}
            className="h-11 rounded-xl bg-muted/50 border-transparent text-xs font-bold"
          />
          <Button onClick={addHabit} size="icon" className="h-11 w-11 shrink-0 rounded-xl bg-primary text-white shadow-lg">
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : habits?.map(habit => (
            <div key={habit.id} className="flex items-center justify-between p-4 border border-border rounded-2xl bg-muted/20 group hover:bg-muted/40 transition-all">
              <div className="space-y-0.5">
                <p className="text-xs font-black text-foreground uppercase tracking-tight">{habit.title}</p>
                <div className="flex items-center gap-2">
                  <Flame className="h-3 w-3 text-secondary" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase">{habit.streak} Day Streak</span>
                </div>
              </div>
              <Button 
                variant={habit.lastCheckInDate === format(new Date(), 'yyyy-MM-dd') ? 'secondary' : 'outline'}
                size="sm"
                className="rounded-xl text-[10px] font-black uppercase"
                onClick={() => checkIn(habit)}
              >
                {habit.lastCheckInDate === format(new Date(), 'yyyy-MM-dd') ? 'Synced' : 'Check-in'}
              </Button>
            </div>
          ))}
          {habits?.length === 0 && (
            <p className="text-center py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">No active habits</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
