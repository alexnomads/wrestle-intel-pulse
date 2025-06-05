
import { NewsItem, RedditPost } from '../wrestlingDataService';

export interface WrestlerMomentum {
  wrestler_name: string;
  push_burial_score: number;
  mentions_count: number;
  sentiment_trend: 'positive' | 'negative' | 'neutral';
  momentum_change: number;
  recent_storylines: string[];
  contract_status: 'active' | 'expiring' | 'negotiating' | 'unknown';
}

// Calculate wrestler momentum and push/burial scores
export const calculateWrestlerMomentum = async (
  newsArticles: NewsItem[],
  redditPosts: RedditPost[]
): Promise<WrestlerMomentum[]> => {
  const wrestlerStats: Map<string, WrestlerMomentum> = new Map();
  
  // Common wrestler names to track
  const wrestlerNames = [
    'CM Punk', 'Roman Reigns', 'Cody Rhodes', 'Seth Rollins', 'Drew McIntyre',
    'Jon Moxley', 'Kenny Omega', 'Will Ospreay', 'Rhea Ripley', 'Bianca Belair',
    'Becky Lynch', 'Mercedes Moné', 'Jade Cargill', 'Toni Storm', 'Gunther',
    'Damian Priest', 'LA Knight', 'Jey Uso', 'Jimmy Uso', 'Trick Williams'
  ];

  // Initialize stats for each wrestler
  wrestlerNames.forEach(name => {
    wrestlerStats.set(name, {
      wrestler_name: name,
      push_burial_score: 5.0, // Neutral starting point
      mentions_count: 0,
      sentiment_trend: 'neutral',
      momentum_change: 0,
      recent_storylines: [],
      contract_status: 'unknown'
    });
  });

  // Analyze news articles
  newsArticles.forEach(article => {
    const content = `${article.title} ${article.contentSnippet || ''}`.toLowerCase();
    
    wrestlerNames.forEach(wrestler => {
      if (content.includes(wrestler.toLowerCase())) {
        const stats = wrestlerStats.get(wrestler)!;
        stats.mentions_count++;

        // Calculate push/burial indicators
        let pushScore = 0;
        
        // Positive indicators
        if (content.includes('champion') || content.includes('title')) pushScore += 2;
        if (content.includes('main event') || content.includes('headline')) pushScore += 1.5;
        if (content.includes('win') || content.includes('victory')) pushScore += 1;
        if (content.includes('return') || content.includes('comeback')) pushScore += 1.5;
        if (content.includes('push') || content.includes('elevated')) pushScore += 2;
        
        // Negative indicators
        if (content.includes('lose') || content.includes('loss') || content.includes('defeat')) pushScore -= 1;
        if (content.includes('injury') || content.includes('injured')) pushScore -= 1.5;
        if (content.includes('buried') || content.includes('jobber')) pushScore -= 2;
        if (content.includes('release') || content.includes('fired')) pushScore -= 3;
        if (content.includes('suspended') || content.includes('disciplinary')) pushScore -= 2;

        // Update push/burial score (weighted average)
        stats.push_burial_score = (stats.push_burial_score + pushScore + 5) / 2;
        stats.push_burial_score = Math.max(0, Math.min(10, stats.push_burial_score));

        // Detect storylines
        if (content.includes('storyline') || content.includes('feud') || content.includes('vs')) {
          const storylineMatch = content.match(new RegExp(`${wrestler.toLowerCase()}[^.]*?(vs|versus|feud|storyline)[^.]*`, 'i'));
          if (storylineMatch && !stats.recent_storylines.includes(storylineMatch[0])) {
            stats.recent_storylines.push(storylineMatch[0].substring(0, 100));
          }
        }

        // Contract status detection
        if (content.includes('contract') || content.includes('signing') || content.includes('deal')) {
          if (content.includes('new') || content.includes('signed')) stats.contract_status = 'active';
          else if (content.includes('expires') || content.includes('expiring')) stats.contract_status = 'expiring';
          else if (content.includes('negotiate') || content.includes('talks')) stats.contract_status = 'negotiating';
        }
      }
    });
  });

  // Analyze Reddit posts for additional sentiment
  redditPosts.forEach(post => {
    const content = `${post.title} ${post.selftext}`.toLowerCase();
    
    wrestlerNames.forEach(wrestler => {
      if (content.includes(wrestler.toLowerCase())) {
        const stats = wrestlerStats.get(wrestler)!;
        stats.mentions_count++;

        // Reddit engagement as momentum indicator
        const engagementScore = (post.score / 100) + (post.num_comments / 50);
        stats.momentum_change += Math.min(engagementScore, 5);
      }
    });
  });

  // Determine sentiment trends and momentum changes
  wrestlerStats.forEach(stats => {
    if (stats.push_burial_score > 6.5) stats.sentiment_trend = 'positive';
    else if (stats.push_burial_score < 4.5) stats.sentiment_trend = 'negative';
    else stats.sentiment_trend = 'neutral';

    // Normalize momentum change
    stats.momentum_change = Math.max(-50, Math.min(50, stats.momentum_change));
    
    // Limit recent storylines
    stats.recent_storylines = stats.recent_storylines.slice(0, 3);
  });

  return Array.from(wrestlerStats.values())
    .filter(stats => stats.mentions_count > 0)
    .sort((a, b) => b.mentions_count - a.mentions_count);
};
