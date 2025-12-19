'use client';

import type { FC, FormEvent } from 'react';
import { Plus, Trash2, Mic } from 'lucide-react';
import type { Task } from '@/lib/types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { useState, useRef, useEffect } from 'react';
import { SettingsDialog } from './settings-dialog';
import { ThemeToggle } from './theme-toggle';

interface Settings {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
  soundEnabled: boolean;
}
interface TodoListProps {
  tasks: Task[];
  onAddTask: (text: string) => void;
  onToggleTask: (id: number) => void;
  onDeleteTask: (id: number) => void;
  settings: Settings;
  onSaveSettings: (newSettings: Settings) => void;
}

export const TodoList: FC<TodoListProps> = ({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  settings,
  onSaveSettings,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSpeechRecognitionSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'zh-TW';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          onAddTask(transcript);
          setIsListening(false);
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };
        
        recognitionRef.current = recognition;
      }
    }
  }, [onAddTask]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newTask.trim()) {
      onAddTask(newTask.trim());
      setNewTask('');
    }
  };

  const handleVoiceInput = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
      } else {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (error) {
          console.error("Speech recognition could not be started.", error);
          setIsListening(false);
        }
      }
    } else {
      alert('您的瀏覽器不支援語音辨識功能。');
    }
  };


  return (
    <Card className="w-full h-full shadow-lg relative">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-headline">To-Do List</CardTitle>
        <div className="flex gap-2">
            <SettingsDialog settings={settings} onSave={onSaveSettings} />
            <ThemeToggle />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col h-[calc(100%-80px)]">
        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
          <div className="relative w-full">
            <Input 
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              name="task-input" 
              placeholder={isListening ? "正在聆聽..." : "Add a new task..."}
              className={isSpeechRecognitionSupported ? "pr-10" : ""}
            />
            {isSpeechRecognitionSupported && (
              <Button 
                type="button" 
                size="icon" 
                variant={isListening ? 'destructive' : 'ghost'} 
                onClick={handleVoiceInput}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                aria-label="Add task with voice"
              >
                <Mic className="h-4 w-4" />
              </Button>
            )}
          </div>
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
