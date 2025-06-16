
import { supabase } from '@/integrations/supabase/client';
import { NewsItem } from './data/dataTypes';
import { WrestlerAnalysis } from '@/types/wrestlerAnalysis';

interface WrestlerMentionData {
  wrestler_id: string;
  wrestler_name: string;
  source_url: string;
  source_type: 'news' | 'reddit';
  source_name: string;
  source_credibility_tier: number;
  title: string;
  content_snippet: string | null;
  sentiment_score: number;
  mention_context: string | null;
  keywords: string[];
}

interface WrestlerMetrics {
  wrestler_id: string;
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
}

// Enhanced wrestler name matching with variations
const getWrestlerNameVariations = (name: string): string[] => {
  const variations = [name];
  
  // Add common variations
  if (name.includes(' ')) {
    variations.push(name.replace(' ', ''));
    variations.push(name.split(' ')[0]); // First name only
    variations.push(name.split(' ').slice(-1)[0]); // Last name only
  }
  
  // Add common wrestling name patterns
  const commonReplacements = [
    { from: 'The ', to: '' },
    { from: ' Jr.', to: '' },
    { from: ' Sr.', to: '' },
    { from: ' III', to: '' },
    { from: ' II', to: '' }
  ];
  
  commonReplacements.forEach(({ from, to }) => {
    if (name.includes(from)) {
      variations.push(name.replace(from, to));
    }
  });
  
  return [...new Set(variations)];
};

// Enhanced sentiment analysis for wrestling context
const calculateWrestlingSentiment = (title: string, content: string): number => {
  const text = `${title} ${content}`.toLowerCase();
  
  // Wrestling-specific positive keywords
  const positiveKeywords = [
    'champion', 'title', 'win', 'wins', 'won', 'victory', 'push', 'pushed', 'over',
    'dominant', 'strong', 'impressive', 'outstanding', 'excellent', 'amazing',
    'return', 'returns', 'comeback', 'debut', 'main event', 'headlining',
    'future', 'star', 'talent', 'skilled', 'popular', 'crowd favorite'
  ];
  
  // Wrestling-specific negative keywords
  const negativeKeywords = [
    'buried', 'burial', 'jobber', 'lose', 'loses', 'lost', 'defeat', 'defeated',
    'squash', 'squashed', 'injured', 'injury', 'suspended', 'suspension',
    'fired', 'released', 'cut', 'demoted', 'heat', 'backstage issues',
    'disappointing', 'poor', 'weak', 'boring', 'stale'
  ];
  
  let score = 0.5; // Neutral baseline
  let wordCount = 0;
  
  positiveKeywords.forEach(keyword => {
    const matches = (text.match(new RegExp(keyword, 'g')) || []).length;
    score += matches * 0.1;
    wordCount += matches;
  });
  
  negativeKeywords.forEach(keyword => {
    const matches = (text.match(new RegExp(keyword, 'g')) || []).length;
    score -= matches * 0.1;
    wordCount += matches;
  });
  
  // Normalize score between 0 and 1
  return Math.max(0, Math.min(1, score));
};

// Calculate push/burial scores based on sentiment and context
const calculatePushBurialScores = (mentions: WrestlerMentionData[]): { push_score: number; burial_score: number } => {
  if (mentions.length === 0) return { push_score: 0, burial_score: 0 };
  
  let pushScore = 0;
  let burialScore = 0;
  let totalWeight = 0;
  
  mentions.forEach(mention => {
    const weight = mention.source_credibility_tier === 1 ? 2.0 : 
                   mention.source_credibility_tier === 2 ? 1.5 : 1.0;
    
    const sentiment = mention.sentiment_score;
    
    if (sentiment > 0.6) {
      pushScore += (sentiment - 0.5) * 100 * weight;
    } else if (sentiment < 0.4) {
      burialScore += (0.5 - sentiment) * 100 * weight;
    }
    
    totalWeight += weight;
  });
  
  return {
    push_score: totalWeight > 0 ? Math.min(100, pushScore / totalWeight) : 0,
    burial_score: totalWeight > 0 ? Math.min(100, burialScore / totalWeight) : 0
  };
};

