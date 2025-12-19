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
import { IncenseTimer } from './incense-timer';

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

  const getInitialTimeForMode = useCallback((currentMode: Mode) => {
    switch (currentMode) {
      case 'pomodoro':
        return settings.pomodoro * 60;
      case 'shortBreak':
        return settings.shortBreak * 60;
      case 'longBreak':
        return settings.longBreak * 60;
    }
  }, [settings]);

  const [breakTime, setBreakTime] = useState(getInitialTimeForMode(mode));

  useEffect(() => {
    if (mode !== 'pomodoro') {
      setBreakTime(getInitialTimeForMode(mode));
    }
  }, [mode, getInitialTimeForMode]);

  const activeTask = tasks.find(task => task.id === activeTaskId);
  
  const timeRemaining = mode === 'pomodoro' 
    ? (activeTask?.timeRemaining ?? getInitialTimeForMode('pomodoro')) 
    : breakTime;

  const setTimeRemaining = (newTime: number | ((t: number) => number)) => {
    if (mode === 'pomodoro' && activeTaskId) {
      setTasks(prevTasks => prevTasks.map(task => {
        if (task.id === activeTaskId) {
          const oldTime = task.timeRemaining;
          const updatedTime = typeof newTime === 'function' ? newTime(oldTime) : newTime;
          return { ...task, timeRemaining: updatedTime };
        }
        return task;
      }));
    } else if (mode !== 'pomodoro') {
        setBreakTime(newTime);
    }
  };
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synth.current = new Tone.Synth().toDestination();
    }
  }, []);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    if (mode === 'pomodoro' && activeTaskId) {
      setTasks(prevTasks => prevTasks.map(t => 
        t.id === activeTaskId ? { ...t, timeRemaining: getInitialTimeForMode('pomodoro') } : t
      ));
    } else if (mode !== 'pomodoro') {
      setBreakTime(getInitialTimeForMode(mode));
    }
  }, [getInitialTimeForMode, mode, activeTaskId, setTasks]);
  
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
              prevTasks.map(task => {
                  if (task.id === activeTaskId) {
                      return { ...task, completed: true, timeRemaining: getInitialTimeForMode('pomodoro') };
                  }
                  return task;
              })
           );
           setActiveTaskId(null);
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
  }, [isActive, timeRemaining, mode, settings.soundEnabled, completedPomodoros, setCompletedPomodoros, activeTaskId, setActiveTaskId, setTasks, getInitialTimeForMode, setTimeRemaining]);


  const handleStartPause = () => {
    if (mode === 'pomodoro' && !activeTaskId) return;
    setIsActive(!isActive);
  };
  
  const handleModeChange = (newMode: string) => {
    if(newMode === mode) return;
    setIsActive(false);
    setMode(newMode as Mode);
    if (newMode !== 'pomodoro') {
      setActiveTaskId(null);
    }
  };

  const handleAddTask = (text: string) => {
    const newTask: Task = {
      id: Date.now(),
      text,
      completed: false,
      timeRemaining: getInitialTimeForMode('pomodoro'),
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
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
    if (mode !== 'pomodoro') {
        setMode('pomodoro');
    }

    if (activeTaskId === id) {
      // If clicking the same task, just toggle play/pause
      setIsActive(!isActive);
    } else {
      // If clicking a new task, make it active and start timer
      setIsActive(true);
      setActiveTaskId(id);
    }
  };
  
  const totalDuration = mode === 'pomodoro' 
    ? settings.pomodoro * 60 
    : (mode === 'shortBreak' ? settings.shortBreak * 60 : settings.longBreak * 60);

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
        
        <IncenseTimer 
            timeRemaining={timeRemaining} 
            totalDuration={totalDuration} 
            isBurning={isActive}
        />

        <div className="flex space-x-4">
          <Button 
            onClick={handleStartPause} 
            size="lg" 
            className="w-32 text-lg font-bold shadow-md"
            disabled={isPomodoroModeWithNoTask}
          >
            {isActive ? <Pause className="mr-2" /> : <Play className="mr-2" />}
            {isActive ? 'Pause' : 'Start'}
          </Button>
          <Button onClick={() => {
            resetTimer();
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
          isPomodoroMode={mode === 'pomodoro'}
        />
      </div>
    </div>
  );
}
