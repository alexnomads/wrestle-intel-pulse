
import React from 'react';

export const useWrestlerFiltering = (searchTerm: string, selectedPromotion: string, sortBy: string) => {
  return React.useCallback((wrestlersList: any[]) => {
    let filtered = wrestlersList;

    if (searchTerm) {
      filtered = filtered.filter(wrestler =>
        wrestler.wrestler_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wrestler.promotion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedPromotion !== 'all') {
      filtered = filtered.filter(wrestler =>
        wrestler.promotion.toLowerCase().includes(selectedPromotion.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'mentions':
          return b.totalMentions - a.totalMentions;
        case 'sentiment':
          return b.sentimentScore - a.sentimentScore;
        case 'change':
          return b.change24h - a.change24h;
        case 'push':
          return b.pushScore - a.pushScore;
        case 'name':
          return a.wrestler_name.localeCompare(b.wrestler_name);
        default:
          return b.totalMentions - a.totalMentions;
      }
    });

    return filtered;
  }, [searchTerm, selectedPromotion, sortBy]);
};
