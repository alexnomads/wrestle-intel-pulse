
export const calculateWrestlerScores = (
  sentimentScores: number[],
  mentionsCount: number
) => {
  const avgSentiment = sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length;
  
  // More realistic scoring algorithm
  const baseScore = Math.round(avgSentiment * 100);
  const mentionBonus = Math.min(mentionsCount * 5, 30); // Cap bonus at 30
  
  const pushScore = Math.min(100, Math.max(0, baseScore + mentionBonus));
  const burialScore = Math.min(100, Math.max(0, (100 - baseScore) * 0.7)); // Less aggressive burial scoring
  const momentumScore = Math.round(Math.min(100, pushScore * 0.8 + mentionsCount * 3));
  const popularityScore = Math.round(Math.min(100, (pushScore + mentionBonus) * 0.9));

  return {
    pushScore,
    burialScore,
    momentumScore,
    popularityScore,
    avgSentiment
  };
};

export const generateMentionData = (wrestler: any, item: any, sentimentScore: number) => {
  return {
    wrestler_id: wrestler.id,
    wrestler_name: wrestler.name,
    source_type: 'news',
    source_name: item.source || 'Wrestling News',
    source_url: item.link || '#',
    title: item.title,
    content_snippet: item.contentSnippet || item.title.substring(0, 150),
    mention_context: 'news_article',
    sentiment_score: sentimentScore,
    source_credibility_tier: 2,
    keywords: JSON.stringify([wrestler.name])
  };
};
