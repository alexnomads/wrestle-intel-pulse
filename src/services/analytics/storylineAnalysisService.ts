
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

// Enhanced storyline detection from news articles
export const detectStorylinesFromNews = async (newsArticles: NewsItem[]): Promise<StorylineAnalysis[]> => {
  if (!newsArticles || newsArticles.length === 0) {
    console.log('No news articles available for storyline detection');
    return [];
  }

  const storylines: Map<string, StorylineAnalysis> = new Map();
  
  // Enhanced keywords for better storyline detection
  const storylineKeywords = [
    'feud', 'rivalry', 'vs', 'versus', 'challenge', 'confrontation', 'face off',
    'championship', 'title', 'match', 'fight', 'attack', 'betrayal', 'heel turn',
    'alliance', 'team', 'stable', 'storyline', 'angle', 'program', 'segment',
    'promo', 'interview', 'contract signing', 'return', 'debut', 'suspension',
    'injury', 'retirement', 'comeback', 'faction', 'war', 'tournament'
  ];

  // Wrestling promotions with variations
  const promotions = [
    { names: ['WWE', 'World Wrestling Entertainment'], key: 'WWE' },
    { names: ['AEW', 'All Elite Wrestling'], key: 'AEW' },
    { names: ['NXT'], key: 'NXT' },
    { names: ['TNA', 'Impact Wrestling', 'IMPACT'], key: 'TNA' },
    { names: ['NJPW', 'New Japan'], key: 'NJPW' },
    { names: ['ROH', 'Ring of Honor'], key: 'ROH' }
  ];

  // Common wrestler names for better detection
  const commonWrestlers = [
    'CM Punk', 'Roman Reigns', 'Cody Rhodes', 'Seth Rollins', 'Drew McIntyre',
    'Jon Moxley', 'Kenny Omega', 'Will Ospreay', 'Rhea Ripley', 'Bianca Belair',
    'Becky Lynch', 'Mercedes Mone', 'Jade Cargill', 'Toni Storm', 'Gunther',
    'LA Knight', 'Jey Uso', 'Jimmy Uso', 'Damian Priest', 'Finn Balor',
    'Adam Cole', 'Kyle O\'Reilly', 'Roderick Strong', 'Bobby Lashley',
    'Brock Lesnar', 'John Cena', 'The Rock', 'Triple H', 'Shawn Michaels'
  ];

  newsArticles.forEach(article => {
    const content = `${article.title} ${article.contentSnippet || ''}`.toLowerCase();
    
    // Check if article contains storyline keywords
    const hasStorylineKeywords = storylineKeywords.some(keyword => 
      content.includes(keyword.toLowerCase())
    );

    if (!hasStorylineKeywords) return;

    // Extract wrestler mentions with improved pattern
    const wrestlerMatches = commonWrestlers.filter(wrestler => 
      content.includes(wrestler.toLowerCase())
    );
    
    // Also look for general wrestler patterns
    const wrestlerPattern = /([A-Z][a-z]+ [A-Z][a-z]+|[A-Z][a-z]+)/g;
    const additionalWrestlers = content.match(wrestlerPattern) || [];
    
    const allWrestlers = [...new Set([...wrestlerMatches, ...additionalWrestlers])];
    const uniqueWrestlers = allWrestlers.slice(0, 4);

    if (uniqueWrestlers.length < 1) return;

    // Determine promotion with better matching
    let promotion = 'Unknown';
    for (const promo of promotions) {
      if (promo.names.some(name => content.includes(name.toLowerCase()))) {
        promotion = promo.key;
        break;
      }
    }

    // Create storyline key based on participants and promotion
    const storylineKey = `${promotion}_${uniqueWrestlers.sort().join('_vs_')}`;
    
    if (!storylines.has(storylineKey)) {
      // Calculate intensity based on keywords
      let intensity = 5.0;
      if (content.includes('attack') || content.includes('assault')) intensity += 2;
      if (content.includes('championship') || content.includes('title')) intensity += 1.5;
      if (content.includes('betrayal') || content.includes('heel turn')) intensity += 2.5;
      if (content.includes('return') || content.includes('debut')) intensity += 1;
      if (content.includes('injury') || content.includes('suspension')) intensity += 1.5;
      
      // Calculate fan reception from positive/negative sentiment
      let fanReception = 6.0;
      if (content.includes('amazing') || content.includes('incredible') || content.includes('great')) fanReception += 2;
      if (content.includes('boring') || content.includes('disappointing') || content.includes('terrible')) fanReception -= 2;
      if (content.includes('best') || content.includes('perfect')) fanReception += 1.5;
      if (content.includes('worst') || content.includes('awful')) fanReception -= 1.5;
      
      // Determine status based on keywords and context
      let status: 'building' | 'climax' | 'cooling' | 'concluded' = 'building';
      if (content.includes('match result') || content.includes('winner') || content.includes('defeated')) {
        status = 'concluded';
      } else if (content.includes('tonight') || content.includes('this week') || content.includes('main event')) {
        status = 'climax';
      } else if (content.includes('announcement') || content.includes('upcoming') || content.includes('scheduled')) {
        status = 'building';
      }

      // Create meaningful title
      const title = uniqueWrestlers.length > 1 
        ? `${uniqueWrestlers.slice(0, 2).join(' vs ')}`
        : `${uniqueWrestlers[0]} Storyline`;

      storylines.set(storylineKey, {
        id: `storyline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title,
        participants: uniqueWrestlers,
        description: `Ongoing storyline in ${promotion} involving ${uniqueWrestlers.join(', ')} based on recent news coverage`,
        status,
        intensity_score: Math.min(intensity, 10),
        fan_reception_score: Math.min(Math.max(fanReception, 0), 10),
        start_date: article.pubDate || new Date().toISOString(),
        source_articles: [article],
        keywords: storylineKeywords.filter(kw => content.includes(kw.toLowerCase())),
        promotion
      });
    } else {
      // Update existing storyline
      const existing = storylines.get(storylineKey)!;
      existing.source_articles.push(article);
      
      // Update intensity based on additional coverage
      existing.intensity_score = Math.min(existing.intensity_score + 0.3, 10);
      
      // Update keywords
      const newKeywords = storylineKeywords.filter(kw => content.includes(kw.toLowerCase()));
      existing.keywords = [...new Set([...existing.keywords, ...newKeywords])];
      
      // Update description with more context
      if (existing.source_articles.length > 1) {
        existing.description = `Active storyline in ${existing.promotion} involving ${existing.participants.join(', ')} with ${existing.source_articles.length} recent news articles covering the development`;
      }
    }
  });

  const result = Array.from(storylines.values())
    .sort((a, b) => b.intensity_score - a.intensity_score)
    .slice(0, 15);

  console.log(`Generated ${result.length} storylines from ${newsArticles.length} news articles`);
  return result;
};
