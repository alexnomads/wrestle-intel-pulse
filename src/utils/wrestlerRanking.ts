
import type { WrestlerAnalysis } from '@/types/wrestlerAnalysis';

export const getTopPushWrestlers = (analysis: WrestlerAnalysis[]): WrestlerAnalysis[] => {
  return analysis
    .filter(wrestler => wrestler.trend === 'push' && wrestler.totalMentions > 0)
    .sort((a, b) => {
      if (b.totalMentions !== a.totalMentions) {
        return b.totalMentions - a.totalMentions;
      }
      return b.momentumScore - a.momentumScore;
    })
    .slice(0, 10);
};

export const getWorstBuriedWrestlers = (analysis: WrestlerAnalysis[]): WrestlerAnalysis[] => {
  return analysis
    .filter(wrestler => wrestler.trend === 'burial' && wrestler.totalMentions > 0)
    .sort((a, b) => {
      if (b.totalMentions !== a.totalMentions) {
        return b.totalMentions - a.totalMentions;
      }
      return b.burialScore - a.burialScore;
    })
    .slice(0, 10);
};
