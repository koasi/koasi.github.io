'use client';

import type { FC, FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { Task } from '@/lib/types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';

interface TodoListProps {
  tasks: Task[];
  onAddTask: (text: string) => void;
  onToggleTask: (id: number) => void;
  onDeleteTask: (id: number) => void;
}

export const TodoList: FC<TodoListProps> = ({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = event.currentTarget.elements.namedItem('task-input') as HTMLInputElement;
    if (input.value.trim()) {
      onAddTask(input.value.trim());
      input.value = '';
    }
  };

  return (
    <Card className="w-full h-full shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline">To-Do List</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-[calc(100%-80px)]">
        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
          <Input name="task-input" placeholder="Add a new task..." />
          <Button type="submit" size="icon" aria-label="Add Task">
            <Plus />
          </Button>
        </form>
        <ScrollArea className="flex-grow pr-4">
          <div className="space-y-3">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-background hover:bg-secondary transition-colors"
                >
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={() => onToggleTask(task.id)}
                  />
                  <label
                    htmlFor={`task-${task.id}`}
                    className={`flex-grow text-sm cursor-pointer ${
                      task.completed ? 'line-through text-muted-foreground' : ''
                    }`}
                  >
                    {task.text}
                  </label>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteTask(task.id)}
                    className="w-8 h-8 text-muted-foreground hover:text-destructive"
                    aria-label={`Delete task: ${task.text}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No tasks yet. Add one to get started!
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
