
import { useState, useEffect } from "react";
import { useService, ServiceItem } from "@/context/ServiceContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, SkipForward, RefreshCw } from "lucide-react";

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

interface ServiceTimerProps {
  minimal?: boolean;
}

const ServiceTimer = ({ minimal = false }: ServiceTimerProps) => {
  const { currentService, timer, startTimer, pauseTimer, resetTimer, skipToItem } = useService();
  const [currentItem, setCurrentItem] = useState<ServiceItem | null>(null);
  const [nextItem, setNextItem] = useState<ServiceItem | null>(null);
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // This effect handles timer state updates and updates the UI
  useEffect(() => {
    if (!currentService || !timer.currentItemId) {
      setCurrentItem(null);
      setNextItem(null);
      setProgress(0);
      setTimeRemaining(0);
      return;
    }

    const currentIndex = currentService.items.findIndex(
      (item) => item.id === timer.currentItemId
    );
    
    if (currentIndex === -1) {
      setCurrentItem(null);
      setNextItem(null);
      return;
    }

    const current = currentService.items[currentIndex];
    setCurrentItem(current);

    const next = currentIndex < currentService.items.length - 1
      ? currentService.items[currentIndex + 1]
      : null;
    setNextItem(next);

    // Calculate remaining time and progress
    const totalDuration = current.duration;
    const elapsed = Math.min(timer.elapsedTime, totalDuration);
    const remaining = Math.max(0, totalDuration - elapsed);
    
    setTimeRemaining(remaining);
    setProgress(Math.min(100, (elapsed / totalDuration) * 100));
    
  }, [currentService, timer.currentItemId, timer.elapsedTime]);

  const handleStartNextItem = () => {
    if (!nextItem) return;
    skipToItem(nextItem.id);
  };

  if (!currentService) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Service Timer</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <p className="text-muted-foreground">No service selected</p>
        </CardContent>
      </Card>
    );
  }

  if (!currentItem) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Service Timer</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <p className="mb-4 text-muted-foreground">No item currently active</p>
          <div className="flex gap-2">
            {currentService.items.length > 0 && (
              <Button onClick={() => startTimer(currentService.items[0].id)}>
                Start Service
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (minimal) {
    return (
      <div className="fixed bottom-6 right-6 z-20 flex flex-col gap-2 bg-card rounded-lg shadow-lg p-4 w-80">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-medium">{currentItem.title}</h4>
            <div className="text-xs text-muted-foreground">
              {formatTime(timeRemaining)} remaining
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="timer-control-button"
              onClick={timer.isRunning ? pauseTimer : () => startTimer(currentItem.id)}
            >
              {timer.isRunning ? <Pause size={18} /> : <Play size={18} />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="timer-control-button"
              onClick={resetTimer}
            >
              <RefreshCw size={18} />
            </Button>
            {nextItem && (
              <Button
                size="icon"
                variant="ghost"
                className="timer-control-button"
                onClick={handleStartNextItem}
              >
                <SkipForward size={18} />
              </Button>
            )}
          </div>
        </div>
        <Progress value={progress} className="h-1" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Service Timer</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-2">{currentItem.title}</h2>
          <div className={`timer-display ${timer.isRunning ? 'animate-pulse-subtle' : ''} mb-4`}>
            {formatTime(timeRemaining)}
          </div>
          <Progress value={progress} className="h-2 w-full mb-4" />
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <Button
              variant={timer.isRunning ? "outline" : "default"}
              onClick={timer.isRunning ? pauseTimer : () => startTimer(currentItem.id)}
              className="min-w-[100px]"
            >
              {timer.isRunning ? <><Pause className="mr-2" size={18} /> Pause</> : <><Play className="mr-2" size={18} /> Resume</>}
            </Button>
            <Button 
              variant="outline" 
              onClick={resetTimer}
              className="min-w-[100px]"
            >
              <RefreshCw className="mr-2" size={18} /> Reset
            </Button>
            {nextItem && (
              <Button
                variant="secondary"
                onClick={handleStartNextItem}
                className="min-w-[100px]"
              >
                <SkipForward className="mr-2" size={18} /> Next: {nextItem.title}
              </Button>
            )}
          </div>

          <div className="w-full">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">SERVICE PROGRESS</h3>
            <div className="space-y-2">
              {currentService.items.map((item, index) => {
                const isActive = item.id === currentItem.id;
                const isPast = currentService.items.findIndex(i => i.id === currentItem.id) > index;
                
                return (
                  <div 
                    key={item.id} 
                    className={`p-2 rounded-md flex justify-between ${
                      isActive ? 'bg-primary/10 text-primary font-medium' : 
                      isPast ? 'text-muted-foreground line-through' : ''
                    }`}
                  >
                    <span>{item.title}</span>
                    <span>{formatTime(item.duration)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceTimer;
