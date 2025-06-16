
import { useState, useMemo } from 'react';

export const useWrestlerFiltering = (wrestlers: any[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPromotion, setSelectedPromotion] = useState('all');
  const [minMentions, setMinMentions] = useState('1');
  const [sortBy, setSortBy] = useState('mentions');

  const filteredWrestlers = useMemo(() => {
    let filtered = wrestlers;

    if (searchTerm) {
      filtered = filtered.filter(wrestler =>
        wrestler.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wrestler.promotions?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedPromotion !== 'all') {
      filtered = filtered.filter(wrestler =>
        wrestler.promotions?.name?.toLowerCase().includes(selectedPromotion.toLowerCase())
      );
    }

    return filtered;
  }, [wrestlers, searchTerm, selectedPromotion]);

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
