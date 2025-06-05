
export const getPopularityScore = (wrestler: any) => {
  return Math.round((wrestler.totalMentions * 10) + (wrestler.sentimentScore * 0.5));
};

export const get24hChange = (wrestler: any) => {
  // Simulate 24h change based on trend
  const baseChange = wrestler.trend === 'push' ? 15 : wrestler.trend === 'burial' ? -12 : 3;
  return baseChange + Math.floor(Math.random() * 10 - 5);
};
