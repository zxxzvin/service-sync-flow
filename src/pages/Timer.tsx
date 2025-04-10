
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import ServiceTimer from "@/components/service/ServiceTimer";
import { useService } from "@/context/ServiceContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTime } from "@/components/service/ServiceTimer";
import { Button } from "@/components/ui/button";
import { Play, RefreshCw } from "lucide-react";

const Timer = () => {
  const { user } = useAuth();
  const { currentService, timer, startTimer, resetTimer } = useService();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const canControl = user.role === 'admin' || user.role === 'planner';

  return (
    <MainLayout>
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">Live Timer</h1>
        
        <div className="grid grid-cols-1 gap-6">
          <div className="mx-auto w-full max-w-2xl">
            <ServiceTimer />
            
            {currentService && !timer.currentItemId && canControl && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Service Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {currentService.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 rounded-md bg-background border">
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{formatTime(item.duration)}</p>
                        </div>
                        <Button size="sm" onClick={() => startTimer(item.id)}>
                          <Play size={16} className="mr-1" /> Start
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {currentService && !timer.currentItemId && !canControl && (
              <div className="text-center mt-6 p-6 border rounded-lg bg-muted/20">
                <p className="text-muted-foreground">Waiting for service to start...</p>
              </div>
            )}
            
            {timer.isRunning && canControl && (
              <div className="mt-4 flex justify-center">
                <Button variant="outline" onClick={resetTimer}>
                  <RefreshCw size={16} className="mr-2" /> Reset Timer
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Timer;
