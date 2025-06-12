
import type { Wrestler, NewsItem, WrestlerAnalysis } from '@/types/wrestlerAnalysis';
import { isWrestlerMentioned } from './analysis/wrestlerNameMatcher';
import { calculateWrestlerMetrics, calculateSentimentScores } from './analysis/wrestlerScoring';
import { preprocessNewsContent } from './analysis/newsProcessor';

export const performWrestlerAnalysis = (
  wrestlers: Wrestler[],
  newsItems: NewsItem[],
  minWrestlers: number = 10
): WrestlerAnalysis[] => {
  if (!wrestlers.length || !newsItems.length) {
    console.log('No wrestlers or news data available for analysis');
    return [];
  }
  
  console.log('Starting enhanced wrestler analysis for', wrestlers.length, 'wrestlers with', newsItems.length, 'news items');
  
  // Pre-process all news content
  const allContent = preprocessNewsContent(newsItems);
  
  const wrestlerMentions = new Map<string, WrestlerAnalysis>();
  
  // Process each wrestler
  wrestlers.forEach(wrestler => {
    const wrestlerName = wrestler.name;
    let mentions = 0;
    let totalSentiment = 0;
    let pushScore = 0;
    let burialScore = 0;
    const relatedNews: NewsItem[] = [];
    
    console.log(`\n--- Analyzing wrestler: ${wrestlerName} ---`);
    
    allContent.forEach(({ content, item, sentiment }) => {
      if (isWrestlerMentioned(wrestlerName, content)) {
        mentions++;
        totalSentiment += sentiment.score;
        relatedNews.push(item);
        
        console.log(`✓ MATCH FOUND for ${wrestlerName} in: "${item.title}"`);
        
        const scores = calculateSentimentScores(content, sentiment);
        pushScore += scores.pushScore;
        burialScore += scores.burialScore;
      }
    });
    
    // Only include wrestlers with actual mentions
    if (mentions > 0) {
      const analysis = calculateWrestlerMetrics(
        wrestlerName,
        wrestler.id,
        relatedNews,
        totalSentiment,
        mentions,
        pushScore,
        burialScore,
        wrestler
      );
      
      // Use wrestler name as key to prevent duplicates by name
      const existingEntry = Array.from(wrestlerMentions.values()).find(w => w.wrestler_name === analysis.wrestler_name);
      if (existingEntry) {
        // Merge mentions if wrestler already exists
        existingEntry.totalMentions += analysis.totalMentions;
        existingEntry.relatedNews.push(...analysis.relatedNews);
        existingEntry.sentimentScore = Math.round((existingEntry.sentimentScore + analysis.sentimentScore) / 2);
        existingEntry.momentumScore += analysis.momentumScore;
        console.log(`🔄 MERGED duplicate wrestler: ${wrestlerName}`);
      } else {
        wrestlerMentions.set(wrestler.id, analysis);
        console.log(`✅ ${wrestler.name}: ${mentions} mentions, Trend: ${analysis.trend}, Sentiment: ${(totalSentiment / mentions).toFixed(2)}`);
      }
    } else {
      console.log(`❌ ${wrestler.name}: No mentions found`);
    }
  });
  
  const analysis = Array.from(wrestlerMentions.values());
  
  // Sort by total mentions first, then by momentum score
  analysis.sort((a, b) => {
    if (b.totalMentions !== a.totalMentions) {
      return b.totalMentions - a.totalMentions;
    }
    return b.momentumScore - a.momentumScore;
  });
  
  console.log('\n=== FINAL ANALYSIS RESULTS ===');
  console.log('Wrestlers with mentions found:', analysis.length);
  analysis.forEach((wrestler, index) => {
    console.log(`${index + 1}. ${wrestler.wrestler_name}: ${wrestler.totalMentions} mentions`);
  });
  
  // Return top wrestlers, ensuring we get at least the minimum requested
  return analysis.slice(0, Math.max(minWrestlers, 15));
};
