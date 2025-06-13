
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, MessageSquare, Flame } from "lucide-react";
import { StorylineAnalysis } from "@/services/advancedAnalyticsService";
import { NewsItem, RedditPost } from "@/services/data/dataTypes";
import { TwitterPost } from "@/services/twitterService";

interface StorylineMetricsProps {
  storylines: StorylineAnalysis[];
  newsItems: NewsItem[];
  redditPosts: RedditPost[];
  tweets: TwitterPost[];
}

export const StorylineMetrics = ({ storylines, newsItems, redditPosts, tweets }: StorylineMetricsProps) => {
  // Calculate metrics
  const totalStorylines = storylines.length;
  const buildingStorylines = storylines.filter(s => s.status === 'building').length;
  const climaxStorylines = storylines.filter(s => s.status === 'climax').length;
  const highIntensityStorylines = storylines.filter(s => s.intensity_score > 7).length;
  
  const avgIntensity = storylines.length > 0 
    ? storylines.reduce((sum, s) => sum + s.intensity_score, 0) / storylines.length 
    : 0;
    
  const avgFanReception = storylines.length > 0 
    ? storylines.reduce((sum, s) => sum + s.fan_reception_score, 0) / storylines.length 
    : 0;

  // Total sources feeding into storylines
  const totalSources = newsItems.length + redditPosts.length + tweets.filter(t => !t.isFallback).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Active Storylines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-wrestling-electric">
              {totalStorylines}
            </div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {buildingStorylines} building • {climaxStorylines} at climax
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">High Intensity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-red-500">
              {highIntensityStorylines}
            </div>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Intensity score 7+
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Avg Fan Reception</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-green-500">
              {avgFanReception.toFixed(1)}
            </div>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Avg intensity: {avgIntensity.toFixed(1)}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Data Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-blue-500">
              {totalSources}
            </div>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            News, Reddit & Twitter
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
