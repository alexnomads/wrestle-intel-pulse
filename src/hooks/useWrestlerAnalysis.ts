
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
  isOnFire: boolean;
  momentumScore: number;
}

export const useWrestlerAnalysis = (
  wrestlers: Wrestler[], 
  newsItems: NewsItem[], 
  selectedTimePeriod: string,
  selectedPromotion: string
) => {
  console.log('useWrestlerAnalysis - Input data:', {
    wrestlersCount: wrestlers.length,
    newsItemsCount: newsItems.length,
    selectedTimePeriod,
    selectedPromotion
  });

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
    
    const filtered = newsItems.filter(item => {
      const itemDate = new Date(item.pubDate);
      return itemDate >= cutoffDate;
    });
    
    console.log('Filtered news items:', {
      total: newsItems.length,
      filtered: filtered.length,
      cutoffDate: cutoffDate.toISOString()
    });
    
    return filtered;
  }, [newsItems, selectedTimePeriod]);

  const pushBurialAnalysis = useMemo(() => {
    if (!wrestlers.length || !periodNewsItems.length) {
      console.log('No wrestlers or news data available for analysis');
      return [];
    }
    
    console.log('Generating enhanced push/burial analysis for', wrestlers.length, 'wrestlers');
    
    // First, extract all wrestler mentions from news to focus on those who are actually mentioned
    const allMentions = new Map<string, number>();
    const wrestlerNewsMap = new Map<string, NewsItem[]>();
    
    periodNewsItems.forEach(item => {
      const content = `${item.title} ${item.contentSnippet}`;
      const mentions = extractWrestlerMentions(content);
      
      mentions.forEach(mention => {
        // Normalize wrestler names for matching
        const normalizedMention = mention.toLowerCase().trim();
        
        // Find matching wrestler in our database
        const matchingWrestler = wrestlers.find(wrestler => {
          const normalizedWrestlerName = wrestler.name.toLowerCase().trim();
          return normalizedWrestlerName === normalizedMention ||
                 normalizedWrestlerName.includes(normalizedMention) ||
                 normalizedMention.includes(normalizedWrestlerName);
        });
        
        if (matchingWrestler) {
          const key = matchingWrestler.name;
          allMentions.set(key, (allMentions.get(key) || 0) + 1);
          
          if (!wrestlerNewsMap.has(key)) {
            wrestlerNewsMap.set(key, []);
          }
          wrestlerNewsMap.get(key)!.push(item);
        }
      });
    });
    
    console.log('Found mentions for', allMentions.size, 'wrestlers');
    
    const analysis = wrestlers.map(wrestler => {
      const wrestlerNews = wrestlerNewsMap.get(wrestler.name) || [];
      const totalMentions = allMentions.get(wrestler.name) || 0;
      
      let pushScore = 0;
      let burialScore = 0;
      let totalSentiment = 0;
      
      wrestlerNews.forEach(item => {
        const sentiment = analyzeSentiment(`${item.title} ${item.contentSnippet}`);
        totalSentiment += sentiment.score;
        
        // Enhanced scoring based on content context
        const content = `${item.title} ${item.contentSnippet}`.toLowerCase();
        
        // Push indicators
        if (sentiment.score > 0.6) {
          let pushMultiplier = 1;
          if (content.includes('champion') || content.includes('title')) pushMultiplier = 1.5;
          if (content.includes('main event') || content.includes('headlin')) pushMultiplier = 1.3;
          if (content.includes('return') || content.includes('debut')) pushMultiplier = 1.2;
          
          pushScore += (sentiment.score - 0.5) * 2 * pushMultiplier;
        }
        
        // Burial indicators
        if (sentiment.score < 0.4) {
          let burialMultiplier = 1;
          if (content.includes('fired') || content.includes('released')) burialMultiplier = 2;
          if (content.includes('buried') || content.includes('jobber')) burialMultiplier = 1.8;
          if (content.includes('squash') || content.includes('dominated')) burialMultiplier = 1.3;
          
          burialScore += (0.5 - sentiment.score) * 2 * burialMultiplier;
        }
      });

      const pushPercentage = totalMentions > 0 ? (pushScore / totalMentions) * 100 : 0;
      const burialPercentage = totalMentions > 0 ? (burialScore / totalMentions) * 100 : 0;
      const avgSentiment = totalMentions > 0 ? totalSentiment / totalMentions : 0.5;
      
      let trend: 'push' | 'burial' | 'stable' = 'stable';
      if (totalMentions >= 2) {
        if (pushPercentage > burialPercentage && pushPercentage > 15) {
          trend = 'push';
        } else if (burialPercentage > pushPercentage && burialPercentage > 15) {
          trend = 'burial';
        }
      }

      const momentumScore = totalMentions * (avgSentiment * 2) + (pushPercentage - burialPercentage);
      const isOnFire = totalMentions >= 3 && avgSentiment > 0.65 && pushPercentage > 30;

      const result = {
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
      
      if (totalMentions > 0) {
        console.log(`Wrestler: ${wrestler.name}, Mentions: ${totalMentions}, Trend: ${trend}, Sentiment: ${avgSentiment.toFixed(2)}`);
      }
      
      return result;
    });
    
    // Filter to only include wrestlers with mentions
    const analysisWithMentions = analysis.filter(a => a.totalMentions > 0);
    
    console.log('Analysis complete:', {
      totalAnalyzed: analysis.length,
      withMentions: analysisWithMentions.length,
      pushTrend: analysisWithMentions.filter(a => a.trend === 'push').length,
      burialTrend: analysisWithMentions.filter(a => a.trend === 'burial').length
    });
    
    return analysisWithMentions;
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
        if (b.totalMentions !== a.totalMentions) {
          return b.totalMentions - a.totalMentions;
        }
        return b.momentumScore - a.momentumScore;
      })
      .slice(0, 10);
  }, [filteredAnalysis]);

  const worstBuriedWrestlers = useMemo(() => {
    return filteredAnalysis
      .filter(wrestler => wrestler.trend === 'burial' && wrestler.totalMentions > 0)
      .sort((a, b) => {
        if (b.totalMentions !== a.totalMentions) {
          return b.totalMentions - a.totalMentions;
        }
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