// Enhanced wrestler analysis function
export const analyzeWrestlerMentions = async (
  wrestlers: any[],
  newsItems: NewsItem[]
): Promise<WrestlerAnalysis[]> => {
  console.log('Starting enhanced wrestler analysis...', { wrestlers: wrestlers.length, newsItems: newsItems.length });
  
  const wrestlerAnalyses: WrestlerAnalysis[] = [];
  const mentionsToStore: WrestlerMentionData[] = [];
  const metricsToStore: WrestlerMetrics[] = [];
  
  // Get source credibility data
  const { data: sourceCredibility } = await supabase
    .from('source_credibility')
    .select('*');
  
  const credibilityMap = new Map();
  sourceCredibility?.forEach(source => {
    credibilityMap.set(source.source_name.toLowerCase(), {
      tier: source.credibility_tier,
      weight: source.weight_multiplier
    });
  });
  
  for (const wrestler of wrestlers) {
    console.log(`Analyzing wrestler: ${wrestler.name}`);
    
    const wrestlerNameVariations = getWrestlerNameVariations(wrestler.name);
    const wrestlerMentions: WrestlerMentionData[] = [];
    
    // Find mentions in news
    newsItems.forEach(newsItem => {
      const searchText = `${newsItem.title} ${newsItem.contentSnippet || ''}`.toLowerCase();
      
      const isMentioned = wrestlerNameVariations.some(variation => 
        searchText.includes(variation.toLowerCase())
      );
      
      if (isMentioned) {
        const sourceName = newsItem.source || 'Unknown Source';
        const credInfo = credibilityMap.get(sourceName.toLowerCase()) || { tier: 3, weight: 1.0 };
        
        const sentiment = calculateWrestlingSentiment(
          newsItem.title,
          newsItem.contentSnippet || ''
        );
        
        const mentionData: WrestlerMentionData = {
          wrestler_id: wrestler.id,
          wrestler_name: wrestler.name,
          source_url: newsItem.link || '',
          source_type: 'news',
          source_name: sourceName,
          source_credibility_tier: credInfo.tier,
          title: newsItem.title,
          content_snippet: newsItem.contentSnippet,
          sentiment_score: sentiment,
          mention_context: null,
          keywords: []
        };
        
        wrestlerMentions.push(mentionData);
        mentionsToStore.push(mentionData);
      }
    });
    
    // Calculate metrics
    const { push_score, burial_score } = calculatePushBurialScores(wrestlerMentions);
    const momentum_score = Math.min(100, Math.max(0, (push_score - burial_score + 50)));
    const popularity_score = Math.min(100, wrestlerMentions.length * 10);
    
    // Calculate confidence level
    const tier1_mentions = wrestlerMentions.filter(m => m.source_credibility_tier === 1).length;
    const tier2_mentions = wrestlerMentions.filter(m => m.source_credibility_tier === 2).length;
    const tier3_mentions = wrestlerMentions.filter(m => m.source_credibility_tier === 3).length;
    
    const hoursOld = wrestlerMentions.length > 0 ? 1 : 24;
    
    const { data: confidenceResult } = await supabase.rpc('calculate_confidence_level', {
      mention_count: wrestlerMentions.length,
      tier1_count: tier1_mentions,
      tier2_count: tier2_mentions,
      tier3_count: tier3_mentions,
      hours_since_last_mention: hoursOld
    });
    
    const confidence_level = confidenceResult || 'low';
    
    // Prepare metrics for storage
    const metrics: WrestlerMetrics = {
      wrestler_id: wrestler.id,
      push_score,
      burial_score,
      momentum_score,
      popularity_score,
      confidence_level,
      mention_count: wrestlerMentions.length,
      data_sources: {
        total_mentions: wrestlerMentions.length,
        tier_1_mentions,
        tier_2_mentions,
        tier_3_mentions,
        hours_since_last_mention: hoursOld,
        source_breakdown: wrestlerMentions.reduce((acc, mention) => {
          acc[mention.source_name] = (acc[mention.source_name] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      }
    };
    
    metricsToStore.push(metrics);
    
    // Create analysis result
    const analysis: WrestlerAnalysis = {
      id: wrestler.id,
      wrestler_name: wrestler.name,
      promotion: wrestler.promotions?.name || 'Unknown',
      pushScore: push_score,
      burialScore: burial_score,
      trend: push_score > burial_score + 10 ? 'push' : 
             burial_score > push_score + 10 ? 'burial' : 'stable',
      totalMentions: wrestlerMentions.length,
      sentimentScore: wrestlerMentions.length > 0 ? 
        wrestlerMentions.reduce((sum, m) => sum + m.sentiment_score, 0) / wrestlerMentions.length * 100 : 50,
      isChampion: wrestler.is_champion || false,
      championshipTitle: wrestler.championship_title,
      evidence: wrestlerMentions.length > 0 ? 
        `Based on ${wrestlerMentions.length} recent mentions from ${[...new Set(wrestlerMentions.map(m => m.source_name))].join(', ')}` :
        'No recent mentions found',
      isOnFire: push_score > 70 && wrestlerMentions.length >= 3,
      momentumScore: momentum_score,
      popularityScore: popularity_score,
      change24h: 0, // Will be calculated based on historical data
      relatedNews: wrestlerMentions.slice(0, 5).map(mention => ({
        title: mention.title,
        link: mention.source_url,
        source: mention.source_name,
        pubDate: new Date().toISOString()
      })),
      mention_sources: wrestlerMentions,
      source_breakdown: {
        news_count: wrestlerMentions.length,
        reddit_count: 0,
        total_sources: wrestlerMentions.length
      }
    };
    
    wrestlerAnalyses.push(analysis);
  }
  
  // Store mentions in database
  if (mentionsToStore.length > 0) {
    console.log(`Storing ${mentionsToStore.length} wrestler mentions...`);
    const { error: mentionsError } = await supabase
      .from('wrestler_mentions_log')
      .insert(mentionsToStore);
    
    if (mentionsError) {
      console.error('Error storing wrestler mentions:', mentionsError);
    } else {
      console.log('Successfully stored wrestler mentions');
    }
  }
  
  // Store metrics in database
  if (metricsToStore.length > 0) {
    console.log(`Storing ${metricsToStore.length} wrestler metrics...`);
    const { error: metricsError } = await supabase
      .from('wrestler_metrics_history')
      .insert(metricsToStore);
    
    if (metricsError) {
      console.error('Error storing wrestler metrics:', metricsError);
    } else {
      console.log('Successfully stored wrestler metrics');
    }
  }
  
  console.log('Enhanced wrestler analysis completed', { totalAnalyses: wrestlerAnalyses.length });
  return wrestlerAnalyses.filter(analysis => analysis.totalMentions > 0);
};

// Function to get stored wrestler metrics with mentions
export const getStoredWrestlerMetrics = async (): Promise<WrestlerAnalysis[]> => {
  console.log('Fetching stored wrestler metrics...');
  
  // Get today's metrics
  const today = new Date().toISOString().split('T')[0];
  
  const { data: metricsData, error: metricsError } = await supabase
    .from('wrestler_metrics_history')
    .select(`
      *,
      wrestlers:wrestler_id (
        name,
        is_champion,
        championship_title,
        promotions (name)
      )
    `)
    .eq('date', today)
    .order('mention_count', { ascending: false });
  
  if (metricsError) {
    console.error('Error fetching metrics:', metricsError);
    return [];
  }
  
  if (!metricsData || metricsData.length === 0) {
    console.log('No stored metrics found for today');
    return [];
  }
  
  // Get mentions for each wrestler
  const analyses: WrestlerAnalysis[] = [];
  
  for (const metric of metricsData) {
    const { data: mentionsData } = await supabase
      .from('wrestler_mentions_log')
      .select('*')
      .eq('wrestler_id', metric.wrestler_id)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });
    
    const wrestler = metric.wrestlers;
    if (!wrestler) continue;
    
    const analysis: WrestlerAnalysis = {
      id: metric.wrestler_id,
      wrestler_name: wrestler.name,
      promotion: wrestler.promotions?.name || 'Unknown',
      pushScore: metric.push_score,
      burialScore: metric.burial_score,
      trend: metric.push_score > metric.burial_score + 10 ? 'push' : 
             metric.burial_score > metric.push_score + 10 ? 'burial' : 'stable',
      totalMentions: metric.mention_count,
      sentimentScore: mentionsData?.length > 0 ? 
        mentionsData.reduce((sum, m) => sum + m.sentiment_score, 0) / mentionsData.length * 100 : 50,
      isChampion: wrestler.is_champion || false,
      championshipTitle: wrestler.championship_title,
      evidence: metric.mention_count > 0 ? 
        `Based on ${metric.mention_count} recent mentions from multiple sources` :
        'No recent mentions found',
      isOnFire: metric.push_score > 70 && metric.mention_count >= 3,
      momentumScore: metric.momentum_score,
      popularityScore: metric.popularity_score,
      change24h: 0,
      relatedNews: mentionsData?.slice(0, 5).map(mention => ({
        title: mention.title,
        link: mention.source_url,
        source: mention.source_name,
        pubDate: mention.created_at
      })) || [],
      mention_sources: mentionsData || [],
      source_breakdown: metric.data_sources?.source_breakdown || {
        news_count: metric.mention_count,
        reddit_count: 0,
        total_sources: metric.mention_count
      },
      confidence_level: metric.confidence_level,
      last_updated: metric.updated_at,
      data_sources: metric.data_sources
    };
    
    analyses.push(analysis);
  }
  
  console.log(`Retrieved ${analyses.length} stored wrestler analyses`);
  return analyses;
};
