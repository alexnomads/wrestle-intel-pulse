
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { useAllWrestlenomicsData } from "@/hooks/useWrestlenomicsData";

export const WrestlenomicsDataDisplay = () => {
  const { tvRatings, ticketSales, eloRankings, isLoading, error } = useAllWrestlenomicsData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-secondary rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-secondary rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-red-400 mb-2">Error loading Wrestlenomics data</div>
            <div className="text-sm text-muted-foreground">{error.toString()}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-foreground">Live Wrestlenomics Data</h3>
      
      {/* TV Ratings */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Recent TV Ratings</CardTitle>
          <Badge variant="secondary">{tvRatings.length} shows tracked</Badge>
        </CardHeader>
        <CardContent>
          {tvRatings.length > 0 ? (
            <div className="space-y-3">
              {tvRatings.slice(0, 5).map((rating: any, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                  <div>
                    <div className="font-semibold text-foreground">{rating.show}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(rating.air_date).toLocaleDateString()} • {rating.network}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-wrestling-electric">{rating.rating}</div>
                    <div className="text-xs text-muted-foreground">
                      {rating.viewership?.toLocaleString()} viewers
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-4">
              No TV ratings data available. Try scraping new data.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ticket Sales */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Recent Ticket Sales</CardTitle>
          <Badge variant="secondary">{ticketSales.length} events tracked</Badge>
        </CardHeader>
        <CardContent>
          {ticketSales.length > 0 ? (
            <div className="space-y-3">
              {ticketSales.slice(0, 5).map((ticket: any, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                  <div>
                    <div className="font-semibold text-foreground">{ticket.event_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(ticket.event_date).toLocaleDateString()} • {ticket.venue}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-wrestling-electric">
                      {ticket.attendance_percentage}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {ticket.tickets_sold?.toLocaleString()}/{ticket.capacity?.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-4">
              No ticket sales data available. Try scraping new data.
            </div>
          )}
        </CardContent>
      </Card>

      {/* ELO Rankings */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Top ELO Rankings</CardTitle>
          <Badge variant="secondary">{eloRankings.length} wrestlers ranked</Badge>
        </CardHeader>
        <CardContent>
          {eloRankings.length > 0 ? (
            <div className="space-y-3">
              {eloRankings.slice(0, 10).map((wrestler: any, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-wrestling-electric/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-wrestling-electric">
                        #{wrestler.ranking_position}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{wrestler.wrestler_name}</div>
                      <div className="text-sm text-muted-foreground">{wrestler.promotion}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="font-bold text-wrestling-electric">{wrestler.elo_rating}</div>
                      <div className="text-xs text-muted-foreground">ELO Rating</div>
                    </div>
                    {getTrendIcon(wrestler.trend)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-4">
              No ELO rankings data available. Try scraping new data.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
