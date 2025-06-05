
import { NewsItem } from '../wrestlingDataService';

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
    const content = `${article.title} ${article.contentSnippet || ''}`.toLowerCase();
    
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
        start_date: article.pubDate || new Date().toISOString(),
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
