
import { Card, CardContent } from "@/components/ui/card";
import { Users, Trophy, Calendar, FileText } from "lucide-react";

interface DataStatisticsCardsProps {
  wrestlersCount: number;
  championsCount: number;
  eventsCount: number;
  newsCount: number;
}

export const DataStatisticsCards = ({
  wrestlersCount,
  championsCount,
  eventsCount,
  newsCount
}: DataStatisticsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{wrestlersCount}</div>
              <div className="text-sm text-muted-foreground">Total Wrestlers</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg flex items-center justify-center">
              <Trophy className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{championsCount}</div>
              <div className="text-sm text-muted-foreground">Champions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{eventsCount}</div>
              <div className="text-sm text-muted-foreground">Live Events</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{newsCount}</div>
              <div className="text-sm text-muted-foreground">Latest News</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
