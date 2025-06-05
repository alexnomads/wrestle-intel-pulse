
// Re-export all types and functions from the modular services
export type { StorylineAnalysis } from './analytics/storylineAnalysisService';
export type { WrestlerMomentum } from './analytics/wrestlerMomentumService';
export type { TrendingTopic } from './analytics/trendingTopicsService';

export { detectStorylinesFromNews } from './analytics/storylineAnalysisService';
export { calculateWrestlerMomentum } from './analytics/wrestlerMomentumService';
export { generateTrendingTopics } from './analytics/trendingTopicsService';
export { performIntelligentSearch } from './analytics/intelligentSearchService';
