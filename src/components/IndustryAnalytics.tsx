
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, TrendingDown, Users, Activity } from "lucide-react";

interface PromotionMetrics {
  promotion: string;
  tvRatings: number;
  attendance: number;
  socialEngagement: number;
  trend: 'up' | 'down' | 'stable';
  weeklyChange: number;
}

interface TalentMovement {
  wrestler: string;
  from: string;
  to: string;
  date: string;
  type: 'signing' | 'release' | 'debut' | 'return';
  impact: number;
}

export const IndustryAnalytics = () => {
  const [selectedMetric, setSelectedMetric] = useState('ratings');

  // Mock data for demonstration
  const promotionMetrics: PromotionMetrics[] = [
    {
      promotion: 'WWE',
      tvRatings: 2.1,
      attendance: 12500,
      socialEngagement: 850000,
      trend: 'up',
      weeklyChange: 5.2
    },
    {
      promotion: 'AEW',
      tvRatings: 0.8,
      attendance: 8500,
      socialEngagement: 320000,
      trend: 'stable',
      weeklyChange: -1.1
    },
    {
      promotion: 'NXT',
      tvRatings: 0.6,
      attendance: 5500,
      socialEngagement: 180000,
      trend: 'up',
      weeklyChange: 8.3
    },
    {
      promotion: 'TNA',
      tvRatings: 0.3,
      attendance: 3200,
      socialEngagement: 95000,
      trend: 'up',
      weeklyChange: 12.5
    }
  ];

  const talentMovements: TalentMovement[] = [
    {
      wrestler: 'CM Punk',
      from: 'AEW',
      to: 'WWE',
      date: '2024-01-01',
      type: 'signing',
      impact: 9.5
    },
    {
      wrestler: 'Jade Cargill',
      from: 'AEW',
      to: 'WWE',
      date: '2024-01-15',
      type: 'signing',
      impact: 8.2
    },
    {
      wrestler: 'Mercedes Moné',
      from: 'WWE',
      to: 'AEW',
      date: '2024-02-01',
      type: 'debut',
      impact: 8.8
    }
  ];

  const chartData = [
    { month: 'Jan', WWE: 2.1, AEW: 0.8, NXT: 0.6, TNA: 0.3 },
    { month: 'Feb', WWE: 2.0, AEW: 0.9, NXT: 0.7, TNA: 0.35 },
    { month: 'Mar', WWE: 2.2, AEW: 0.85, NXT: 0.65, TNA: 0.32 },
    { month: 'Apr', WWE: 2.1, AEW: 0.82, NXT: 0.68, TNA: 0.38 },
    { month: 'May', WWE: 2.3, AEW: 0.88, NXT: 0.72, TNA: 0.41 },
    { month: 'Jun', WWE: 2.1, AEW: 0.8, NXT: 0.6, TNA: 0.3 },
  ];

  const chartConfig = {
    WWE: { label: "WWE", color: "#e11d48" },
    AEW: { label: "AEW", color: "#f59e0b" },
    NXT: { label: "NXT", color: "#3b82f6" },
    TNA: { label: "TNA", color: "#10b981" },
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'signing': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'release': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'debut': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'return': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Industry Analytics</h2>
        <div className="flex space-x-2">
          {['ratings', 'attendance', 'social'].map((metric) => (
            <Button
              key={metric}
              variant={selectedMetric === metric ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMetric(metric)}
              className="capitalize"
            >
              {metric}
            </Button>
          ))}
        </div>
      </div>

      {/* Promotion Health Metrics */}
      <div className="grid gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>TV Ratings Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="WWE" stroke="var(--color-WWE)" strokeWidth={2} />
                  <Line type="monotone" dataKey="AEW" stroke="var(--color-AEW)" strokeWidth={2} />
                  <Line type="monotone" dataKey="NXT" stroke="var(--color-NXT)" strokeWidth={2} />
                  <Line type="monotone" dataKey="TNA" stroke="var(--color-TNA)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {promotionMetrics.map((metric, index) => (
            <Card key={index} className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">{metric.promotion}</h3>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(metric.trend)}
                    <span className={`text-sm font-medium ${
                      metric.weeklyChange > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {metric.weeklyChange > 0 ? '+' : ''}{metric.weeklyChange}%
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">TV Rating</span>
                    <span className="font-medium">{metric.tvRatings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Attendance</span>
                    <span className="font-medium">{metric.attendance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Social</span>
                    <span className="font-medium">{(metric.socialEngagement / 1000).toFixed(0)}K</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        metric.trend === 'up' ? 'bg-gradient-to-r from-green-500 to-wrestling-electric' :
                        metric.trend === 'down' ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                        'bg-gradient-to-r from-yellow-500 to-amber-500'
                      }`}
                      style={{ width: `${Math.min(metric.tvRatings * 40, 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Talent Movement Tracker */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Recent Talent Movements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {talentMovements.map((movement, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-wrestling-electric/20 to-wrestling-purple/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{movement.wrestler.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{movement.wrestler}</h3>
                    <p className="text-sm text-muted-foreground">
                      {movement.from} → {movement.to}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-lg font-bold text-wrestling-electric">{movement.impact}</div>
                    <div className="text-xs text-muted-foreground">Impact Score</div>
                  </div>
                  <Badge className={getMovementColor(movement.type)}>
                    {movement.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Emerging Talents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['Ilja Dragunov', 'Lyra Valkyria', 'Bron Breakker', 'Tiffany Stratton'].map((talent, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                  <span className="font-medium text-foreground">{talent}</span>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-400">+{(Math.random() * 20 + 10).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Hot Storylines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                'CM Punk vs Drew McIntyre', 
                'Cody Rhodes Championship Run', 
                'Jon Moxley AEW Storyline',
                'Oba Femi NXT Dominance'
              ].map((storyline, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                  <span className="font-medium text-foreground">{storyline}</span>
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-wrestling-electric" />
                    <span className="text-sm text-wrestling-electric">{(Math.random() * 500 + 100).toFixed(0)} mentions</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
