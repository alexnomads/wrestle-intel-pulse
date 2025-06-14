
import { supabase } from '@/integrations/supabase/client';

export interface FreeSocialPost {
  id: string;
  text: string;
  author: string;
  timestamp: Date;
  engagement: {
    likes: number;
    retweets: number;
    replies: number;
  };
  source: 'twitter' | 'instagram' | 'news' | 'youtube';
  original_url: string;
  isFree?: boolean;
  isEnhanced?: boolean;
}

class FreeWrestlingSocialService {
  async fetchWrestlingSocialContent(accounts: string[]): Promise<FreeSocialPost[]> {
    try {
      console.log(`🔄 Wrestling News Aggregator: Fetching content from wrestling journalism sites`);
      
      const { data, error } = await supabase.functions.invoke('wrestling-news-aggregator', {
        body: { accounts }
      });

      if (error) {
        console.error('Wrestling news aggregator error:', error);
        return this.getNewsBasedFallbackContent();
      }

      const posts = data.posts || [];
      const sourcesCount = data.sources_count || 0;
      const realNewsCount = data.real_news_count || 0;
      
      console.log(`✅ News aggregator results: ${posts.length} posts from ${sourcesCount} sources, ${realNewsCount} real news items`);
      
      // Convert to FreeSocialPost format
      const formattedPosts: FreeSocialPost[] = posts.map((post: any) => ({
        id: post.id,
        text: post.text,
        author: post.author,
        timestamp: new Date(post.timestamp),
        engagement: post.engagement,
        source: post.source,
        original_url: post.original_url,
        isFree: true,
        isEnhanced: true
      }));

      return formattedPosts;

    } catch (error) {
      console.error('Wrestling news aggregator service error:', error);
      return this.getNewsBasedFallbackContent();
    }
  }

  private getNewsBasedFallbackContent(): FreeSocialPost[] {
    const newsUpdates = [
      '📰 Wrestling News Aggregator collecting content from major wrestling journalism sites including PWTorch, F4WOnline, and Wrestling Inc.',
      '📊 Monitoring breaking news, roster updates, and backstage reports from trusted wrestling sources.',
      '🔍 Curating content that references social media activity, interviews, and insider reports.',
      '📈 Tracking storyline developments and wrestler mentions across multiple wrestling news outlets.',
      '⚡ Real-time wrestling news collection from sites that already monitor social media activity.'
    ];

    return newsUpdates.map((message, index) => ({
      id: `news_aggregator_${index}_${Date.now()}`,
      text: message,
      author: 'WrestlingNewsAggregator',
      timestamp: new Date(Date.now() - (index * 300000)), // Stagger by 5 minutes
      engagement: {
        likes: Math.floor(Math.random() * 50) + 25,
        retweets: Math.floor(Math.random() * 15) + 5,
        replies: Math.floor(Math.random() * 10) + 2
      },
      source: 'news' as const,
      original_url: '#',
      isFree: true,
      isEnhanced: true
    }));
  }
}

const freeWrestlingSocialService = new FreeWrestlingSocialService();

export const fetchFreeWrestlingSocial = (accounts: string[]) => 
  freeWrestlingSocialService.fetchWrestlingSocialContent(accounts);
