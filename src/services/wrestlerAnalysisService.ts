
import { analyzeSentiment } from '@/services/wrestlingDataService';
import type { Wrestler, NewsItem, WrestlerAnalysis } from '@/types/wrestlerAnalysis';

interface ProcessedNewsContent {
  content: string;
  item: NewsItem;
  sentiment: { score: number };
}

// Improved wrestler name matching function - balanced precision
const isWrestlerMentioned = (wrestlerName: string, content: string): boolean => {
  const normalizedWrestlerName = wrestlerName.toLowerCase().trim();
  const normalizedContent = content.toLowerCase();
  
  // Split wrestler name into parts
  const nameParts = normalizedWrestlerName.split(' ').filter(part => part.length > 0);
  
  // For single names (rare), require exact match with word boundaries
  if (nameParts.length === 1) {
    const singleName = nameParts[0];
    // Only match if it's a distinctive name (more than 3 characters) and appears as a whole word
    if (singleName.length > 3) {
      const regex = new RegExp(`\\b${singleName}\\b`, 'i');
      return regex.test(normalizedContent);
    }
    return false;
  }
  
  // For multi-part names, use a more flexible approach
  if (nameParts.length >= 2) {
    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];
    
    // Check for exact full name match first (highest priority)
    const fullNameRegex = new RegExp(`\\b${normalizedWrestlerName.replace(/\s+/g, '\\s+')}\\b`, 'i');
    if (fullNameRegex.test(normalizedContent)) {
      return true;
    }
    
    // Check for "First Last" pattern (most common)
    const firstLastRegex = new RegExp(`\\b${firstName}\\s+${lastName}\\b`, 'i');
    if (firstLastRegex.test(normalizedContent)) {
      return true;
    }
    
    // For unique combinations, check if both names appear (with more distance allowed)
    const firstNameRegex = new RegExp(`\\b${firstName}\\b`, 'i');
    const lastNameRegex = new RegExp(`\\b${lastName}\\b`, 'i');
    
    const hasFirstName = firstNameRegex.test(normalizedContent);
    const hasLastName = lastNameRegex.test(normalizedContent);
    
    if (hasFirstName && hasLastName) {
      // Check if this is a unique enough combination to avoid false positives
      // Common first names that need stricter matching
      const commonFirstNames = ['adam', 'john', 'mike', 'chris', 'kevin', 'matt', 'mark', 'steve', 'daniel', 'bryan'];
      
      if (commonFirstNames.includes(firstName)) {
        // For common first names, require closer proximity (within 50 characters)
        const firstNameMatch = normalizedContent.match(firstNameRegex);
        const lastNameMatch = normalizedContent.match(lastNameRegex);
        
        if (firstNameMatch && lastNameMatch) {
          const firstNameIndex = normalizedContent.indexOf(firstNameMatch[0]);
          const lastNameIndex = normalizedContent.indexOf(lastNameMatch[0]);
          const distance = Math.abs(firstNameIndex - lastNameIndex);
          
          return distance <= 50;
        }
      } else {
        // For unique first names, allow more distance (within 150 characters)
        const firstNameMatch = normalizedContent.match(firstNameRegex);
        const lastNameMatch = normalizedContent.match(lastNameRegex);
        
        if (firstNameMatch && lastNameMatch) {
          const firstNameIndex = normalizedContent.indexOf(firstNameMatch[0]);
          const lastNameIndex = normalizedContent.indexOf(lastNameMatch[0]);
          const distance = Math.abs(firstNameIndex - lastNameIndex);
          
          return distance <= 150;
        }
      }
    }
    
    // Check for common wrestling name patterns
    // "Lastname" only for distinctive surnames
    if (lastName.length > 5 && !['johnson', 'williams', 'brown', 'jones', 'garcia', 'miller', 'davis'].includes(lastName)) {
      const lastNameOnlyRegex = new RegExp(`\\b${lastName}\\b`, 'i');
      if (lastNameOnlyRegex.test(normalizedContent)) {
        return true;
      }
    }
  }
  
  return false;
};

export const performWrestlerAnalysis = (
  wrestlers: Wrestler[],
  newsItems: NewsItem[]
): WrestlerAnalysis[] => {
  if (!wrestlers.length || !newsItems.length) {
    console.log('No wrestlers or news data available for analysis');
    return [];
  }
  
  console.log('Starting balanced push/burial analysis for', wrestlers.length, 'wrestlers with', newsItems.length, 'news items');
  
  // Pre-process all news content for faster analysis
  const allContent: ProcessedNewsContent[] = newsItems.map(item => ({
    content: `${item.title} ${item.contentSnippet}`.toLowerCase(),
    item: item,
    sentiment: analyzeSentiment(`${item.title} ${item.contentSnippet}`)
  }));
  
  console.log('Pre-processed', allContent.length, 'news items for analysis');
  
  const wrestlerMentions = new Map<string, WrestlerAnalysis>();
  
  // Batch process wrestler mentions with balanced matching
  wrestlers.forEach(wrestler => {
    const wrestlerName = wrestler.name;
    let mentions = 0;
    let totalSentiment = 0;
    let pushScore = 0;
    let burialScore = 0;
    const relatedNews: NewsItem[] = [];
    
    console.log(`Analyzing mentions for: ${wrestlerName}`);
    
    allContent.forEach(({ content, item, sentiment }) => {
      // Use balanced name matching
      if (isWrestlerMentioned(wrestlerName, content)) {
        mentions++;
        totalSentiment += sentiment.score;
        relatedNews.push(item);
        
        console.log(`✓ Found mention of ${wrestlerName} in: "${item.title.substring(0, 50)}..."`);
        
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
        if (pushPercentage > burialPercentage && (pushPercentage > 3 || avgSentiment > 0.55)) {
          trend = 'push';
        } else if (burialPercentage > pushPercentage && (burialPercentage > 3 || avgSentiment < 0.45)) {
          trend = 'burial';
        }
      }
      
      const momentumScore = mentions * (avgSentiment * 2) + (pushPercentage - burialPercentage);
      const isOnFire = mentions >= 2 && avgSentiment > 0.6 && pushPercentage > 20;
      
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
      
      console.log(`✓ ${wrestler.name}: ${mentions} mentions, Trend: ${trend}, Push: ${pushPercentage.toFixed(1)}%, Burial: ${burialPercentage.toFixed(1)}%, Sentiment: ${avgSentiment.toFixed(2)}`);
    } else {
      console.log(`✗ ${wrestler.name}: No mentions found`);
    }
  });
  
  const analysis = Array.from(wrestlerMentions.values());
  
  console.log('Balanced analysis complete:', {
    totalAnalyzed: wrestlers.length,
    withMentions: analysis.length,
    pushTrend: analysis.filter(a => a.trend === 'push').length,
    burialTrend: analysis.filter(a => a.trend === 'burial').length
  });
  
  return analysis;
};
