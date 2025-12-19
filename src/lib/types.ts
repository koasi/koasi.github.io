export type Mode = 'pomodoro' | 'shortBreak' | 'longBreak';

export interface Task {
  id: number;
  text: string;
  completed: boolean;
  timeRemaining: number;
}
