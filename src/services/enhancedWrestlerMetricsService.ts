
import { supabase } from '@/integrations/supabase/client';
import { enhancedSentimentService } from './enhancedSentimentService';

interface WrestlerMetricsData {
  wrestler_id: string;
  wrestler_name: string;
  push_score: number;
  burial_score: number;
  momentum_score: number;
  popularity_score: number;
  confidence_level: 'high' | 'medium' | 'low';
  mention_count: number;
  data_sources: {
    total_mentions: number;
    tier_1_mentions: number;
    tier_2_mentions: number;
    tier_3_mentions: number;
    hours_since_last_mention: number;
    source_breakdown: Record<string, number>;
  };
  last_updated: string;
}

export class EnhancedWrestlerMetricsService {
  async getWrestlerMetrics(wrestlerId?: string): Promise<WrestlerMetricsData[]> {
    try {
      console.log('Fetching wrestler metrics...', { wrestlerId });
      
      // Initialize source credibility cache
      await enhancedSentimentService.initializeSourceCredibility();

      let query = supabase
        .from('wrestler_metrics_history')
        .select(`
          wrestler_id,
          push_score,
          burial_score,
          momentum_score,
          popularity_score,
          confidence_level,
          mention_count,
          data_sources,
          updated_at,
          wrestlers!inner(name)
        `)
        .order('updated_at', { ascending: false });

      if (wrestlerId) {
        query = query.eq('wrestler_id', wrestlerId);
      }

      const { data: metricsHistory, error } = await query.limit(1000);

      if (error) {
        console.error('Error fetching wrestler metrics:', error);
        return [];
      }

      console.log('Raw metrics data:', metricsHistory?.length || 0, 'entries');

      if (!metricsHistory || metricsHistory.length === 0) {
        console.log('No metrics found in database');
        return [];
      }

      // Group by wrestler_id and get the most recent entry for each
      const latestMetrics = new Map<string, any>();
      
      metricsHistory.forEach(entry => {
        const wrestlerId = entry.wrestler_id;
        if (!latestMetrics.has(wrestlerId) || 
            new Date(entry.updated_at) > new Date(latestMetrics.get(wrestlerId).updated_at)) {
          latestMetrics.set(wrestlerId, entry);
        }
      });

      console.log('Grouped metrics for', latestMetrics.size, 'wrestlers');

      const result: WrestlerMetricsData[] = Array.from(latestMetrics.values()).map(entry => ({
        wrestler_id: entry.wrestler_id,
        wrestler_name: entry.wrestlers.name,
        push_score: entry.push_score,
        burial_score: entry.burial_score,
        momentum_score: entry.momentum_score,
        popularity_score: entry.popularity_score,
        confidence_level: entry.confidence_level,
        mention_count: entry.mention_count,
        data_sources: entry.data_sources || {
          total_mentions: 0,
          tier_1_mentions: 0,
          tier_2_mentions: 0,
          tier_3_mentions: 0,
          hours_since_last_mention: 999,
          source_breakdown: {}
        },
        last_updated: entry.updated_at
      }));

      console.log('Returning', result.length, 'wrestler metrics');
      return result.sort((a, b) => b.mention_count - a.mention_count);

    } catch (error) {
      console.error('Error in getWrestlerMetrics:', error);
      return [];
    }
  }

  async logWrestlerMention(
    wrestlerId: string,
    wrestlerName: string,
    sourceUrl: string,
    sourceType: 'news' | 'reddit' | 'twitter' | 'youtube',
    sourceName: string,
    title: string,
    contentSnippet: string
  ): Promise<void> {
    try {
      console.log('Logging wrestler mention:', { wrestlerName, sourceName });
      
      // Analyze sentiment with enhanced service
      const sentimentAnalysis = enhancedSentimentService.analyzeWrestlingSentiment(
        title + ' ' + contentSnippet,
        sourceName
      );

      // Get source credibility tier
      const { data: sourceCredibility } = await supabase
        .from('source_credibility')
        .select('credibility_tier')
        .eq('source_name', sourceName)
        .single();

      const credibilityTier = sourceCredibility?.credibility_tier || 3;

      // Store the mention
      const { error } = await supabase
        .from('wrestler_mentions_log')
        .insert({
          wrestler_id: wrestlerId,
          wrestler_name: wrestlerName,
          source_url: sourceUrl,
          source_type: sourceType,
          source_name: sourceName,
          source_credibility_tier: credibilityTier,
          title: title,
          content_snippet: contentSnippet,
          sentiment_score: sentimentAnalysis.score,
          mention_context: sentimentAnalysis.context,
          keywords: sentimentAnalysis.keywords
        });

      if (error) {
        console.error('Error logging wrestler mention:', error);
      } else {
        console.log('Successfully logged mention for', wrestlerName);
      }

    } catch (error) {
      console.error('Error in logWrestlerMention:', error);
    }
  }

  async processNewsForMentions(newsItems: any[], wrestlers: any[]): Promise<void> {
    try {
      console.log('Processing', newsItems.length, 'news items for', wrestlers.length, 'wrestlers');
      let processedCount = 0;
      
      for (const newsItem of newsItems) {
        for (const wrestler of wrestlers) {
          const content = (newsItem.title + ' ' + (newsItem.contentSnippet || '')).toLowerCase();
          const wrestlerName = wrestler.name.toLowerCase();

          // More flexible name matching
          const nameVariations = [
            wrestlerName,
            wrestlerName.replace(/\s+/g, ''), // remove spaces
            wrestlerName.split(' ').join(''), // join without spaces
            ...wrestlerName.split(' ') // individual name parts
          ];

          const hasMatch = nameVariations.some(variation => 
            variation.length > 2 && content.includes(variation)
          );

          if (hasMatch) {
            await this.logWrestlerMention(
              wrestler.id,
              wrestler.name,
              newsItem.link || '',
              'news',
              newsItem.source || 'Unknown',
              newsItem.title,
              newsItem.contentSnippet || ''
            );
            processedCount++;
          }
        }
      }
      
      console.log('Processed', processedCount, 'wrestler mentions from news');
    } catch (error) {
      console.error('Error processing news for mentions:', error);
    }
  }

  async triggerMetricsCalculation(): Promise<void> {
    try {
      console.log('Triggering metrics calculation...');
      const { data, error } = await supabase.functions.invoke('wrestler-metrics-processor');
      
      if (error) {
        console.error('Error triggering metrics calculation:', error);
        throw error;
      } else {
        console.log('Metrics calculation triggered successfully:', data);
      }
    } catch (error) {
      console.error('Error in triggerMetricsCalculation:', error);
      throw error;
    }
  }

  async getWrestlerTrends(wrestlerId: string, days: number = 30): Promise<any[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: trends, error } = await supabase
        .from('wrestler_metrics_history')
        .select('*')
        .eq('wrestler_id', wrestlerId)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching wrestler trends:', error);
        return [];
      }

      return trends || [];
    } catch (error) {
      console.error('Error in getWrestlerTrends:', error);
      return [];
    }
  }
}

export const enhancedWrestlerMetricsService = new EnhancedWrestlerMetricsService();
