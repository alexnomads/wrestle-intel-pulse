
import { BarChart3, Users, Zap, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalyticsOverview } from "@/hooks/useAnalyticsOverview";

interface AnalyticsOverviewProps {
  onNavigate: (tab: string) => void;
}

export const AnalyticsOverview = ({ onNavigate }: AnalyticsOverviewProps) => {
  const { data: analytics, isLoading, error } = useAnalyticsOverview();

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="w-12 h-12 rounded-lg" />
              </div>
              <div>
                <Skeleton className="w-16 h-8 mb-1" />
                <Skeleton className="w-24 h-4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !analytics) {
    console.error('Analytics error:', error);
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              Unable to load analytics data
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = [
    {
      icon: Users,
      label: "Wrestlers Database",
      value: analytics.totalWrestlers.toString(),
      navigateTo: "rosters",
      description: "Total wrestlers across all promotions"
    },
    {
      icon: Zap,
      label: "Upcoming Events",
      value: analytics.upcomingEvents.toString(),
      navigateTo: "events",
      description: "Events in the next 30 days"
    },
    {
      icon: BarChart3,
      label: "Wrestling Mentions",
      value: formatNumber(analytics.dailyMentions),
      navigateTo: null,
      description: "Total mentions in recent news"
    },
    {
      icon: TrendingUp,
      label: "News Sentiment",
      value: `${analytics.sentimentScore}%`,
      navigateTo: null,
      description: "Average positive sentiment in wrestling news"
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
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground mb-1">{stat.label}</div>
              <div className="text-xs text-muted-foreground opacity-75">{stat.description}</div>
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
