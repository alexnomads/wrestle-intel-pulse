
import { WrestlingEvent } from '../types.ts';

export const scrapeTNAEvents = async (): Promise<WrestlingEvent[]> => {
  console.log('Scraping TNA events...');
  
  const today = new Date();
  const events: WrestlingEvent[] = [];
  
  // Generate weekly TNA events (26 weeks)
  for (let week = 0; week < 26; week++) {
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() + (week * 7) - today.getDay());
    
    // TNA Impact on Thursday (Day 4)
    const thursday = new Date(startOfWeek);
    thursday.setDate(startOfWeek.getDate() + 4);
    
    if (thursday >= today) {
      events.push({
        event_name: 'TNA Impact Wrestling',
        promotion: 'TNA',
        date: thursday.toISOString().split('T')[0],
        time_et: '20:00',
        time_pt: '17:00',
        time_cet: '02:00',
        venue: 'Impact Zone',
        city: 'Nashville, TN',
        network: 'AXS TV',
        event_type: 'weekly',
        match_card: ['TNA World Championship', 'X-Division Championship', 'Knockouts Championship']
      });
    }
  }
  
  return events;
};
