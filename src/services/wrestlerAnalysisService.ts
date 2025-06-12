
import { analyzeSentiment } from '@/services/wrestlingDataService';
import type { Wrestler, NewsItem, WrestlerAnalysis } from '@/types/wrestlerAnalysis';

interface ProcessedNewsContent {
  content: string;
  item: NewsItem;
  sentiment: { score: number };
}

// More aggressive wrestler name matching function
const isWrestlerMentioned = (wrestlerName: string, content: string): boolean => {
  const normalizedWrestlerName = wrestlerName.toLowerCase().trim();
  const normalizedContent = content.toLowerCase();
  
  console.log(`Checking if "${wrestlerName}" is mentioned in content snippet: "${content.substring(0, 100)}..."`);
  
  // Split wrestler name into parts
  const nameParts = normalizedWrestlerName.split(' ').filter(part => part.length > 0);
  
  // For single names, require exact match with word boundaries
  if (nameParts.length === 1) {
    const singleName = nameParts[0];
    if (singleName.length > 3) {
      const regex = new RegExp(`\\b${singleName}\\b`, 'i');
      const found = regex.test(normalizedContent);
      if (found) console.log(`✓ Found single name match: ${singleName}`);
      return found;
    }
    return false;
  }
  
  // For multi-part names, use multiple strategies
  if (nameParts.length >= 2) {
    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];
    
    // Strategy 1: Exact full name match (highest priority)
    const fullNameRegex = new RegExp(`\\b${normalizedWrestlerName.replace(/\s+/g, '\\s+')}\\b`, 'i');
    if (fullNameRegex.test(normalizedContent)) {
      console.log(`✓ Found exact full name match: ${normalizedWrestlerName}`);
      return true;
    }
    
    // Strategy 2: "First Last" pattern
    const firstLastRegex = new RegExp(`\\b${firstName}\\s+${lastName}\\b`, 'i');
    if (firstLastRegex.test(normalizedContent)) {
      console.log(`✓ Found first-last match: ${firstName} ${lastName}`);
      return true;
    }
    
    // Strategy 3: Check for distinctive last names only (relaxed matching)
    const distinctiveLastNames = ['reigns', 'mysterio', 'mcintyre', 'rollins', 'lesnar', 'undertaker', 'cena', 'punk', 'rhodes', 'owens', 'zayn', 'balor', 'styles', 'nakamura', 'jericho', 'moxley', 'omega', 'ospreay', 'gunther', 'ripley', 'belair', 'lynch', 'bayley', 'priest', 'sikoa', 'breakker'];
    
    if (distinctiveLastNames.includes(lastName) && lastName.length > 4) {
      const lastNameRegex = new RegExp(`\\b${lastName}\\b`, 'i');
      if (lastNameRegex.test(normalizedContent)) {
        console.log(`✓ Found distinctive last name match: ${lastName}`);
        return true;
      }
    }
    
    // Strategy 4: Both names appear within reasonable distance
    const firstNameRegex = new RegExp(`\\b${firstName}\\b`, 'i');
    const lastNameRegex = new RegExp(`\\b${lastName}\\b`, 'i');
    
    if (firstNameRegex.test(normalizedContent) && lastNameRegex.test(normalizedContent)) {
      const firstMatch = normalizedContent.match(firstNameRegex);
      const lastMatch = normalizedContent.match(lastNameRegex);
      
      if (firstMatch && lastMatch) {
        const firstIndex = normalizedContent.indexOf(firstMatch[0]);
        const lastIndex = normalizedContent.indexOf(lastMatch[0]);
        const distance = Math.abs(firstIndex - lastIndex);
        
        // Allow reasonable distance between names
        if (distance <= 100) {
          console.log(`✓ Found both names within distance: ${firstName} ${lastName} (distance: ${distance})`);
          return true;
        }
      }
    }
  }
  
  return false;
};

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
  const allContent: ProcessedNewsContent[] = newsItems.map(item => ({
    content: `${item.title} ${item.contentSnippet || ''}`.toLowerCase(),
    item: item,
    sentiment: analyzeSentiment(`${item.title} ${item.contentSnippet || ''}`)
  }));
  
  console.log('News items to analyze:');
  allContent.forEach((content, index) => {
    console.log(`${index + 1}. "${content.item.title}"`);
  });
  
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
        
        // Enhanced scoring for push/burial indicators
        if (sentiment.score > 0.6) {
          let multiplier = 1;
          if (content.includes('champion') || content.includes('title')) multiplier = 1.5;
          if (content.includes('main event')) multiplier = 1.3;
          if (content.includes('winner') || content.includes('victory')) multiplier = 1.2;
          pushScore += (sentiment.score - 0.5) * 2 * multiplier;
        }
        
        if (sentiment.score < 0.4) {
          let multiplier = 1;
          if (content.includes('fired') || content.includes('released')) multiplier = 2;
          if (content.includes('buried') || content.includes('jobber')) multiplier = 1.8;
          if (content.includes('lose') || content.includes('defeat')) multiplier = 1.3;
          burialScore += (0.5 - sentiment.score) * 2 * multiplier;
        }
      }
    });
    
    // Only include wrestlers with actual mentions
    if (mentions > 0) {
      const pushPercentage = Math.min((pushScore / mentions) * 100, 100);
      const burialPercentage = Math.min((burialScore / mentions) * 100, 100);
      const avgSentiment = totalSentiment / mentions;
      
      let trend: 'push' | 'burial' | 'stable' = 'stable';
      if (mentions >= 1) {
        if (pushPercentage > burialPercentage && (pushPercentage > 2 || avgSentiment > 0.55)) {
          trend = 'push';
        } else if (burialPercentage > pushPercentage && (burialPercentage > 2 || avgSentiment < 0.45)) {
          trend = 'burial';
        }
      }
      
      const momentumScore = mentions * (avgSentiment * 2) + (pushPercentage - burialPercentage);
      const isOnFire = mentions >= 2 && avgSentiment > 0.6 && pushPercentage > 15;
      const popularityScore = Math.round(mentions * 10 + (avgSentiment * 50));
      const change24h = trend === 'push' ? Math.round(pushPercentage / 2) : 
                       trend === 'burial' ? -Math.round(burialPercentage / 2) : 
                       Math.round((Math.random() - 0.5) * 10);
      
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
        popularityScore,
        change24h,
        relatedNews: relatedNews.slice(0, 10).map(news => ({
          title: news.title,
          link: news.link || '#',
          source: news.source || 'Unknown',
          pubDate: news.pubDate
        }))
      });
      
      console.log(`✅ ${wrestler.name}: ${mentions} mentions, Trend: ${trend}, Sentiment: ${avgSentiment.toFixed(2)}`);
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
  
  // Return only wrestlers with actual mentions (no fallback data)
  return analysis;
};
