
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WrestlerMention {
  wrestler_id: string;
  wrestler_name: string;
  source_url: string;
  source_type: 'news' | 'reddit' | 'twitter' | 'youtube';
  source_name: string;
  source_credibility_tier: number;
  title: string;
  content_snippet: string;
  sentiment_score: number;
  mention_context: string;
  keywords: string[];
}

interface MetricsCalculation {
  wrestler_id: string;
  push_score: number;
  burial_score: number;
  momentum_score: number;
  popularity_score: number;
  confidence_level: 'high' | 'medium' | 'low';
  mention_count: number;
  data_sources: Record<string, any>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🔄 Wrestler Metrics Processor: Starting metrics calculation...');

    // Get all wrestlers
    const { data: wrestlers, error: wrestlersError } = await supabase
      .from('wrestlers')
      .select('id, name');

    if (wrestlersError) {
      throw new Error(`Error fetching wrestlers: ${wrestlersError.message}`);
    }

    const processedMetrics: MetricsCalculation[] = [];

    // Process each wrestler
    for (const wrestler of wrestlers || []) {
      try {
        const metrics = await calculateWrestlerMetrics(supabase, wrestler.id, wrestler.name);
        processedMetrics.push(metrics);
        
        // Store/update metrics in database
        await storeWrestlerMetrics(supabase, metrics);
        
        console.log(`✅ Processed metrics for ${wrestler.name}: ${JSON.stringify(metrics)}`);
      } catch (error) {
        console.error(`❌ Error processing ${wrestler.name}:`, error.message);
      }
    }

    console.log(`✅ Wrestler Metrics Processor completed: ${processedMetrics.length} wrestlers processed`);

