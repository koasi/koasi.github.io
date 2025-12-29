
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
import { CigaretteTimer } from './cigarette-timer';

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
    animationMode: 'incense',
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
  
  const activeTask = tasks.find(task => task.id === activeTaskId);
  
  const [breakTime, setBreakTime] = useState(getInitialTimeForMode('shortBreak'));

  const effectiveTimeRemaining = mode === 'pomodoro' 
    ? (activeTask?.timeRemaining ?? getInitialTimeForMode('pomodoro')) 
    : breakTime;

  const totalDuration = mode === 'pomodoro'
    ? getInitialTimeForMode('pomodoro')
    : getInitialTimeForMode(mode);

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
    document.title = `${formatTime(effectiveTimeRemaining)} - ${mode} | Pomodoro Flow`;
  }, [effectiveTimeRemaining, mode]);

  const handleModeChange = useCallback((newMode: string, forceReset: boolean = false) => {
    const newModeTyped = newMode as Mode;
    if(newModeTyped === mode && !forceReset) return;
    
    setIsActive(false);
    setMode(newModeTyped);
    
    if (newModeTyped !== 'pomodoro') {
        setActiveTaskId(null); // Deactivate task when switching to breaks
        setBreakTime(getInitialTimeForMode(newModeTyped));
    }
  }, [mode, getInitialTimeForMode, setActiveTaskId]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && effectiveTimeRemaining > 0) {
      interval = setInterval(() => {
        if (mode === 'pomodoro') {
            setTasks(prevTasks => prevTasks.map(task => 
                task.id === activeTaskId ? { ...task, timeRemaining: task.timeRemaining - 1 } : task
            ));
        } else {
            setBreakTime(t => t - 1);
        }
      }, 1000);
    } else if (isActive && effectiveTimeRemaining <= 0) {
      if (settings.soundEnabled && synth.current) {
        synth.current.triggerAttackRelease("C4", "0.5");
      }
      
      if (mode === 'pomodoro') {
        setTasks(prevTasks => 
            prevTasks.map(task => {
                if (task.id === activeTaskId) {
                    return { ...task, completed: true, timeRemaining: getInitialTimeForMode('pomodoro') };
                }
                return task;
            })
        );
        const newCompletedCount = completedPomodoros + 1;
        setCompletedPomodoros(newCompletedCount);
        const nextMode = newCompletedCount % 4 === 0 ? 'longBreak' : 'shortBreak';
        handleModeChange(nextMode, true);
      } else { // break finished
        handleModeChange('pomodoro', true);
      }
      setIsActive(false); // Stop timer after it finishes
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, effectiveTimeRemaining, mode, settings.soundEnabled, completedPomodoros, activeTaskId, getInitialTimeForMode, setTasks, setCompletedPomodoros, handleModeChange, settings.animationMode]);


  const handleStartPause = () => {
    if (mode === 'pomodoro' && !activeTaskId) return; // Cant start pomodoro without a task
    setIsActive(!isActive);
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
      setIsActive(false);
      setActiveTaskId(null);
    }
    setTasks(tasks.filter((task) => task.id !== id));
  };
  
  const handleTaskTimerToggle = (id: number) => {
    if (mode !== 'pomodoro') {
        handleModeChange('pomodoro');
    }
    
    // If the selected task is already the active one, just toggle pause/play
    if (activeTaskId === id) {
      setIsActive(!isActive);
    } else {
      setIsActive(true); // Start the new task
      setActiveTaskId(id);
    }
  };
  
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
        
        {settings.animationMode === 'cigarette' ? (
          <CigaretteTimer 
            timeRemaining={effectiveTimeRemaining} 
            totalDuration={totalDuration} 
            isBurning={isActive}
          />
        ) : (
          <IncenseTimer 
            timeRemaining={effectiveTimeRemaining} 
            totalDuration={totalDuration} 
            isBurning={isActive}
          />
        )}


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
          <Button onClick={resetTimer} variant="secondary" size="lg" className="shadow-md">
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
