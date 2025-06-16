
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, ExternalLink, Newspaper } from 'lucide-react';

interface RecentNewsSectionProps {
  wrestler: any;
}

export const RecentNewsSection = ({ wrestler }: RecentNewsSectionProps) => {
  // Get related news from multiple possible sources with better fallback logic
  const relatedNews = wrestler.relatedNews || 
                     wrestler.mention_sources || 
                     (wrestler.recentNews ? wrestler.recentNews : []);
  
  console.log('RecentNewsSection - wrestler data:', {
    wrestlerName: wrestler.wrestler_name || wrestler.name,
    relatedNews: relatedNews?.length || 0,
    mentionSources: wrestler.mention_sources?.length || 0,
    hasRelatedNews: !!wrestler.relatedNews,
    wrestlerKeys: Object.keys(wrestler)
  });
  
  if (!relatedNews || relatedNews.length === 0) {
    return (
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="h-5 w-5 text-wrestling-electric" />
          <h3 className="text-lg font-semibold">Recent News</h3>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <Newspaper className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No recent news articles found for {wrestler.wrestler_name || wrestler.name}</p>
          <p className="text-sm">Try refreshing to get newer articles or check the news sources</p>
          <div className="text-xs mt-2 text-yellow-600">
            Debug: Checked relatedNews ({wrestler.relatedNews?.length || 0}), 
            mention_sources ({wrestler.mention_sources?.length || 0})
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center space-x-2 mb-4">
        <Calendar className="h-5 w-5 text-wrestling-electric" />
        <h3 className="text-lg font-semibold">Recent News</h3>
        <span className="text-sm text-muted-foreground">({relatedNews.length} articles)</span>
      </div>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {relatedNews.map((news: any, index: number) => {
          // Handle different data structures more robustly
          const title = news.title;
          const source = news.source || news.source_name || 'Wrestling News';
          const link = news.link || news.url || news.source_url;
          const pubDate = news.pubDate || news.timestamp || news.published_at;
          const snippet = news.content_snippet || news.contentSnippet || news.content;

          return (
            <div key={index} className="p-3 bg-secondary/20 rounded-lg border border-border/30 hover:bg-secondary/30 transition-colors">
              <div className="font-medium text-sm mb-2 line-clamp-2">{title}</div>
              
              {snippet && (
                <div className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {snippet}
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span className="font-medium">{source}</span>
                {pubDate && (
                  <span>{new Date(pubDate).toLocaleDateString()}</span>
                )}
              </div>
              
              {link && link !== '#' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs hover:bg-wrestling-electric/20"
                  onClick={() => window.open(link, '_blank', 'noopener,noreferrer')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Read Article
                </Button>
              )}
            </div>
          );
        })}
      </div>
      
      {relatedNews.length > 5 && (
        <div className="text-center text-sm text-muted-foreground mt-3">
          Showing recent articles mentioning {wrestler.wrestler_name || wrestler.name}
        </div>
      )}
    </div>
  );
};
