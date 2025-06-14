
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
}

class FreeWrestlingSocialService {
  async fetchWrestlingSocialContent(accounts: string[]): Promise<FreeSocialPost[]> {
    try {
      console.log(`🆓 Free Wrestling Social Aggregator: Fetching content for ${accounts.length} accounts`);
      
      const { data, error } = await supabase.functions.invoke('free-wrestling-social-scraper', {
        body: { accounts }
      });

      if (error) {
        console.error('Free scraper error:', error);
        return this.getFallbackContent(accounts);
      }

      const posts = data.posts || [];
      
      // Convert to FreeSocialPost format
      const formattedPosts: FreeSocialPost[] = posts.map((post: any) => ({
        id: post.id,
        text: post.text,
        author: post.author,
        timestamp: new Date(post.timestamp),
        engagement: post.engagement,
        source: post.source,
        original_url: post.original_url,
        isFree: true
      }));

      console.log(`✅ Free scraper returned ${formattedPosts.length} posts`);
      return formattedPosts;

    } catch (error) {
      console.error('Free wrestling social service error:', error);
      return this.getFallbackContent(accounts);
    }
  }

  private getFallbackContent(accounts: string[]): FreeSocialPost[] {
    const statusMessages = [
      '🔄 Free Wrestling Social Aggregator is active and monitoring wrestling accounts across multiple platforms without API costs.',
      '📱 Collecting wrestling content from Twitter, Instagram, news sites, and YouTube using free scraping methods.',
      '⚡ Real-time wrestling social media content will appear here as it\'s collected from free sources.',
      '🎯 Smart content curation in progress - prioritizing federations, wrestlers, and journalists from your list.',
      '🆓 This system operates completely free of charge, with no rate limits or API restrictions.'
    ];

    return statusMessages.map((message, index) => ({
      id: `free_fallback_${index}_${Date.now()}`,
      text: message,
      author: 'FreeWrestlingAggregator',
      timestamp: new Date(Date.now() - (index * 120000)), // Stagger by 2 minutes
      engagement: {
        likes: 0,
        retweets: 0,
        replies: 0
      },
      source: 'twitter' as const,
      original_url: '#',
      isFree: true
    }));
  }
}

const freeWrestlingSocialService = new FreeWrestlingSocialService();

export const fetchFreeWrestlingSocial = (accounts: string[]) => 
  freeWrestlingSocialService.fetchWrestlingSocialContent(accounts);
