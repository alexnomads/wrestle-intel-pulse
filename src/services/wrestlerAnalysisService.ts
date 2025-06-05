
import { analyzeSentiment } from '@/services/wrestlingDataService';
import type { Wrestler, NewsItem, WrestlerAnalysis } from '@/types/wrestlerAnalysis';

interface ProcessedNewsContent {
  content: string;
  item: NewsItem;
  sentiment: { score: number };
}

export const performWrestlerAnalysis = (
  wrestlers: Wrestler[],
  newsItems: NewsItem[]
): WrestlerAnalysis[] => {
  if (!wrestlers.length || !newsItems.length) {
    console.log('No wrestlers or news data available for analysis');
    return [];
  }
  
  console.log('Starting optimized push/burial analysis for', wrestlers.length, 'wrestlers');
  
  // Pre-process all news content for faster analysis
  const allContent: ProcessedNewsContent[] = newsItems.map(item => ({
    content: `${item.title} ${item.contentSnippet}`.toLowerCase(),
    item: item,
    sentiment: analyzeSentiment(`${item.title} ${item.contentSnippet}`)
  }));
  
  console.log('Pre-processed', allContent.length, 'news items');
  
  const wrestlerMentions = new Map<string, WrestlerAnalysis>();
  
  // Batch process wrestler mentions
  wrestlers.forEach(wrestler => {
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
    totalAnalyzed: wrestlers.length,
    withMentions: analysis.length,
    pushTrend: analysis.filter(a => a.trend === 'push').length,
    burialTrend: analysis.filter(a => a.trend === 'burial').length
  });
  
  return analysis;
};
