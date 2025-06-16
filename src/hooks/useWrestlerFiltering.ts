
import { useState, useMemo } from 'react';

export const useWrestlerFiltering = (wrestlers: any[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPromotion, setSelectedPromotion] = useState('all');
  const [minMentions, setMinMentions] = useState('1');
  const [sortBy, setSortBy] = useState('mentions');

  const filteredWrestlers = useMemo(() => {
    let filtered = wrestlers;

    // Search filter - check both wrestler_name and name fields
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(wrestler => {
        const wrestlerName = wrestler.wrestler_name || wrestler.name || '';
        const promotionName = wrestler.promotions?.name || wrestler.promotion || '';
        
        return wrestlerName.toLowerCase().includes(searchLower) ||
               promotionName.toLowerCase().includes(searchLower);
      });
    }

    // Promotion filter
    if (selectedPromotion !== 'all') {
      filtered = filtered.filter(wrestler => {
        const promotionName = wrestler.promotions?.name || wrestler.promotion || '';
        return promotionName.toLowerCase().includes(selectedPromotion.toLowerCase());
      });
    }

    // Sort the results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          const nameA = a.wrestler_name || a.name || '';
          const nameB = b.wrestler_name || b.name || '';
          return nameA.localeCompare(nameB);
        case 'push':
          return (b.pushScore || 0) - (a.pushScore || 0);
        case 'sentiment':
          return (b.sentimentScore || 0) - (a.sentimentScore || 0);
        case 'mentions':
        default:
          return (b.totalMentions || b.mention_count || 0) - (a.totalMentions || a.mention_count || 0);
      }
    });

    return filtered;
  }, [wrestlers, searchTerm, selectedPromotion, sortBy]);

  return {
    filteredWrestlers,
    searchTerm,
    setSearchTerm,
    selectedPromotion,
    setSelectedPromotion,
    minMentions,
    setMinMentions,
    sortBy,
    setSortBy
  };
};