    return new Response(
      JSON.stringify({ 
        success: true,
        processed_count: processedMetrics.length,
        metrics: processedMetrics.slice(0, 5) // Return sample for verification
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Wrestler metrics processor error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

async function calculateWrestlerMetrics(
  supabase: any, 
  wrestlerId: string, 
  wrestlerName: string
): Promise<MetricsCalculation> {
  // Get recent mentions for this wrestler (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: mentions, error } = await supabase
    .from('wrestler_mentions_log')
    .select('*')
    .eq('wrestler_id', wrestlerId)
    .gte('created_at', thirtyDaysAgo.toISOString());

  if (error) {
    console.error(`Error fetching mentions for ${wrestlerName}:`, error);
  }

  const wrestlerMentions = mentions || [];
  
  // Calculate metrics based on mentions
  const pushScore = calculatePushScore(wrestlerMentions);
  const burialScore = calculateBurialScore(wrestlerMentions);
  const momentumScore = calculateMomentumScore(wrestlerMentions);
  const popularityScore = calculatePopularityScore(wrestlerMentions);
  
  // Calculate confidence level
  const tier1Count = wrestlerMentions.filter(m => m.source_credibility_tier === 1).length;
  const tier2Count = wrestlerMentions.filter(m => m.source_credibility_tier === 2).length;
  const tier3Count = wrestlerMentions.filter(m => m.source_credibility_tier === 3).length;
  
  const latestMention = wrestlerMentions.length > 0 
    ? new Date(Math.max(...wrestlerMentions.map(m => new Date(m.created_at).getTime())))
    : new Date(0);
  const hoursSinceLastMention = Math.floor((Date.now() - latestMention.getTime()) / (1000 * 60 * 60));
  
  const confidenceLevel = calculateConfidenceLevel(
    wrestlerMentions.length,
    tier1Count,
    tier2Count,
    tier3Count,
    hoursSinceLastMention
  );

  // Prepare data sources breakdown
  const dataSources = {
    total_mentions: wrestlerMentions.length,
    tier_1_mentions: tier1Count,
    tier_2_mentions: tier2Count,
    tier_3_mentions: tier3Count,
    hours_since_last_mention: hoursSinceLastMention,
    source_breakdown: wrestlerMentions.reduce((acc, mention) => {
      acc[mention.source_type] = (acc[mention.source_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  return {
    wrestler_id: wrestlerId,
    push_score: Math.round(pushScore * 100) / 100,
    burial_score: Math.round(burialScore * 100) / 100,
    momentum_score: Math.round(momentumScore),
    popularity_score: Math.round(popularityScore),
    confidence_level: confidenceLevel,
    mention_count: wrestlerMentions.length,
    data_sources: dataSources
  };
}

function calculatePushScore(mentions: any[]): number {
  if (mentions.length === 0) return 0;

  const positiveKeywords = [
    'main event', 'title shot', 'championship', 'pushed', 'featured', 'headlining',
    'top guy', 'breakout star', 'momentum', 'elevated', 'spotlight'
  ];

  let pushScore = 0;
  let totalWeight = 0;

  mentions.forEach(mention => {
    const content = (mention.title + ' ' + (mention.content_snippet || '')).toLowerCase();
    let mentionPushScore = 0;

    positiveKeywords.forEach(keyword => {
      if (content.includes(keyword)) {
        mentionPushScore += 10;
      }
    });

    // Weight by source credibility
    const weight = mention.source_credibility_tier === 1 ? 2.0 : 
                   mention.source_credibility_tier === 2 ? 1.5 : 1.0;
    
    // Weight by sentiment score
    mentionPushScore *= mention.sentiment_score;
    
    pushScore += mentionPushScore * weight;
    totalWeight += weight;
  });

  return totalWeight > 0 ? Math.min(100, pushScore / totalWeight) : 0;
}

function calculateBurialScore(mentions: any[]): number {
  if (mentions.length === 0) return 0;

  const negativeKeywords = [
    'buried', 'jobber', 'enhancement talent', 'squash match', 'losing streak',
    'demoted', 'released', 'suspended', 'creative has nothing', 'underutilized'
  ];

  let burialScore = 0;
  let totalWeight = 0;

  mentions.forEach(mention => {
    const content = (mention.title + ' ' + (mention.content_snippet || '')).toLowerCase();
    let mentionBurialScore = 0;

    negativeKeywords.forEach(keyword => {
      if (content.includes(keyword)) {
        mentionBurialScore += 10;
      }
    });

    // Weight by source credibility
    const weight = mention.source_credibility_tier === 1 ? 2.0 : 
                   mention.source_credibility_tier === 2 ? 1.5 : 1.0;
    
    // Inverse weight by sentiment score (lower sentiment = higher burial score)
    mentionBurialScore *= (1 - mention.sentiment_score);
    
    burialScore += mentionBurialScore * weight;
    totalWeight += weight;
  });

  return totalWeight > 0 ? Math.min(100, burialScore / totalWeight) : 0;
}

function calculateMomentumScore(mentions: any[]): number {
  if (mentions.length === 0) return 0;

  // Calculate momentum based on recent activity and trend
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const recentMentions = mentions.filter(m => new Date(m.created_at) > sevenDaysAgo);
  const olderMentions = mentions.filter(m => {
    const date = new Date(m.created_at);
    return date <= sevenDaysAgo && date > fourteenDaysAgo;
  });

  const recentScore = recentMentions.length * 10;
  const olderScore = olderMentions.length * 5;
  
  // Momentum is the difference between recent and older activity
  const momentum = recentScore - olderScore;
  
  return Math.max(0, Math.min(100, 50 + momentum));
}

function calculatePopularityScore(mentions: any[]): number {
  if (mentions.length === 0) return 0;

  // Base popularity on total mentions and average sentiment
  const avgSentiment = mentions.reduce((sum, m) => sum + m.sentiment_score, 0) / mentions.length;
  const mentionBonus = Math.min(50, mentions.length * 2);
  const sentimentBonus = (avgSentiment - 0.5) * 50;
  
  return Math.max(0, Math.min(100, mentionBonus + sentimentBonus));
}

function calculateConfidenceLevel(
  mentionCount: number,
  tier1Count: number,
  tier2Count: number,
  tier3Count: number,
  hoursSinceLastMention: number
): 'high' | 'medium' | 'low' {
  if (mentionCount >= 5 && (tier1Count + tier2Count) >= 2 && hoursSinceLastMention <= 48) {
    return 'high';
  }
  if (mentionCount >= 3 && (tier1Count + tier2Count) >= 1 && hoursSinceLastMention <= 168) {
    return 'medium';
  }
  return 'low';
}

async function storeWrestlerMetrics(supabase: any, metrics: MetricsCalculation): Promise<void> {
  const { error } = await supabase
    .from('wrestler_metrics_history')
    .upsert({
      wrestler_id: metrics.wrestler_id,
      date: new Date().toISOString().split('T')[0], // Current date
      push_score: metrics.push_score,
      burial_score: metrics.burial_score,
      momentum_score: metrics.momentum_score,
      popularity_score: metrics.popularity_score,
      confidence_level: metrics.confidence_level,
      mention_count: metrics.mention_count,
      data_sources: metrics.data_sources,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'wrestler_id,date'
    });

  if (error) {
    console.error('Error storing wrestler metrics:', error);
    throw error;
  }
}
