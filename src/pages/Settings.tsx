
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const Settings = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    if (!isAdmin()) {
      navigate("/");
    }
  }, [user, isAdmin, navigate]);

  if (!user || !isAdmin()) {
    return null;
  }

  const handleSwitchPWA = () => {
    toast({
      title: "PWA Feature",
      description: "In a real implementation, this would be a feature to install the app as a PWA.",
    });
  };

  return (
    <MainLayout>
      <div className="container py-6 space-y-6">
        <h1 className="text-3xl font-bold">System Settings</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Application Settings</CardTitle>
            <CardDescription>
              Configure global settings for the application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Install as PWA</h3>
                <p className="text-sm text-muted-foreground">
                  Enable Progressive Web App functionality for offline use
                </p>
              </div>
              <Switch id="pwa" onCheckedChange={handleSwitchPWA} />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Timer Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Send browser notifications for timer events
                </p>
              </div>
              <Switch id="notifications" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Auto Registration Approval</h3>
                <p className="text-sm text-muted-foreground">
                  Automatically approve new user registrations
                </p>
              </div>
              <Switch id="auto-approval" />
            </div>
            
            <div className="border-t pt-6">
              <h3 className="font-medium mb-4">Danger Zone</h3>
              <div className="space-y-4">
                <Button
                  variant="destructive"
                  onClick={() => {
                    toast({
                      variant: "destructive",
                      title: "Reset System Data",
                      description: "This action is not implemented in the demo.",
                    });
                  }}
                >
                  Reset System Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Settings;
