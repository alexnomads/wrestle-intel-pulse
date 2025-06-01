
import { BarChart3, Users, Zap, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const AnalyticsOverview = () => {
  const stats = [
    {
      icon: Users,
      label: "Active Wrestlers",
      value: "2,847",
      change: "+12%",
      positive: true
    },
    {
      icon: Zap,
      label: "Live Events",
      value: "156",
      change: "+8%",
      positive: true
    },
    {
      icon: BarChart3,
      label: "Daily Mentions",
      value: "47.2K",
      change: "+23%",
      positive: true
    },
    {
      icon: TrendingUp,
      label: "Sentiment Score",
      value: "87%",
      change: "-2%",
      positive: false
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="glass-card hover-scale">
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
