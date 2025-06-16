
import { NewsItem } from '@/services/data/dataTypes';
import { WrestlerAnalysis } from '@/types/wrestlerAnalysis';
import { analyzeWrestlerForMentions } from './mentionAnalyzer';
import { storeWrestlerMentions, storeWrestlerMetrics, getStoredWrestlerMetrics } from './databaseOperations';

export const analyzeWrestlerMentions = async (
  wrestlers: any[],
  newsItems: NewsItem[]
): Promise<WrestlerAnalysis[]> => {
  console.log('🚀 Starting enhanced wrestler analysis...', {
    wrestlersCount: wrestlers.length,
    newsItemsCount: newsItems.length
  });

  if (wrestlers.length === 0 || newsItems.length === 0) {
    console.log('⚠️ No wrestlers or news items provided');
    return [];
  }

  // Debug: Show sample news items with more detail
  console.log('📰 Sample news items for matching:', newsItems.slice(0, 5).map((item, index) => ({
    index: index + 1,
    title: item.title,
    snippet: item.contentSnippet?.substring(0, 150) + '...',
    source: item.source,
    link: item.link || 'No link'
  })));

  // Debug: Show sample wrestler names
  console.log('👥 Sample wrestler names to match:', wrestlers.slice(0, 10).map(w => w.name));

  const analyses: WrestlerAnalysis[] = [];
  const mentionsToStore: any[] = [];
  let totalProcessed = 0;
  let totalWithMentions = 0;

  for (const wrestler of wrestlers) {
    totalProcessed++;
    console.log(`\n🔍 [${totalProcessed}/${wrestlers.length}] Processing wrestler...`);
    
    const { analysis, mentions } = analyzeWrestlerForMentions(wrestler, newsItems);
    
    if (analysis) {
      analyses.push(analysis);
      mentionsToStore.push(...mentions);
      totalWithMentions++;
    }
  }

  console.log(`\n✅ Analysis Summary:`, {
    totalProcessed,
    totalWithMentions,
    analysesGenerated: analyses.length,
    mentionsToStore: mentionsToStore.length,
    topWrestlers: analyses.slice(0, 5).map(a => ({ 
      name: a.wrestler_name, 
      mentions: a.totalMentions, 
      push: a.pushScore 
    }))
  });

  // Store data in database
  await storeWrestlerMentions(mentionsToStore);
  await storeWrestlerMetrics(analyses);

  console.log(`🏁 Enhanced wrestler analysis completed with ${analyses.length} wrestlers found with mentions`);

  return analyses.sort((a, b) => b.totalMentions - a.totalMentions);
};

// Re-export database functions
export { getStoredWrestlerMetrics } from './databaseOperations';
