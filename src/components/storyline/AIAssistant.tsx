
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, RefreshCw, ExternalLink } from "lucide-react";
import { StorylineAnalysis, TrendingTopic } from "@/services/advancedAnalyticsService";
import { NewsItem } from "@/services/data/dataTypes";

interface AIAssistantProps {
  storylines: StorylineAnalysis[];
  trendingTopics: TrendingTopic[];
  newsItems: NewsItem[];
}

export const AIAssistant = ({ storylines, trendingTopics, newsItems }: AIAssistantProps) => {
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);

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

  return (
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
  );
};
