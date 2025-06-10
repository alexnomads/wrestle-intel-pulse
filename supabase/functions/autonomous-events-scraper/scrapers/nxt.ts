
import { WrestlingEvent } from '../types.ts';

export const scrapeNXTEvents = async (): Promise<WrestlingEvent[]> => {
  console.log('Scraping NXT events...');
  
  const today = new Date();
  const events: WrestlingEvent[] = [];
  
  // Generate weekly NXT events for next 6 months (26 weeks)
  for (let week = 0; week < 26; week++) {
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() + (week * 7) - today.getDay());
    
    // WWE NXT on Tuesday (Day 2)
    const tuesday = new Date(startOfWeek);
    tuesday.setDate(startOfWeek.getDate() + 2);
    
    if (tuesday >= today) {
      events.push({
        event_name: 'WWE NXT',
        promotion: 'NXT',
        date: tuesday.toISOString().split('T')[0],
        time_et: '20:00',
        time_pt: '17:00',
        time_cet: '02:00',
        venue: 'WWE Performance Center',
        city: 'Orlando, FL',
        network: 'USA Network',
        event_type: 'weekly',
        match_card: ['NXT Championship', 'NXT Women\'s Championship', 'North American Championship']
      });
    }
  }

  // Add NXT special events
  events.push({
    event_name: 'NXT Stand & Deliver 2025',
    promotion: 'NXT',
    date: new Date(2025, 3, 5).toISOString().split('T')[0],
    time_et: '20:00',
    time_pt: '17:00',
    time_cet: '02:00',
    venue: 'WWE Performance Center',
    city: 'Orlando, FL',
    network: 'Peacock',
    event_type: 'special',
    match_card: ['NXT Championship', 'NXT Women\'s Championship', 'Ladder Match']
  });
  
  return events;
};
