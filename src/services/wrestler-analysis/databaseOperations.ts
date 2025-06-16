
import { supabase } from '@/integrations/supabase/client';
import { WrestlerAnalysis } from '@/types/wrestlerAnalysis';

interface RawWrestlerMetric {
  wrestler_id: string;
  push_score: number;
  burial_score: number;
  momentum_score: number;
  popularity_score: number;
  mention_count: number;
  confidence_level: 'high' | 'medium' | 'low';
  data_sources: {
    total_mentions: number;
    tier_1_mentions: number;
    tier_2_mentions: number;
    tier_3_mentions: number;
    hours_since_last_mention: number;
    source_breakdown: Record<string, number>;
  };
}

export const storeWrestlerMentions = async (mentionsToStore: any[]): Promise<void> => {
  if (mentionsToStore.length === 0) return;

  console.log(`💾 Storing ${mentionsToStore.length} wrestler mentions...`);
  try {
    const { error: mentionsError } = await supabase
      .from('wrestler_mentions_log')
      .insert(mentionsToStore);

    if (mentionsError) {
      console.error('❌ Error storing wrestler mentions:', mentionsError);
    } else {
      console.log('✅ Successfully stored wrestler mentions');
    }
  } catch (error) {
    console.error('❌ Error storing mentions:', error);
  }
};

export const storeWrestlerMetrics = async (analyses: WrestlerAnalysis[]): Promise<void> => {
  if (analyses.length === 0) return;

  console.log(`💾 Storing ${analyses.length} wrestler metrics...`);
  try {
    const metricsToStore = analyses.map(analysis => ({
      wrestler_id: analysis.id,
      push_score: analysis.pushScore,
      burial_score: analysis.burialScore,
      momentum_score: analysis.momentumScore,
      popularity_score: analysis.popularityScore,
      mention_count: analysis.totalMentions,
      confidence_level: analysis.totalMentions >= 5 ? 'high' : analysis.totalMentions >= 3 ? 'medium' : 'low',
      data_sources: {
        total_mentions: analysis.totalMentions,
        tier_1_mentions: 0,
        tier_2_mentions: analysis.totalMentions,
        tier_3_mentions: 0,
        hours_since_last_mention: 1,
        source_breakdown: analysis.source_breakdown || {}
      } as any
    }));

    const { error: metricsError } = await supabase
      .from('wrestler_metrics_history')
      .insert(metricsToStore);

    if (metricsError) {
      console.error('❌ Error storing wrestler metrics:', metricsError);
    } else {
      console.log('✅ Successfully stored wrestler metrics');
    }
  } catch (error) {
    console.error('❌ Error storing metrics:', error);
  }
};

export const getStoredWrestlerMetrics = async (): Promise<WrestlerAnalysis[]> => {
  try {
    // First get the metrics
    const { data: metrics, error: metricsError } = await supabase
      .from('wrestler_metrics_history')
      .select('*')
      .order('created_at', { ascending: false });

    if (metricsError) {
      console.error('❌ Error fetching stored metrics:', metricsError);
      return [];
    }

    if (!metrics || metrics.length === 0) {
      console.log('⚠️ No stored wrestler metrics found');
      return [];
    }

    // Then get the wrestlers data separately
    const wrestlerIds = [...new Set(metrics.map(m => m.wrestler_id))];
    const { data: wrestlers, error: wrestlersError } = await supabase
      .from('wrestlers')
      .select('id, name, brand, is_champion, championship_title')
      .in('id', wrestlerIds);

    if (wrestlersError) {
      console.error('❌ Error fetching wrestlers:', wrestlersError);
      return [];
    }

    // Create a map for quick lookup
    const wrestlerMap = new Map();
    wrestlers?.forEach(wrestler => {
      wrestlerMap.set(wrestler.id, wrestler);
    });

    console.log(`📊 Retrieved ${metrics.length} stored wrestler analyses`);

    return metrics.map(metric => {
      const wrestler = wrestlerMap.get(metric.wrestler_id);
      const dataSources = typeof metric.data_sources === 'string' 
        ? JSON.parse(metric.data_sources) 
        : metric.data_sources || {};

      return {
        id: metric.wrestler_id,
        wrestler_name: wrestler?.name || 'Unknown Wrestler',
        promotion: wrestler?.brand || 'Unknown',
        pushScore: metric.push_score,
        burialScore: metric.burial_score,
        momentumScore: metric.momentum_score,
        popularityScore: metric.popularity_score,
        totalMentions: metric.mention_count,
        sentimentScore: Math.round((metric.push_score + (100 - metric.burial_score)) / 2),
        isChampion: wrestler?.is_champion || false,
        championshipTitle: wrestler?.championship_title,
        isOnFire: metric.push_score > 80 || metric.mention_count > 8,
        trend: metric.push_score > 70 ? 'push' : metric.burial_score > 60 ? 'burial' : 'stable',
        evidence: `Based on ${metric.mention_count} recent mentions`,
        change24h: 0,
        relatedNews: [],
        mention_sources: [],
        source_breakdown: (dataSources as any).source_breakdown || {
          news_count: metric.mention_count,
          reddit_count: 0,
          total_sources: metric.mention_count
        }
      };
    });
  } catch (error) {
    console.error('❌ Error in getStoredWrestlerMetrics:', error);
    return [];
  }
};
