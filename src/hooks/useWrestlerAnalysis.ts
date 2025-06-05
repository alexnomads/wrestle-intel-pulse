
import { useMemo } from 'react';
import { analyzeSentiment, extractWrestlerMentions } from '@/services/wrestlingDataService';

interface NewsItem {
  title: string;
  contentSnippet: string;
  pubDate: string;
  link?: string;
  source?: string;
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
  relatedNews: Array<{
    title: string;
    link: string;
    source: string;
    pubDate: string;
  }>;
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
    
    console.log('Starting optimized push/burial analysis for', wrestlers.length, 'wrestlers');
    
    // Pre-process all news content for faster analysis
    const allContent = periodNewsItems.map(item => ({
      content: `${item.title} ${item.contentSnippet}`.toLowerCase(),
      item: item,
      sentiment: analyzeSentiment(`${item.title} ${item.contentSnippet}`)
    }));
    
    console.log('Pre-processed', allContent.length, 'news items');
    
    // Focus on a subset of popular wrestlers for faster processing
    const popularWrestlers = wrestlers.filter(wrestler => {
      const name = wrestler.name.toLowerCase();
      // Filter for main roster wrestlers and exclude non-wrestlers
      return !name.includes('referee') && 
             !name.includes('announcer') && 
             !name.includes('commentator') &&
             !name.includes('road agent') &&
             !name.includes('music group') &&
             wrestler.name.length > 3;
    });
    
    console.log('Analyzing', popularWrestlers.length, 'filtered wrestlers');
    
    const wrestlerMentions = new Map<string, any>();
    
    // Batch process wrestler mentions
    popularWrestlers.forEach(wrestler => {
      const wrestlerName = wrestler.name.toLowerCase();
      let mentions = 0;
      let totalSentiment = 0;
      let pushScore = 0;
      let burialScore = 0;
      const relatedNews: NewsItem[] = [];
      
      allContent.forEach(({ content, item, sentiment }) => {
        // Simple but effective name matching
        if (content.includes(wrestlerName) || 
            (wrestlerName.includes(' ') && wrestlerName.split(' ').some(part => 
              part.length > 3 && content.includes(part)))) {
          
          mentions++;
          totalSentiment += sentiment.score;
          relatedNews.push(item);
          
          // Enhanced scoring for push indicators
          if (sentiment.score > 0.6) {
            let multiplier = 1;
            if (content.includes('champion') || content.includes('title')) multiplier = 1.5;
            if (content.includes('main event')) multiplier = 1.3;
            if (content.includes('winner') || content.includes('victory')) multiplier = 1.2;
            pushScore += (sentiment.score - 0.5) * 2 * multiplier;
          }
          
          // Enhanced scoring for burial indicators
          if (sentiment.score < 0.4) {
            let multiplier = 1;
            if (content.includes('fired') || content.includes('released')) multiplier = 2;
            if (content.includes('buried') || content.includes('jobber')) multiplier = 1.8;
            if (content.includes('lose') || content.includes('defeat')) multiplier = 1.3;
            if (content.includes('injury') || content.includes('suspended')) multiplier = 1.5;
            burialScore += (0.5 - sentiment.score) * 2 * multiplier;
          }
        }
      });
      
      if (mentions > 0) {
        const pushPercentage = Math.min((pushScore / mentions) * 100, 100);
        const burialPercentage = Math.min((burialScore / mentions) * 100, 100);
        const avgSentiment = totalSentiment / mentions;
        
        let trend: 'push' | 'burial' | 'stable' = 'stable';
        if (mentions >= 1) {
          // More sensitive trending detection
          if (pushPercentage > burialPercentage && (pushPercentage > 5 || avgSentiment > 0.6)) {
            trend = 'push';
          } else if (burialPercentage > pushPercentage && (burialPercentage > 5 || avgSentiment < 0.4)) {
            trend = 'burial';
          }
        }
        
        const momentumScore = mentions * (avgSentiment * 2) + (pushPercentage - burialPercentage);
        const isOnFire = mentions >= 2 && avgSentiment > 0.65 && pushPercentage > 25;
        
        wrestlerMentions.set(wrestler.id, {
          id: wrestler.id,
          wrestler_name: wrestler.name,
          promotion: wrestler.brand || 'Unknown',
          pushScore: pushPercentage,
          burialScore: burialPercentage,
          trend,
          totalMentions: mentions,
          sentimentScore: Math.round(avgSentiment * 100),
          isChampion: wrestler.is_champion || false,
          championshipTitle: wrestler.championship_title || null,
          evidence: mentions > 5 ? 'High Media Coverage' :
                   mentions > 2 ? 'Moderate Coverage' : 'Limited Coverage',
          isOnFire,
          momentumScore,
          relatedNews: relatedNews.slice(0, 10).map(news => ({
            title: news.title,
            link: news.link || '#',
            source: news.source || 'Unknown',
            pubDate: news.pubDate
          }))
        });
        
        console.log(`Wrestler: ${wrestler.name}, Mentions: ${mentions}, Trend: ${trend}, Push: ${pushPercentage.toFixed(1)}%, Burial: ${burialPercentage.toFixed(1)}%, Sentiment: ${avgSentiment.toFixed(2)}`);
      }
    });
    
    const analysis = Array.from(wrestlerMentions.values());
    
    console.log('Analysis complete:', {
      totalAnalyzed: popularWrestlers.length,
      withMentions: analysis.length,
      pushTrend: analysis.filter(a => a.trend === 'push').length,
      burialTrend: analysis.filter(a => a.trend === 'burial').length
    });
    
    return analysis;
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
