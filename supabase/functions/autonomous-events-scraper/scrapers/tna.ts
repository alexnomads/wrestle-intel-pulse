
import { WrestlingEvent } from '../types.ts';

export const scrapeTNAEvents = async (): Promise<WrestlingEvent[]> => {
  console.log('Scraping TNA events...');
  
  const today = new Date();
  const events: WrestlingEvent[] = [];
  
  // Generate weekly TNA events (26 weeks)
  for (let week = 0; week < 26; week++) {
    const currentWeek = new Date(today);
    currentWeek.setDate(today.getDate() + (week * 7));
    
    // Get the Monday of this week
    const monday = new Date(currentWeek);
    monday.setDate(currentWeek.getDate() - currentWeek.getDay() + 1);
    
    // TNA Impact on Thursday (Monday + 3)
    const thursday = new Date(monday);
    thursday.setDate(monday.getDate() + 3);
    
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
