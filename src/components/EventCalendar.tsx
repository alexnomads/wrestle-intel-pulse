
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Tv, RefreshCw, Zap } from "lucide-react";
import { AutonomousEventsCalendar } from "./AutonomousEventsCalendar";
import { useToast } from "@/hooks/use-toast";

export const EventCalendar = () => {
  const [isAutonomousMode, setIsAutonomousMode] = useState(true);
  const { toast } = useToast();

  const handleModeToggle = () => {
    setIsAutonomousMode(!isAutonomousMode);
    toast({
      title: `Switched to ${isAutonomousMode ? 'Manual' : 'Autonomous'} Mode`,
      description: isAutonomousMode 
        ? "Events will need to be manually updated" 
        : "Events will be automatically scraped daily at 6:00 AM ET",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Wrestling Events Calendar</h2>
          <p className="text-muted-foreground">
            {isAutonomousMode 
              ? "Autonomous mode - Events auto-update daily from official sources"
              : "Manual mode - Events require manual updates"
            }
          </p>
        </div>
        <Button
          onClick={handleModeToggle}
          variant={isAutonomousMode ? "default" : "outline"}
          className={isAutonomousMode ? "bg-wrestling-electric text-black" : ""}
        >
          <Zap className="h-4 w-4 mr-2" />
          {isAutonomousMode ? "Autonomous Mode" : "Manual Mode"}
        </Button>
      </div>

      {isAutonomousMode ? (
        <AutonomousEventsCalendar />
      ) : (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-muted-foreground" />
              <span>Manual Events Calendar</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="text-muted-foreground">
                Manual events calendar is disabled. Switch to Autonomous Mode for automatic event updates.
              </div>
              <Button onClick={handleModeToggle} className="bg-wrestling-electric text-black">
                <Zap className="h-4 w-4 mr-2" />
                Enable Autonomous Mode
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
