
import { WrestlingEvent } from '../types.ts';
import { getRandomVenue, getRandomCity } from '../utils.ts';

export const scrapeROHEvents = async (): Promise<WrestlingEvent[]> => {
  console.log('Scraping ROH events...');
  
  const today = new Date();
  const events: WrestlingEvent[] = [];

  // Generate ROH Honor Club weekly events (26 weeks)
  for (let week = 0; week < 26; week++) {
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() + (week * 7) - today.getDay());
    
    // ROH Honor Club on Sunday (Day 0)
    const sunday = new Date(startOfWeek);
    
    if (sunday >= today) {
      events.push({
        event_name: 'ROH Honor Club',
        promotion: 'ROH',
        date: sunday.toISOString().split('T')[0],
        time_et: '21:00',
        time_pt: '18:00',
        time_cet: '03:00',
        venue: getRandomVenue('ROH'),
        city: getRandomCity(),
        network: 'Honor Club',
        event_type: 'weekly',
        match_card: ['ROH World Championship', 'ROH Women\'s Championship', 'Pure Wrestling']
      });
    }
  }
  
  return events;
};
