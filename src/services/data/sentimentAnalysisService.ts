
// Enhanced sentiment analysis using real keyword detection
export const analyzeSentiment = (text: string): { score: number; keywords: string[] } => {
  const positiveKeywords = [
    'amazing', 'incredible', 'fantastic', 'brilliant', 'outstanding', 'excellent',
    'awesome', 'great', 'love', 'perfect', 'phenomenal', 'legendary', 'classic',
    'champion', 'victory', 'win', 'success', 'return', 'debut', 'breakthrough'
  ];
  
  const negativeKeywords = [
    'terrible', 'awful', 'horrible', 'disappointing', 'boring', 'bad',
    'hate', 'worst', 'disaster', 'failure', 'flop', 'painful', 'cringe',
    'injury', 'injured', 'lose', 'defeat', 'suspended', 'controversy', 'burial'
  ];
  
  const content = text.toLowerCase();
  const foundPositive = positiveKeywords.filter(word => content.includes(word));
  const foundNegative = negativeKeywords.filter(word => content.includes(word));
  
  const positiveScore = foundPositive.length;
  const negativeScore = foundNegative.length;
  
  let score = 0.5; // neutral
  if (positiveScore > negativeScore) {
    score = Math.min(0.5 + (positiveScore * 0.1), 1.0);
  } else if (negativeScore > positiveScore) {
    score = Math.max(0.5 - (negativeScore * 0.1), 0.0);
  }
  
  return {
    score,
    keywords: [...foundPositive, ...foundNegative]
  };
};

// Extract wrestler mentions from text
export const extractWrestlerMentions = (text: string): string[] => {
  // Common wrestling names that might appear in content
  const wrestlerNames = [
    'CM Punk', 'Roman Reigns', 'Cody Rhodes', 'Seth Rollins', 'Drew McIntyre',
    'Jon Moxley', 'Kenny Omega', 'Will Ospreay', 'Rhea Ripley', 'Bianca Belair',
    'Becky Lynch', 'Sasha Banks', 'Mercedes Moné', 'Jade Cargill', 'Toni Storm',
    'Gunther', 'Damian Priest', 'LA Knight', 'Jey Uso', 'Jimmy Uso'
  ];
  
  const content = text.toLowerCase();
  return wrestlerNames.filter(name => 
    content.includes(name.toLowerCase())
  );
};
