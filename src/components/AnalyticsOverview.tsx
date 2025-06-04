
import { BarChart3, Users, Zap, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AnalyticsOverviewProps {
  onNavigate: (tab: string) => void;
}

export const AnalyticsOverview = ({ onNavigate }: AnalyticsOverviewProps) => {
  const stats = [
    {
      icon: Users,
      label: "Active Wrestlers",
      value: "2,847",
      change: "+12%",
      positive: true,
      navigateTo: "rosters"
    },
    {
      icon: Zap,
      label: "Live Events",
      value: "156",
      change: "+8%",
      positive: true,
      navigateTo: "events"
    },
    {
      icon: BarChart3,
      label: "Daily Mentions",
      value: "47.2K",
      change: "+23%",
      positive: true,
      navigateTo: null
    },
    {
      icon: TrendingUp,
      label: "Sentiment Score",
      value: "87%",
      change: "-2%",
      positive: false,
      navigateTo: null
    }
  ];

  const handleCardClick = (navigateTo: string | null) => {
    if (navigateTo) {
      onNavigate(navigateTo);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card 
          key={index} 
          className={`glass-card hover-scale ${stat.navigateTo ? 'cursor-pointer hover:border-wrestling-electric/50 transition-all' : ''}`}
          onClick={() => handleCardClick(stat.navigateTo)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-wrestling-electric/20 to-wrestling-purple/20 rounded-lg flex items-center justify-center">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <div className={`text-sm font-medium ${stat.positive ? 'text-green-400' : 'text-red-400'}`}>
                {stat.change}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
            {stat.navigateTo && (
              <div className="text-xs text-wrestling-electric mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                Click to view details →
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
