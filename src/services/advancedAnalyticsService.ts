
import { NewsItem, RedditPost } from './wrestlingDataService';
import { supabase } from '@/integrations/supabase/client';

export interface StorylineAnalysis {
  id: string;
  title: string;
  participants: string[];
  description: string;
  status: 'building' | 'climax' | 'cooling' | 'concluded';
  intensity_score: number;
  fan_reception_score: number;
  start_date: string;
  source_articles: NewsItem[];
  keywords: string[];
  promotion: string;
}

export interface WrestlerMomentum {
  wrestler_name: string;
  push_burial_score: number;
  mentions_count: number;
  sentiment_trend: 'positive' | 'negative' | 'neutral';
  momentum_change: number;
  recent_storylines: string[];
  contract_status: 'active' | 'expiring' | 'negotiating' | 'unknown';
}

export interface TrendingTopic {
  title: string;
  mentions: number;
  sentiment: number;
  growth_rate: number;
  keywords: string[];
  related_wrestlers: string[];
  time_period: string;
}

// Advanced storyline detection from news articles
export const detectStorylinesFromNews = async (newsArticles: NewsItem[]): Promise<StorylineAnalysis[]> => {
  const storylines: Map<string, StorylineAnalysis> = new Map();
  
  // Keywords that indicate storylines
  const storylineKeywords = [
    'feud', 'rivalry', 'vs', 'versus', 'challenge', 'confrontation',
    'championship', 'title', 'match', 'fight', 'attack', 'betrayal',
    'alliance', 'team', 'stable', 'storyline', 'angle', 'program'
  ];

  // Wrestling promotions
  const promotions = ['WWE', 'AEW', 'NXT', 'TNA', 'NJPW'];

  newsArticles.forEach(article => {
    const content = `${article.title} ${article.content || ''}`.toLowerCase();
    
    // Check if article contains storyline keywords
    const hasStorylineKeywords = storylineKeywords.some(keyword => 
      content.includes(keyword)
    );

    if (!hasStorylineKeywords) return;

    // Extract wrestler mentions (simplified - looking for common patterns)
    const wrestlerPattern = /([A-Z][a-z]+ [A-Z][a-z]+|CM Punk|LA Knight|Rey Mysterio)/g;
    const wrestlerMatches = content.match(wrestlerPattern) || [];
    const uniqueWrestlers = [...new Set(wrestlerMatches)].slice(0, 4);

    if (uniqueWrestlers.length < 2) return;

    // Determine promotion
    const promotion = promotions.find(p => 
      content.includes(p.toLowerCase())
    ) || 'Unknown';

    // Create storyline key based on participants
    const storylineKey = uniqueWrestlers.sort().join(' vs ');
    
    if (!storylines.has(storylineKey)) {
      // Calculate intensity based on keywords
      let intensity = 5.0;
      if (content.includes('attack') || content.includes('assault')) intensity += 2;
      if (content.includes('championship') || content.includes('title')) intensity += 1.5;
      if (content.includes('betrayal') || content.includes('heel turn')) intensity += 2.5;
      if (content.includes('return') || content.includes('debut')) intensity += 1;
      
      // Calculate fan reception from sentiment and engagement signals
      let fanReception = 6.0;
      if (content.includes('amazing') || content.includes('incredible')) fanReception += 2;
      if (content.includes('boring') || content.includes('disappointing')) fanReception -= 2;
      
      // Determine status based on keywords
      let status: 'building' | 'climax' | 'cooling' | 'concluded' = 'building';
      if (content.includes('match') && content.includes('result')) status = 'concluded';
      else if (content.includes('tonight') || content.includes('this week')) status = 'climax';
      else if (content.includes('announcement') || content.includes('upcoming')) status = 'building';

      storylines.set(storylineKey, {
        id: `storyline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: storylineKey,
        participants: uniqueWrestlers,
        description: `Ongoing storyline involving ${uniqueWrestlers.join(', ')} based on recent news coverage`,
        status,
        intensity_score: Math.min(intensity, 10),
        fan_reception_score: Math.min(Math.max(fanReception, 0), 10),
        start_date: article.published_at || new Date().toISOString(),
        source_articles: [article],
        keywords: storylineKeywords.filter(kw => content.includes(kw)),
        promotion
      });
    } else {
      // Update existing storyline
      const existing = storylines.get(storylineKey)!;
      existing.source_articles.push(article);
      
      // Update intensity based on additional coverage
      existing.intensity_score = Math.min(existing.intensity_score + 0.5, 10);
      
      // Update keywords
      const newKeywords = storylineKeywords.filter(kw => content.includes(kw));
      existing.keywords = [...new Set([...existing.keywords, ...newKeywords])];
    }
  });

  return Array.from(storylines.values())
    .sort((a, b) => b.intensity_score - a.intensity_score)
    .slice(0, 10);
};

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
    const content = `${article.title} ${article.content || ''}`.toLowerCase();
    
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

// Generate trending topics from combined data
export const generateTrendingTopics = async (
  newsArticles: NewsItem[],
  redditPosts: RedditPost[]
): Promise<TrendingTopic[]> => {
  const topicMap: Map<string, TrendingTopic> = new Map();
  
  // Define wrestling topic categories
  const topicCategories = [
    { keywords: ['championship', 'title', 'belt', 'champion'], title: 'Championship Scene' },
    { keywords: ['cm punk', 'punk'], title: 'CM Punk' },
    { keywords: ['roman reigns', 'tribal chief'], title: 'Roman Reigns' },
    { keywords: ['cody rhodes', 'american nightmare'], title: 'Cody Rhodes' },
    { keywords: ['wwe raw', 'monday night raw'], title: 'WWE Raw' },
    { keywords: ['aew dynamite', 'wednesday night'], title: 'AEW Dynamite' },
    { keywords: ['nxt', 'black and gold'], title: 'WWE NXT' },
    { keywords: ['injury', 'injured', 'hurt'], title: 'Injury Reports' },
    { keywords: ['debut', 'return', 'comeback'], title: 'Returns & Debuts' },
    { keywords: ['royal rumble', 'wrestlemania', 'summerslam'], title: 'WWE Premium Events' },
    { keywords: ['all out', 'revolution', 'double or nothing'], title: 'AEW Pay-Per-Views' },
    { keywords: ['rating', 'viewership', 'numbers'], title: 'TV Ratings' },
    { keywords: ['contract', 'signing', 'deal'], title: 'Contract News' }
  ];

  // Analyze news articles
  newsArticles.forEach(article => {
    const content = `${article.title} ${article.content || ''}`.toLowerCase();
    
    topicCategories.forEach(category => {
      const hasKeywords = category.keywords.some(keyword => 
        content.includes(keyword.toLowerCase())
      );
      
      if (hasKeywords) {
        if (!topicMap.has(category.title)) {
          topicMap.set(category.title, {
            title: category.title,
            mentions: 0,
            sentiment: 0.5,
            growth_rate: 0,
            keywords: category.keywords,
            related_wrestlers: [],
            time_period: 'last 7 days'
          });
        }
        
        const topic = topicMap.get(category.title)!;
        topic.mentions++;
        
        // Simple sentiment calculation
        let sentiment = 0.5;
        if (content.includes('amazing') || content.includes('great')) sentiment += 0.2;
        if (content.includes('terrible') || content.includes('boring')) sentiment -= 0.2;
        
        topic.sentiment = (topic.sentiment + sentiment) / 2;
        topic.growth_rate += 5; // Simulate growth based on mentions
        
        // Extract wrestler names
        const wrestlerPattern = /([A-Z][a-z]+ [A-Z][a-z]+|CM Punk|LA Knight)/g;
        const wrestlers = content.match(wrestlerPattern) || [];
        topic.related_wrestlers = [...new Set([...topic.related_wrestlers, ...wrestlers])].slice(0, 5);
      }
    });
  });

  // Analyze Reddit posts
  redditPosts.forEach(post => {
    const content = `${post.title} ${post.selftext}`.toLowerCase();
    
    topicCategories.forEach(category => {
      const hasKeywords = category.keywords.some(keyword => 
        content.includes(keyword.toLowerCase())
      );
      
      if (hasKeywords) {
        if (!topicMap.has(category.title)) {
          topicMap.set(category.title, {
            title: category.title,
            mentions: 0,
            sentiment: 0.5,
            growth_rate: 0,
            keywords: category.keywords,
            related_wrestlers: [],
            time_period: 'last 7 days'
          });
        }
        
        const topic = topicMap.get(category.title)!;
        topic.mentions++;
        
        // Weight by Reddit engagement
        const engagementWeight = Math.min(post.score / 100, 2);
        topic.growth_rate += engagementWeight * 10;
        
        // Extract wrestler names
        const wrestlerPattern = /([A-Z][a-z]+ [A-Z][a-z]+|CM Punk|LA Knight)/g;
        const wrestlers = content.match(wrestlerPattern) || [];
        topic.related_wrestlers = [...new Set([...topic.related_wrestlers, ...wrestlers])].slice(0, 5);
      }
    });
  });

  return Array.from(topicMap.values())
    .filter(topic => topic.mentions > 0)
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 10);
};

// Enhanced search functionality
export const performIntelligentSearch = async (
  query: string,
  newsArticles: NewsItem[],
  redditPosts: RedditPost[]
): Promise<{
  news: NewsItem[];
  reddit: RedditPost[];
  wrestlers: any[];
  storylines: StorylineAnalysis[];
  topics: TrendingTopic[];
}> => {
  const searchTerm = query.toLowerCase();
  
  // Search news articles
  const relevantNews = newsArticles.filter(article => 
    article.title.toLowerCase().includes(searchTerm) ||
    (article.content && article.content.toLowerCase().includes(searchTerm)) ||
    (article.wrestler_mentions && article.wrestler_mentions.some(w => 
      w.toLowerCase().includes(searchTerm)
    ))
  ).slice(0, 10);

  // Search Reddit posts
  const relevantReddit = redditPosts.filter(post => 
    post.title.toLowerCase().includes(searchTerm) ||
    post.selftext.toLowerCase().includes(searchTerm)
  ).slice(0, 10);

  // Search wrestlers from database
  const { data: wrestlers = [] } = await supabase
    .from('wrestlers')
    .select('*')
    .or(`name.ilike.%${query}%,real_name.ilike.%${query}%,championship_title.ilike.%${query}%`)
    .limit(10);

  // Generate storylines and topics based on search
  const storylines = await detectStorylinesFromNews(relevantNews);
  const topics = await generateTrendingTopics(relevantNews, relevantReddit);

  return {
    news: relevantNews,
    reddit: relevantReddit,
    wrestlers,
    storylines: storylines.filter(s => 
      s.title.toLowerCase().includes(searchTerm) ||
      s.participants.some(p => p.toLowerCase().includes(searchTerm))
    ),
    topics: topics.filter(t => 
      t.title.toLowerCase().includes(searchTerm) ||
      t.keywords.some(k => k.toLowerCase().includes(searchTerm))
    )
  };
};
