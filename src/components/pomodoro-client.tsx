"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Mode, Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TodoList } from '@/components/todo-list';
import useLocalStorage from '@/hooks/use-local-storage';
import { Play, Pause, RotateCcw } from 'lucide-react';
import * as Tone from 'tone';

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export default function PomodoroClient() {
  const [settings, setSettings] = useLocalStorage('pomodoro-settings', {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    soundEnabled: true,
  });

  const [mode, setMode] = useState<Mode>('pomodoro');
  const [isActive, setIsActive] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useLocalStorage('completed-pomodoros', 0);
  const [tasks, setTasks] = useLocalStorage<Task[]>('pomodoro-tasks', []);
  const [activeTaskId, setActiveTaskId] = useLocalStorage<number | null>('active-task-id', null);
  
  const synth = useRef<Tone.Synth | null>(null);

  const getInitialTime = useCallback(() => {
    switch (mode) {
      case 'pomodoro':
        return settings.pomodoro * 60;
      case 'shortBreak':
        return settings.shortBreak * 60;
      case 'longBreak':
        return settings.longBreak * 60;
    }
  }, [mode, settings]);

  const [timeRemaining, setTimeRemaining] = useState(getInitialTime());
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synth.current = new Tone.Synth().toDestination();
    }
  }, []);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setTimeRemaining(getInitialTime());
  }, [getInitialTime]);

  useEffect(() => {
    resetTimer();
    if(mode !== 'pomodoro') {
      setActiveTaskId(null);
    }
  }, [mode, settings, resetTimer, setActiveTaskId]);
  
  useEffect(() => {
    document.title = `${formatTime(timeRemaining)} - ${mode} | Pomodoro Flow`;
  }, [timeRemaining, mode]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((time) => time - 1);
      }, 1000);
    } else if (isActive && timeRemaining === 0) {
      if (settings.soundEnabled && synth.current) {
        synth.current.triggerAttackRelease("C4", "0.5");
      }
      
      if (mode === 'pomodoro') {
        if (activeTaskId) {
           setTasks(prevTasks => 
              prevTasks.map(task => 
                  task.id === activeTaskId ? { ...task, completed: true } : task
              )
           );
        }
        setCompletedPomodoros(prev => prev + 1);
        const nextMode = (completedPomodoros + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
        setMode(nextMode);
      } else {
        setMode('pomodoro');
      }
      setIsActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeRemaining, mode, settings.soundEnabled, completedPomodoros, setCompletedPomodoros, activeTaskId, setActiveTaskId, setTasks]);


  const handleStartPause = () => {
    if (mode === 'pomodoro' && !activeTaskId) return;
    setIsActive(!isActive);
  };
  
  const handleModeChange = (newMode: string) => {
    if(newMode === mode) return;
    setIsActive(false);
    setMode(newMode as Mode);
  };

  const handleAddTask = (text: string) => {
    const newTask: Task = {
      id: Date.now(),
      text,
      completed: false,
    };
    setTasks([...tasks, newTask]);
  };

  const handleToggleTask = (id: number) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)));
  };

  const handleDeleteTask = (id: number) => {
    if (activeTaskId === id) {
      resetTimer();
      setActiveTaskId(null);
    }
    setTasks(tasks.filter((task) => task.id !== id));
  };
  
  const handleTaskTimerToggle = (id: number) => {
    if (mode !== 'pomodoro') return;

    if (activeTaskId === id) {
      // If clicking the active task, toggle start/pause
      setIsActive(!isActive);
    } else {
      // Clicking a new task, make it active and start timer
      setActiveTaskId(id);
      setTimeRemaining(getInitialTime()); // Reset timer to full pomodoro
      setIsActive(true);
    }
  };

  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference - (timeRemaining / getInitialTime()) * circumference;
  
  const isPomodoroModeWithNoTask = mode === 'pomodoro' && activeTaskId === null;

  return (
    <div className="flex flex-col md:grid md:grid-cols-2 gap-8 w-full h-full p-4 md:p-8">
      <Card className="relative flex flex-col items-center justify-center p-6 space-y-6 shadow-lg">
        <Tabs value={mode} onValueChange={handleModeChange} className="w-full max-w-sm">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pomodoro">Pomodoro</TabsTrigger>
            <TabsTrigger value="shortBreak">Short Break</TabsTrigger>
            <TabsTrigger value="longBreak">Long Break</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="relative w-80 h-80">
          <svg className="w-full h-full" viewBox="0 0 300 300">
            <circle
              className="text-secondary"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
              r="140"
              cx="150"
              cy="150"
            />
            <circle
              className="text-primary transition-all duration-1000 ease-linear"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="140"
              cx="150"
              cy="150"
              transform="rotate(-90 150 150)"
            />
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dy=".3em"
              className="text-6xl font-bold font-headline fill-current text-foreground"
            >
              {formatTime(timeRemaining)}
            </text>
          </svg>
        </div>

        <div className="flex space-x-4">
          <Button 
            onClick={handleStartPause} 
            size="lg" 
            className="w-32 text-lg font-bold shadow-md"
            disabled={isPomodoroModeWithNoTask && mode === 'pomodoro'}
          >
            {isActive ? <Pause className="mr-2" /> : <Play className="mr-2" />}
            {isActive ? 'Pause' : 'Start'}
          </Button>
          <Button onClick={() => {
            resetTimer();
            if(mode === 'pomodoro') {
                setActiveTaskId(null);
            }
          }} variant="secondary" size="lg" className="shadow-md">
            <RotateCcw />
          </Button>
        </div>
        
        <p className="text-muted-foreground">Completed Pomodoros: {completedPomodoros}</p>

      </Card>
      <div className="min-h-[500px] md:min-h-0">
        <TodoList
          tasks={tasks}
          onAddTask={handleAddTask}
          onToggleTask={handleToggleTask}
          onDeleteTask={handleDeleteTask}
          onTaskTimerToggle={handleTaskTimerToggle}
          settings={settings}
          onSaveSettings={setSettings}
          formatTime={formatTime}
          activeTaskId={activeTaskId}
          isTimerActive={isActive}
          timeRemaining={timeRemaining}
          isPomodoroMode={mode === 'pomodoro'}
        />
      </div>
    </div>
  );
