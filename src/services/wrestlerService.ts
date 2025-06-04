
import wrestlerData from '@/data/wrestlers.json';
import eventData from '@/data/events.json';

export interface Wrestler {
  id: string;
  name: string;
  realName: string;
  status: 'Active' | 'Injured' | 'Suspended' | 'Released';
  championships: string[];
  brand?: string;
  debut: string;
  height: string;
  weight: string;
  hometown: string;
  finisher: string;
  image: string;
}

export interface Event {
  id: string;
  name: string;
  promotion: string;
  date?: string;
  day?: string;
  time?: string;
  network: string;
  nextDate?: string;
  location?: string;
  type: 'weekly' | 'ple' | 'ppv';
  matches?: {
    title: string;
    participants: string[];
  }[];
}

export type Promotion = 'wwe' | 'aew' | 'nxt' | 'tna';

export const getAllWrestlers = (): { promotion: Promotion; wrestler: Wrestler }[] => {
  const allWrestlers: { promotion: Promotion; wrestler: Wrestler }[] = [];
  
  Object.entries(wrestlerData).forEach(([promotion, divisions]) => {
    Object.values(divisions).forEach((wrestlers: any[]) => {
      wrestlers.forEach(wrestler => {
        allWrestlers.push({ promotion: promotion as Promotion, wrestler: wrestler as Wrestler });
      });
    });
  });
  
  return allWrestlers;
};

export const getWrestlersByPromotion = (promotion: Promotion): Wrestler[] => {
  const promotionData = (wrestlerData as any)[promotion];
  if (!promotionData) return [];
  
  return [...(promotionData.men || []), ...(promotionData.women || [])];
};

export const searchWrestlers = (query: string): { promotion: Promotion; wrestler: Wrestler }[] => {
  const allWrestlers = getAllWrestlers();
  const lowercaseQuery = query.toLowerCase();
  
  return allWrestlers.filter(({ wrestler }) =>
    wrestler.name.toLowerCase().includes(lowercaseQuery) ||
    wrestler.realName.toLowerCase().includes(lowercaseQuery) ||
    wrestler.hometown.toLowerCase().includes(lowercaseQuery)
  );
};

export const getChampions = (): { promotion: Promotion; wrestler: Wrestler }[] => {
  const allWrestlers = getAllWrestlers();
  return allWrestlers.filter(({ wrestler }) => wrestler.championships.length > 0);
};

export const getActiveWrestlers = (): { promotion: Promotion; wrestler: Wrestler }[] => {
  const allWrestlers = getAllWrestlers();
  return allWrestlers.filter(({ wrestler }) => wrestler.status === 'Active');
};

export const getWeeklyShows = (): Event[] => {
  return (eventData as any).weekly.map((event: any) => ({
    ...event,
    type: 'weekly' as const
  }));
};

export const getSpecialEvents = (): Event[] => {
  return (eventData as any).special.map((event: any) => ({
    ...event,
    type: event.type as 'ple' | 'ppv'
  }));
};

export const getUpcomingEvents = (): Event[] => {
  const now = new Date();
  const upcoming = getSpecialEvents().filter(event => new Date(event.date!) > now);
  return upcoming.sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());
};
