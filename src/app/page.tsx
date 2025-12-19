import PomodoroClient from '@/components/pomodoro-client';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 w-full bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2">
            <svg
              className="w-8 h-8 text-primary"
              viewBox="0 0 512 512"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="256" cy="288" r="160" fill="currentColor" />
              <path
                d="M256 144 C 240 128, 272 128, 256 96 C 240 128, 272 128, 256 144 Z"
                className="fill-green-400"
              />
              <path
                d="M256 96 L 280 80 L 296 112"
                className="stroke-green-400"
                strokeWidth="16"
                strokeLinecap="round"
              />
            </svg>
            <h1 className="text-2xl font-bold font-headline">Pomodoro Flow</h1>
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto">
        <PomodoroClient />
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <div className="container mx-auto">
          Built with focus.
        </div>
      </footer>
    </div>
  );
}
