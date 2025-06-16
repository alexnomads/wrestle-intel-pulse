
import React from 'react';

export const useWrestlerDataProcessing = (wrestlers: any[], enhancedMetrics: any[], applyFiltersAndSorting: (list: any[]) => any[]) => {
  return React.useMemo(() => {
    if (!wrestlers.length) {
      return [];
    }

    // If we have enhanced metrics, use them
    if (enhancedMetrics.length > 0) {
      const wrestlersWithMetrics = wrestlers.map(wrestler => {
        const metrics = enhancedMetrics.find(m => m.wrestler_id === wrestler.id);
        
        if (!metrics) {
          return null;
        }

        return {
          ...wrestler,
          ...metrics,
          wrestler_name: wrestler.name,
          promotion: wrestler.brand || 'Independent',
          totalMentions: metrics.mention_count,
          sentimentScore: Math.round((metrics.push_score - metrics.burial_score + 50)),
          pushScore: metrics.push_score,
          burialScore: metrics.burial_score,
          momentumScore: metrics.momentum_score,
          popularityScore: metrics.popularity_score,
          isOnFire: metrics.push_score >= 70 && metrics.momentum_score >= 70,
          trend: metrics.push_score > metrics.burial_score ? 'push' : 
                 metrics.burial_score > metrics.push_score ? 'burial' : 'stable',
          change24h: Math.round(metrics.momentum_score - 50),
        };
      }).filter(Boolean);

      return applyFiltersAndSorting(wrestlersWithMetrics);
    }

    // If no enhanced metrics yet, show all wrestlers with placeholder data
    const wrestlersWithDefaults = wrestlers.map(wrestler => ({
      ...wrestler,
      wrestler_name: wrestler.name,
      promotion: wrestler.brand || 'Independent',
      totalMentions: 0,
      sentimentScore: 50,
      pushScore: 0,
      burialScore: 0,
      momentumScore: 0,
      popularityScore: 0,
      isOnFire: false,
      trend: 'stable' as const,
      change24h: 0,
      confidence_level: 'low' as const,
      mention_count: 0,
      data_sources: {
        total_mentions: 0,
        tier_1_mentions: 0,
        tier_2_mentions: 0,
        tier_3_mentions: 0,
        hours_since_last_mention: 999,
        source_breakdown: {}
      },
      last_updated: new Date().toISOString()
    }));

    return applyFiltersAndSorting(wrestlersWithDefaults);
  }, [wrestlers, enhancedMetrics, applyFiltersAndSorting]);
};
