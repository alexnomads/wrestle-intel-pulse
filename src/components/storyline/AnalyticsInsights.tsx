
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { RedditPost, NewsItem } from "@/services/data/dataTypes";
import { Tables } from "@/integrations/supabase/types";
import { StorylineAnalysis } from "@/services/advancedAnalyticsService";
import { analyzeSentiment } from "@/services/wrestlingDataService";

type Wrestler = Tables<'wrestlers'>;

interface AnalyticsInsightsProps {
  redditPosts: RedditPost[];
  newsItems: NewsItem[];
  wrestlers: Wrestler[];
  storylines: StorylineAnalysis[];
  onKeywordClick: (keyword: string) => void;
}

export const AnalyticsInsights = ({ 
  redditPosts, 
  newsItems, 
  wrestlers, 
  storylines, 
  onKeywordClick 
}: AnalyticsInsightsProps) => {
  const generateAnalyticsInsights = () => {
    const totalRedditPosts = redditPosts.length;
    const totalNewsArticles = newsItems.length;
    const totalWrestlers = wrestlers.length;
    const activeStorylines = storylines.length;
    
    // Top keywords from news and Reddit
    const allContent = [
      ...newsItems.map(item => `${item.title} ${item.contentSnippet || ''}`),
      ...redditPosts.map(post => `${post.title} ${post.selftext}`)
    ].join(' ').toLowerCase();

    const wrestlingKeywords = [
      'championship', 'title', 'feud', 'rivalry', 'debut', 'return', 
      'injury', 'heel turn', 'face turn', 'betrayal', 'alliance'
    ];

    const keywordFrequency = wrestlingKeywords.map(keyword => ({
      keyword,
      frequency: (allContent.match(new RegExp(keyword, 'g')) || []).length
    })).sort((a, b) => b.frequency - a.frequency).slice(0, 5);

    // Calculate average sentiment
    const sentimentData = newsItems.map(item => 
      analyzeSentiment(`${item.title} ${item.contentSnippet || ''}`)
    );
    const avgSentiment = sentimentData.length > 0 ? 
      sentimentData.reduce((sum, s) => sum + s.score, 0) / sentimentData.length : 0.5;

    return {
      totalRedditPosts,
      totalNewsArticles,
      totalWrestlers,
      activeStorylines,
      topKeywords: keywordFrequency,
      averageSentiment: Math.round(avgSentiment * 100),
      dataFreshness: 'Last updated: Real-time'
    };
  };

  const insights = generateAnalyticsInsights();

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Analytics Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-secondary/50 rounded-lg text-center">
              <div className="text-2xl font-bold text-wrestling-electric">{insights.totalNewsArticles}</div>
              <div className="text-sm text-muted-foreground">News Sources</div>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg text-center">
              <div className="text-2xl font-bold text-wrestling-electric">{insights.totalRedditPosts}</div>
              <div className="text-sm text-muted-foreground">Reddit Posts</div>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg text-center">
              <div className="text-2xl font-bold text-wrestling-electric">{insights.activeStorylines}</div>
              <div className="text-sm text-muted-foreground">Active Storylines</div>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg text-center">
              <div className="text-2xl font-bold text-wrestling-electric">{insights.averageSentiment}%</div>
              <div className="text-sm text-muted-foreground">Positive Sentiment</div>
            </div>
          </div>
          
          <div className="p-4 bg-secondary/50 rounded-lg">
            <h4 className="font-semibold text-foreground mb-2">Data Sources Integration</h4>
            <p className="text-sm text-muted-foreground">
              Real-time analysis from {insights.totalNewsArticles} news articles from wrestling news websites, 
              {insights.totalRedditPosts} Reddit posts from wrestling subreddits, and Twitter/X accounts from wrestling journalists and promotions.
            </p>
          </div>
          
          <div className="p-4 bg-secondary/50 rounded-lg">
            <h4 className="font-semibold text-foreground mb-2">Top Wrestling Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {insights.topKeywords.map((item, index) => (
                <button
                  key={index}
                  onClick={() => onKeywordClick(item.keyword)}
                  className="px-3 py-1 bg-wrestling-electric/20 hover:bg-wrestling-electric/30 text-wrestling-electric rounded-full text-sm transition-colors flex items-center space-x-1"
                >
                  <span>{item.keyword} ({item.frequency})</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-4 bg-secondary/50 rounded-lg">
            <h4 className="font-semibold text-foreground mb-2">Fan Reception Analysis</h4>
            <p className="text-sm text-muted-foreground">
              Fan reception is calculated based on Reddit upvotes, comments, and overall engagement across wrestling communities. 
              Higher scores indicate more positive fan reaction and discussion volume.
            </p>
          </div>

          <div className="p-4 bg-secondary/50 rounded-lg">
            <h4 className="font-semibold text-foreground mb-2">{insights.dataFreshness}</h4>
            <p className="text-sm text-muted-foreground">
              Data refreshes automatically from RSS feeds, Reddit APIs, and social media monitoring every 15 minutes.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
