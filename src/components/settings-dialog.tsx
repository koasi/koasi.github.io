
'use client';

import { Settings, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useState, type FC } from 'react';

type AnimationMode = 'incense' | 'cigarette';

interface Settings {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
  soundEnabled: boolean;
  animationMode: AnimationMode;
}

interface SettingsDialogProps {
  settings: Settings;
  onSave: (newSettings: Settings) => void;
}

export const SettingsDialog: FC<SettingsDialogProps> = ({ settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    onSave(localSettings);
  };
  
  // Ensure localSettings has animationMode, providing a default if it's missing
  // This is for backward compatibility if users have old settings in localStorage
  useState(() => {
    if (!localSettings.animationMode) {
      setLocalSettings(prev => ({ ...prev, animationMode: 'incense' }));
    }
  });


  return (
    <Dialog onOpenChange={(open) => {
        if (!open) {
          // when closing, reset to original settings
          setLocalSettings(settings);
        } else {
          // when opening, ensure local state is in sync with latest props
          setLocalSettings(prev => ({...settings, animationMode: prev.animationMode || 'incense'}));
        }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Open Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Adjust your Pomodoro timer settings.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pomodoro" className="text-right">
              Pomodoro
            </Label>
            <Input
              id="pomodoro"
              type="number"
              value={localSettings.pomodoro}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, pomodoro: Number(e.target.value) })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="short-break" className="text-right">
              Short Break
            </Label>
            <Input
              id="short-break"
              type="number"
              value={localSettings.shortBreak}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, shortBreak: Number(e.target.value) })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="long-break" className="text-right">
              Long Break
            </Label>
            <Input
              id="long-break"
              type="number"
              value={localSettings.longBreak}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, longBreak: Number(e.target.value) })
              }
              className="col-span-3"
            />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              Sound
            </Label>
            <div className="col-span-3">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setLocalSettings({...localSettings, soundEnabled: !localSettings.soundEnabled})}>
                {localSettings.soundEnabled ? <Volume2 className="h-5 w-5"/> : <VolumeX className="h-5 w-5"/>}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Animation</Label>
            <RadioGroup
              value={localSettings.animationMode}
              onValueChange={(value: AnimationMode) =>
                setLocalSettings({ ...localSettings, animationMode: value })
              }
              className="col-span-3 flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="incense" id="r-incense" />
                <Label htmlFor="r-incense">Incense</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cigarette" id="r-cigarette" />
                <Label htmlFor="r-cigarette">Cigarette</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" onClick={handleSave}>
              Save changes
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
