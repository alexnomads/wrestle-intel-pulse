
// Re-export all types and functions from the modular trending services
export type { 
  TrendingWrestler, 
  TrendingTopic, 
  PromotionMetrics 
} from './trending/types';

export { analyzeTrendingWrestlers } from './trending/wrestlerAnalysisService';
export { generateTrendingTopics } from './trending/topicsGenerationService';
export { analyzePromotionMetrics } from './trending/promotionMetricsService';
