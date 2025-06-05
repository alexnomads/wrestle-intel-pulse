
import { useMemo } from 'react';
import { analyzeSentiment, extractWrestlerMentions } from '@/services/wrestlingDataService';

interface NewsItem {
  title: string;
  contentSnippet: string;
  pubDate: string;
}

interface Wrestler {
  id: string;
  name: string;
  brand?: string;
  promotion_id?: string;
  is_champion?: boolean;
  championship_title?: string;
}

export interface WrestlerAnalysis {
  id: string;
  wrestler_name: string;
  promotion: string;
  pushScore: number;
  burialScore: number;
  trend: 'push' | 'burial' | 'stable';
  totalMentions: number;
  sentimentScore: number;
  isChampion: boolean;
  championshipTitle: string | null;
  evidence: string;
  isOnFire: boolean; // New field to highlight hot wrestlers
  momentumScore: number; // Combined score for sorting
}

export const useWrestlerAnalysis = (
  wrestlers: Wrestler[], 
  newsItems: NewsItem[], 
  selectedTimePeriod: string,
  selectedPromotion: string
) => {
  const filteredWrestlers = useMemo(() => {
    return selectedPromotion === 'all' 
      ? wrestlers 
      : wrestlers.filter(wrestler => 
          wrestler.brand?.toLowerCase().includes(selectedPromotion.toLowerCase()) ||
          (wrestler.promotion_id && wrestlers.find(w => w.promotion_id === wrestler.promotion_id))
        );
  }, [wrestlers, selectedPromotion]);

  const periodNewsItems = useMemo(() => {
    const periodDays = parseInt(selectedTimePeriod);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - periodDays);
    
    return newsItems.filter(item => {
      const itemDate = new Date(item.pubDate);
      return itemDate >= cutoffDate;
    });
  }, [newsItems, selectedTimePeriod]);

  const pushBurialAnalysis = useMemo(() => {
    if (!wrestlers.length) return [];
    
    return wrestlers.map(wrestler => {
      const wrestlerNews = periodNewsItems.filter(item => 
        extractWrestlerMentions(`${item.title} ${item.contentSnippet}`).includes(wrestler.name)
      );
      
      let pushScore = 0;
      let burialScore = 0;
      let totalMentions = wrestlerNews.length;
      let totalSentiment = 0;
      
      wrestlerNews.forEach(item => {
        const sentiment = analyzeSentiment(`${item.title} ${item.contentSnippet}`);
        totalSentiment += sentiment.score;
        
        if (sentiment.score > 0.6) {
          pushScore += (sentiment.score - 0.5) * 2;
        } else if (sentiment.score < 0.4) {
          burialScore += (0.5 - sentiment.score) * 2;
        }
      });

      const pushPercentage = totalMentions > 0 ? (pushScore / totalMentions) * 100 : 0;
      const burialPercentage = totalMentions > 0 ? (burialScore / totalMentions) * 100 : 0;
      const avgSentiment = totalMentions > 0 ? totalSentiment / totalMentions : 0.5;
      
      let trend: 'push' | 'burial' | 'stable' = 'stable';
      if (pushPercentage > burialPercentage && pushPercentage > 30) {
        trend = 'push';
      } else if (burialPercentage > pushPercentage && burialPercentage > 30) {
        trend = 'burial';
      }

      // Calculate momentum score (combination of mentions, sentiment, and trend strength)
      const momentumScore = totalMentions * (avgSentiment * 2) + (pushPercentage - burialPercentage);
      
      // Determine if wrestler is "on fire" (high mentions + positive sentiment + strong trend)
      const isOnFire = totalMentions >= 5 && avgSentiment > 0.7 && pushPercentage > 50;

      return {
        id: wrestler.id,
        wrestler_name: wrestler.name,
        promotion: wrestler.brand || 'Unknown',
        pushScore: Math.min(pushPercentage, 100),
        burialScore: Math.min(burialPercentage, 100),
        trend,
        totalMentions,
        sentimentScore: Math.round(avgSentiment * 100),
        isChampion: wrestler.is_champion || false,
        championshipTitle: wrestler.championship_title || null,
        evidence: totalMentions > 10 ? 'High Media Coverage' :
                 totalMentions > 5 ? 'Moderate Coverage' :
                 totalMentions > 0 ? 'Limited Coverage' : 'No Recent Coverage',
        isOnFire,
        momentumScore
      };
    });
  }, [wrestlers, periodNewsItems]);

  const filteredAnalysis = useMemo(() => {
    return selectedPromotion === 'all'
      ? pushBurialAnalysis
      : pushBurialAnalysis.filter(wrestler => 
          wrestler.promotion.toLowerCase().includes(selectedPromotion.toLowerCase())
        );
  }, [pushBurialAnalysis, selectedPromotion]);

  const topPushWrestlers = useMemo(() => {
    return filteredAnalysis
      .filter(wrestler => wrestler.trend === 'push' && wrestler.totalMentions > 0)
      .sort((a, b) => {
        // Primary sort: mentions (most mentioned first)
        if (b.totalMentions !== a.totalMentions) {
          return b.totalMentions - a.totalMentions;
        }
        // Secondary sort: momentum score for tie-breaking
        return b.momentumScore - a.momentumScore;
      })
      .slice(0, 10);
  }, [filteredAnalysis]);

  const worstBuriedWrestlers = useMemo(() => {
    return filteredAnalysis
      .filter(wrestler => wrestler.trend === 'burial' && wrestler.totalMentions > 0)
      .sort((a, b) => {
        // Primary sort: mentions (most mentioned first - most talked about negative)
        if (b.totalMentions !== a.totalMentions) {
          return b.totalMentions - a.totalMentions;
        }
        // Secondary sort: burial score for tie-breaking
        return b.burialScore - a.burialScore;
      })
      .slice(0, 10);
  }, [filteredAnalysis]);

  return {
    filteredWrestlers,
    periodNewsItems,
    pushBurialAnalysis,
    filteredAnalysis,
    topPushWrestlers,
    worstBuriedWrestlers
  };
};
