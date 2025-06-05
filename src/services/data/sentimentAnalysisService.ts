
// Simple sentiment analysis and wrestler mention extraction
export interface SentimentResult {
  score: number; // 0-1 scale where 0.5 is neutral
  magnitude: number;
}

// Simple keyword-based sentiment analysis
export const analyzeSentiment = (text: string): SentimentResult => {
  if (!text || text.trim().length === 0) {
    return { score: 0.5, magnitude: 0 };
  }

  const positiveWords = [
    'champion', 'winner', 'victory', 'successful', 'amazing', 'great', 'excellent',
    'outstanding', 'impressive', 'dominant', 'powerful', 'strong', 'talented',
    'skilled', 'push', 'rising', 'star', 'featured', 'main event', 'title shot',
    'breakthrough', 'momentum', 'hot', 'over', 'popular', 'crowd favorite'
  ];

  const negativeWords = [
    'lost', 'defeated', 'failed', 'terrible', 'awful', 'bad', 'worst',
    'weak', 'buried', 'jobber', 'squash', 'destruction', 'dominated',
    'crushed', 'embarrassed', 'humiliated', 'flop', 'boring', 'stale',
    'heat', 'go away', 'change channel', 'bathroom break', 'boring'
  ];

  const words = text.toLowerCase().split(/\s+/);
  let positiveScore = 0;
  let negativeScore = 0;

  words.forEach(word => {
    if (positiveWords.some(pos => word.includes(pos))) {
      positiveScore++;
    }
    if (negativeWords.some(neg => word.includes(neg))) {
      negativeScore++;
    }
  });

  const totalWords = words.length;
  const magnitude = (positiveScore + negativeScore) / totalWords;
  
  // Calculate sentiment score (0-1 scale)
  let score = 0.5; // neutral
  if (positiveScore > negativeScore) {
    score = 0.5 + (positiveScore / (positiveScore + negativeScore)) * 0.4;
  } else if (negativeScore > positiveScore) {
    score = 0.5 - (negativeScore / (positiveScore + negativeScore)) * 0.4;
  }

  return {
    score: Math.max(0, Math.min(1, score)),
    magnitude: Math.max(0, Math.min(1, magnitude))
  };
};

// Extract wrestler mentions from text
export const extractWrestlerMentions = (text: string): string[] => {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Common wrestler name patterns and variations
  const wrestlerPatterns = [
    // Full names that might appear
    /\b(Roman Reigns?|Seth Rollins?|Drew McIntyre|Cody Rhodes|LA Knight|John Cena)\b/gi,
    /\b(Jon Moxley|Kenny Omega|CM Punk|Adam Cole|MJF|Hangman Page)\b/gi,
    /\b(Trick Williams|Ilja Dragunov|Roxanne Perez|Rhea Ripley)\b/gi,
    /\b(Jordynne Grace|Moose|Eddie Edwards|Rich Swann)\b/gi,
    
    // Single names that are distinctive
    /\b(Gunther|Rollins|Reigns|Cena|Punk|Omega|Moxley|Hangman)\b/gi,
    /\b(Rhea|Roxanne|Jordynne|Moose|Trick)\b/gi,
    
    // Tag teams and stables
    /\b(New Day|Judgment Day|Bloodline|Elite|House of Black)\b/gi,
    /\b(Motor City Machine Guns|Death Triangle|Private Party)\b/gi
  ];

  const mentions: string[] = [];
  
  wrestlerPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      mentions.push(...matches.map(match => match.trim()));
    }
  });

  // Remove duplicates and return
  return [...new Set(mentions)];
};
