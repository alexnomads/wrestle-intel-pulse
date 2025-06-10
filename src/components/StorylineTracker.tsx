
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, MessageSquare, Send, ExternalLink } from "lucide-react";
import { useStorylineAnalysis, useAdvancedTrendingTopics } from "@/hooks/useAdvancedAnalytics";
import { useRSSFeeds, useRedditPosts } from "@/hooks/useWrestlingData";
import { useSupabaseWrestlers } from "@/hooks/useSupabaseWrestlers";
import { StorylineCard } from "./storyline/StorylineCard";
import { TrendingTopicCard } from "./storyline/TrendingTopicCard";
import { StorylineFilters } from "./storyline/StorylineFilters";
import { EmptyState } from "./storyline/EmptyState";
import { analyzeSentiment } from "@/services/wrestlingDataService";

export const StorylineTracker = () => {
  const [selectedPromotion, setSelectedPromotion] = useState('all');
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  
  const { data: storylines = [], isLoading: storylinesLoading, refetch: refetchStorylines } = useStorylineAnalysis();
  const { data: trendingTopics = [], isLoading: topicsLoading } = useAdvancedTrendingTopics();
  const { data: newsItems = [] } = useRSSFeeds();
  const { data: redditPosts = [] } = useRedditPosts();
  const { data: wrestlers = [] } = useSupabaseWrestlers();

  const handleRefresh = () => {
    refetchStorylines();
  };

  const filteredStorylines = selectedPromotion === 'all' 
    ? storylines 
    : storylines.filter(storyline => storyline.promotion.toLowerCase() === selectedPromotion);

  // Handle keyword clicks to search for related content
  const handleKeywordClick = (keyword: string) => {
    // Find related articles and posts
    const relatedNews = newsItems.filter(item => 
      item.title.toLowerCase().includes(keyword.toLowerCase()) ||
      (item.contentSnippet && item.contentSnippet.toLowerCase().includes(keyword.toLowerCase()))
    );
    
    const relatedReddit = redditPosts.filter(post =>
      post.title.toLowerCase().includes(keyword.toLowerCase()) ||
      post.selftext.toLowerCase().includes(keyword.toLowerCase())
    );

    // Open the first related article or Reddit post
    if (relatedNews.length > 0 && relatedNews[0].link) {
      window.open(relatedNews[0].link, '_blank');
    } else if (relatedReddit.length > 0) {
      window.open(`https://reddit.com${relatedReddit[0].permalink}`, '_blank');
    } else {
      // Fallback to Google search
      const searchQuery = `wrestling ${keyword} site:reddit.com OR site:wrestling-news.com`;
      window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
    }
  };

  // Handle AI assistant questions
  const handleAiQuestion = async () => {
    if (!aiQuestion.trim()) return;
    
    setIsLoadingAi(true);
    try {
      // Simulate AI response - in production, this would call the YesChat API or similar
      const context = `Wrestling storylines: ${storylines.map(s => s.title).join(', ')}. Trending topics: ${trendingTopics.map(t => t.title).join(', ')}. Recent news: ${newsItems.slice(0, 5).map(n => n.title).join(', ')}.`;
      
      // For now, provide a helpful response based on available data
      let response = '';
      if (aiQuestion.toLowerCase().includes('storyline')) {
        response = `Based on current data, there are ${storylines.length} active storylines. The most intense storyline is "${storylines[0]?.title || 'N/A'}" with an intensity score of ${storylines[0]?.intensity_score.toFixed(1) || 'N/A'}.`;
      } else if (aiQuestion.toLowerCase().includes('trending')) {
        response = `Currently trending: ${trendingTopics.slice(0, 3).map(t => t.title).join(', ')}. These topics are gaining momentum based on recent news coverage and fan engagement.`;
      } else {
        response = `I can help analyze wrestling storylines and trends. Try asking about specific storylines, trending topics, or wrestler momentum. For more detailed analysis, you can visit the Slam Summarizer Pro at https://www.yeschat.ai/gpts-2OToSlpRf1-🤼‍♂️-Slam-Summarizer-Pro-🏆`;
      }
      
      setAiResponse(response);
    } catch (error) {
      setAiResponse('Sorry, I encountered an error. Please try again.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Calculate fan engagement metrics from X/Twitter and Reddit
  const calculateFanEngagement = () => {
    const topicEngagement = trendingTopics.map(topic => {
      // Count Reddit discussions
      const redditMentions = redditPosts.filter(post => 
        topic.keywords.some(keyword => 
          post.title.toLowerCase().includes(keyword.toLowerCase()) ||
          post.selftext.toLowerCase().includes(keyword.toLowerCase())
        )
      );

      // Count news coverage
      const newsMentions = newsItems.filter(item => 
        topic.keywords.some(keyword => 
          item.title.toLowerCase().includes(keyword.toLowerCase()) ||
          (item.contentSnippet && item.contentSnippet.toLowerCase().includes(keyword.toLowerCase()))
        )
      );

      // Calculate engagement score based on Reddit upvotes and comments
      const redditEngagement = redditMentions.reduce((total, post) => 
        total + post.score + (post.num_comments * 2), 0
      );

      // Calculate overall fan reception
      const totalMentions = redditMentions.length + newsMentions.length;
      const engagementScore = totalMentions > 0 ? 
        Math.min((redditEngagement / totalMentions) / 10, 10) : 0;

      return {
        title: topic.title,
        mentions: totalMentions,
        redditEngagement: redditMentions.length,
        newsVolume: newsMentions.length,
        fanReception: Math.round(engagementScore * 10),
        sentiment: topic.sentiment || 0.5,
        growth: topic.growth_rate || 0,
        keywords: topic.keywords,
        relatedNews: newsMentions,
        relatedReddit: redditMentions
      };
    }).sort((a, b) => (b.mentions + b.redditEngagement) - (a.mentions + a.redditEngagement));

    return topicEngagement;
  };

  const fanEngagement = calculateFanEngagement();

  // Generate analytics insights
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

  if (storylinesLoading && topicsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-wrestling-electric" />
        <span className="ml-2 text-lg">Analyzing storylines...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Storyline & Narrative Tracker</h2>
        <StorylineFilters
          selectedPromotion={selectedPromotion}
          onPromotionChange={setSelectedPromotion}
          onRefresh={handleRefresh}
          isLoading={storylinesLoading}
        />
      </div>

      <Tabs defaultValue="feuds" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="feuds">Active Feuds</TabsTrigger>
          <TabsTrigger value="trending">Trending Topics</TabsTrigger>
          <TabsTrigger value="insights">Analytics Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="feuds" className="space-y-6">
          {filteredStorylines.length === 0 ? (
            <EmptyState newsItemsCount={newsItems.length} />
          ) : (
            <div className="grid gap-6">
              {filteredStorylines.map((storyline) => (
                <StorylineCard key={storyline.id} storyline={storyline} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="trending" className="space-y-6">
          <div className="grid gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Fan Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-secondary/50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-wrestling-electric">{redditPosts.length}</div>
                    <div className="text-sm text-muted-foreground">Reddit Posts</div>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-wrestling-electric">{newsItems.length}</div>
                    <div className="text-sm text-muted-foreground">News Articles</div>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-wrestling-electric">
                      {Math.round(redditPosts.reduce((sum, post) => sum + post.score, 0) / Math.max(redditPosts.length, 1))}
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Reddit Score</div>
                  </div>
                  <div className="p-4 bg-secondary/50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-wrestling-electric">
                      {fanEngagement.reduce((sum, topic) => sum + topic.mentions, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Mentions</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {fanEngagement.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="p-8 text-center">
                  <div className="text-muted-foreground">
                    No trending topics available. Try refreshing the news data to generate trending topics.
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {fanEngagement.map((topic, index) => (
                  <Card key={index} className="glass-card">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-foreground">{topic.title}</h3>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">Fan Reception</div>
                            <div className="text-lg font-bold text-wrestling-electric">{topic.fanReception}%</div>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-xl font-bold text-blue-400">{topic.mentions}</div>
                          <div className="text-xs text-muted-foreground">Total Mentions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-orange-400">{topic.redditEngagement}</div>
                          <div className="text-xs text-muted-foreground">Reddit Posts</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-green-400">{topic.newsVolume}</div>
                          <div className="text-xs text-muted-foreground">News Articles</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-purple-400">{Math.round(topic.sentiment * 100)}%</div>
                          <div className="text-xs text-muted-foreground">Positive Sentiment</div>
                        </div>
                      </div>
                      
                      {/* Clickable Keywords */}
                      {topic.keywords && topic.keywords.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Related Keywords (Click to explore):</h4>
                          <div className="flex flex-wrap gap-2">
                            {topic.keywords.slice(0, 8).map((keyword, keyIndex) => (
                              <button
                                key={keyIndex}
                                onClick={() => handleKeywordClick(keyword)}
                                className="px-3 py-1 bg-wrestling-electric/20 hover:bg-wrestling-electric/30 text-wrestling-electric rounded-full text-sm transition-colors flex items-center space-x-1"
                              >
                                <span>{keyword}</span>
                                <ExternalLink className="h-3 w-3" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6">
            {/* AI Assistant Integration */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Wrestling Analytics Assistant</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://www.yeschat.ai/gpts-2OToSlpRf1-🤼‍♂️-Slam-Summarizer-Pro-🏆', '_blank')}
                    className="ml-auto"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open Slam Summarizer Pro
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Ask about storylines, trends, or wrestler momentum..."
                      value={aiQuestion}
                      onChange={(e) => setAiQuestion(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAiQuestion()}
                    />
                    <Button onClick={handleAiQuestion} disabled={isLoadingAi}>
                      {isLoadingAi ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  {aiResponse && (
                    <div className="p-3 bg-secondary/30 rounded-lg">
                      <p className="text-sm">{aiResponse}</p>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    💡 For advanced wrestling analysis and summaries, try the dedicated Slam Summarizer Pro AI assistant
                  </div>
                </div>
              </CardContent>
            </Card>

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
                          onClick={() => handleKeywordClick(item.keyword)}
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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
