
import type { Wrestler } from '@/types/wrestlerAnalysis';

export const filterWrestlersByPromotion = (
  wrestlers: Wrestler[], 
  selectedPromotion: string
): Wrestler[] => {
  return selectedPromotion === 'all' 
    ? wrestlers 
    : wrestlers.filter(wrestler => 
        wrestler.brand?.toLowerCase().includes(selectedPromotion.toLowerCase()) ||
        (wrestler.promotion_id && wrestlers.find(w => w.promotion_id === wrestler.promotion_id))
      );
};

export const filterPopularWrestlers = (wrestlers: Wrestler[]): Wrestler[] => {
  return wrestlers.filter(wrestler => {
    const name = wrestler.name.toLowerCase();
    // Filter for main roster wrestlers and exclude non-wrestlers
    return !name.includes('referee') && 
           !name.includes('announcer') && 
           !name.includes('commentator') &&
           !name.includes('road agent') &&
           !name.includes('music group') &&
           wrestler.name.length > 3;
  });
};
