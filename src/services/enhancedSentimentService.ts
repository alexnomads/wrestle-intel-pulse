
import { supabase } from '@/integrations/supabase/client';

interface WrestlingKeywords {
  positive: string[];
  negative: string[];
  neutral: string[];
  kayfabe: string[];
  backstage: string[];
}

interface SourceCredibility {
  source_name: string;
  credibility_tier: number;
  weight_multiplier: number;
  source_type: string;
}

export class EnhancedSentimentService {
  private wrestlingKeywords: WrestlingKeywords = {
    positive: [
      'main event', 'title shot', 'championship', 'over with crowd', 'pushed', 'featured',
      'headlining', 'top guy', 'face turn', 'babyface', 'fan favorite', 'breakout star',
      'momentum', 'elevated', 'spotlight', 'money match', 'draw', 'ratings spike',
      'merchandise sales', 'social media buzz', 'trending', 'viral moment'
    ],
    negative: [
      'buried', 'jobber', 'enhancement talent', 'squash match', 'losing streak',
      'heel heat', 'go away heat', 'backstage heat', 'demoted', 'future endeavored',
      'released', 'suspended', 'creative has nothing', 'directionless', 'wasted',
      'underutilized', 'mid-card hell', 'dark match', 'catering', 'backstage politics'
    ],
    neutral: [
      'appeared', 'wrestled', 'competed', 'match', 'segment', 'promo', 'interview',
      'backstage', 'ringside', 'commentary', 'referee', 'manager', 'stable'
    ],
    kayfabe: [
      'storyline', 'angle', 'feud', 'rivalry', 'character', 'gimmick', 'persona',
      'heel turn', 'face turn', 'work', 'worked shoot', 'kayfabe', 'script'
    ],
    backstage: [
      'contract', 'negotiations', 'backstage', 'real life', 'shoot', 'legitimate',
      'behind the scenes', 'locker room', 'creative team', 'booking', 'politics'
    ]
  };

  private sourceCredibilityCache = new Map<string, SourceCredibility>();

  async initializeSourceCredibility(): Promise<void> {
    try {
      const { data: sources, error } = await supabase
        .from('source_credibility')
        .select('*');

      if (error) {
        console.error('Error loading source credibility:', error);
        return;
      }

      sources?.forEach(source => {
        this.sourceCredibilityCache.set(source.source_name, source);
      });

      console.log(`Loaded ${sources?.length} source credibility ratings`);
    } catch (error) {
      console.error('Error initializing source credibility:', error);
    }
  }

  analyzeWrestlingSentiment(text: string, sourceName: string): {
    score: number;
    confidence: number;
    context: 'kayfabe' | 'backstage' | 'mixed';
    keywords: string[];
  } {
    const lowerText = text.toLowerCase();
    const foundKeywords: string[] = [];
    let positiveScore = 0;
    let negativeScore = 0;
    let kayfabeScore = 0;
    let backstageScore = 0;

    // Analyze positive keywords
    this.wrestlingKeywords.positive.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        foundKeywords.push(keyword);
        positiveScore += 1;
      }
    });

    // Analyze negative keywords
    this.wrestlingKeywords.negative.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        foundKeywords.push(keyword);
        negativeScore += 1;
      }
    });

    // Analyze context (kayfabe vs backstage)
    this.wrestlingKeywords.kayfabe.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        kayfabeScore += 1;
      }
    });

    this.wrestlingKeywords.backstage.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        backstageScore += 1;
      }
    });

    // Determine context
    let context: 'kayfabe' | 'backstage' | 'mixed' = 'mixed';
    if (backstageScore > kayfabeScore) {
      context = 'backstage';
    } else if (kayfabeScore > backstageScore) {
      context = 'kayfabe';
    }

    // Calculate base sentiment score
    const totalKeywords = positiveScore + negativeScore;
    let sentimentScore = 0.5; // Neutral default

    if (totalKeywords > 0) {
      sentimentScore = positiveScore / totalKeywords;
    }

    // Apply source credibility weighting
    const sourceCredibility = this.getSourceCredibility(sourceName);
    const weightedScore = this.applySourceWeighting(sentimentScore, sourceCredibility);

    // Calculate confidence based on keyword matches and source credibility
    const confidence = Math.min(1.0, (foundKeywords.length * 0.2) + (sourceCredibility.weight_multiplier * 0.3));

    return {
      score: Math.max(0, Math.min(1, weightedScore)),
      confidence: Math.max(0.1, Math.min(1, confidence)),
      context,
      keywords: foundKeywords
    };
  }

  private getSourceCredibility(sourceName: string): SourceCredibility {
    const cached = this.sourceCredibilityCache.get(sourceName);
    if (cached) {
      return cached;
    }

    // Default for unknown sources
    return {
      source_name: sourceName,
      credibility_tier: 3,
      weight_multiplier: 1.0,
      source_type: 'news'
    };
  }

  private applySourceWeighting(baseScore: number, credibility: SourceCredibility): number {
    // Weight the sentiment score based on source credibility
    // Higher credibility sources have more impact on extreme scores
    const centerDistance = Math.abs(baseScore - 0.5);
    const weightedDistance = centerDistance * credibility.weight_multiplier;
    
    if (baseScore > 0.5) {
      return 0.5 + Math.min(0.5, weightedDistance);
    } else {
      return 0.5 - Math.min(0.5, weightedDistance);
    }
  }

  calculateConfidenceLevel(
    mentionCount: number,
    tier1Count: number,
    tier2Count: number,
    tier3Count: number,
    hoursSinceLastMention: number
  ): 'high' | 'medium' | 'low' {
    // High confidence: 5+ mentions with at least 2 from tier 1/2 sources in last 48 hours
    if (mentionCount >= 5 && (tier1Count + tier2Count) >= 2 && hoursSinceLastMention <= 48) {
      return 'high';
    }
    // Medium confidence: 3+ mentions with at least 1 from tier 1/2 sources in last 7 days
    if (mentionCount >= 3 && (tier1Count + tier2Count) >= 1 && hoursSinceLastMention <= 168) {
      return 'medium';
    }
    // Low confidence: everything else
    return 'low';
  }

  detectSarcasmAndIrony(text: string): boolean {
    const sarcasmIndicators = [
      'sure', 'totally', 'absolutely', 'definitely', 'clearly', 'obviously',
      '/s', 'not', "can't wait", 'thrilled', 'excited', 'love how'
    ];

    const lowerText = text.toLowerCase();
    return sarcasmIndicators.some(indicator => lowerText.includes(indicator));
  }

  extractWrestlerMentions(text: string, wrestlerNames: string[]): string[] {
    const mentions: string[] = [];
    const lowerText = text.toLowerCase();

    wrestlerNames.forEach(name => {
      if (lowerText.includes(name.toLowerCase())) {
        mentions.push(name);
      }
    });

    return mentions;
  }
}

export const enhancedSentimentService = new EnhancedSentimentService();
