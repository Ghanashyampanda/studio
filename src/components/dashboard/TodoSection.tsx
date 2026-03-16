"use client";

import { useState } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ListTodo, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function TodoSection() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [newTask, setNewTask] = useState('');

  const tasksQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'tasks');
  }, [db, user]);
  const { data: tasks, isLoading } = useCollection(tasksQuery);

  const addTask = () => {
    if (!db || !user || !newTask.trim()) return;
    const tasksRef = collection(db, 'users', user.uid, 'tasks');
    addDocumentNonBlocking(tasksRef, {
      userId: user.uid,
      title: newTask,
      completed: false,
      createdAt: new Date().toISOString()
    });
    setNewTask('');
    toast({ title: "Task Registered", description: "Operation added to daily queue." });
  };

  const toggleTask = (taskId: string, currentStatus: boolean) => {
    if (!db || !user) return;
    const taskRef = doc(db, 'users', user.uid, 'tasks', taskId);
    updateDocumentNonBlocking(taskRef, { completed: !currentStatus });
  };

  const deleteTask = (taskId: string) => {
    if (!db || !user) return;
    const taskRef = doc(db, 'users', user.uid, 'tasks', taskId);
    deleteDocumentNonBlocking(taskRef);
    toast({ title: "Task Terminated", description: "Entry removed from queue." });
  };

  return (
    <Card className="bg-card border-border shadow-sm rounded-[2.5rem] overflow-hidden">
      <CardHeader className="bg-muted/30 border-b border-border p-6">
        <CardTitle className="text-lg flex items-center gap-3 font-black tracking-tight uppercase text-foreground">
          <ListTodo className="h-5 w-5 text-primary" />
          Daily Operations
        </CardTitle>
        <CardDescription className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
          Tactical Task Queue
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        <div className="flex gap-2">
          <Input 
            placeholder="New Task (e.g. Morning Vitals)" 
            value={newTask} 
            onChange={(e) => setNewTask(e.target.value)}
            className="h-11 rounded-xl bg-muted/50 border-transparent text-xs font-bold"
          />
          <Button onClick={addTask} size="icon" className="h-11 w-11 shrink-0 rounded-xl bg-primary text-white shadow-lg">
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-3">
          {tasks?.map(task => (
            <div key={task.id} className="flex items-center justify-between p-4 border border-border rounded-2xl bg-muted/20 group hover:bg-muted/40 transition-all">
              <div className="flex items-center gap-3">
                <Checkbox 
                  checked={task.completed} 
                  onCheckedChange={() => toggleTask(task.id, task.completed)}
                  className="h-5 w-5 rounded-lg"
                />
                <span className={`text-xs font-bold uppercase ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {task.title}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted hover:text-destructive"
                onClick={() => deleteTask(task.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {tasks?.length === 0 && (
            <p className="text-center py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Queue empty</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}