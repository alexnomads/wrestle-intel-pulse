
import { WrestlingEvent } from '../types.ts';

export const scrapeNJPWEvents = async (): Promise<WrestlingEvent[]> => {
  console.log('Scraping NJPW events...');
  
  const today = new Date();
  const events: WrestlingEvent[] = [];

  // Generate NJPW Strong weekly events (every other Saturday)
  for (let week = 0; week < 26; week += 2) {
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() + (week * 7) - today.getDay());
    
    // NJPW Strong on Saturday (Day 6)
    const saturday = new Date(startOfWeek);
    saturday.setDate(startOfWeek.getDate() + 6);
    
    if (saturday >= today) {
      events.push({
        event_name: 'NJPW Strong',
        promotion: 'NJPW',
        date: saturday.toISOString().split('T')[0],
        time_et: '22:00',
        time_pt: '19:00',
        time_cet: '04:00',
        venue: 'Various Venues',
        city: 'USA/Japan',
        network: 'NJPW World',
        event_type: 'weekly',
        match_card: ['Strong Style Competition', 'International Showcase']
      });
    }
  }

  // Add major NJPW events
  const njpwEvents = [
    {
      event_name: 'NJPW Wrestle Kingdom 19',
      date: new Date(2025, 0, 4),
      venue: 'Tokyo Dome',
      city: 'Tokyo, Japan'
    }
  ];

  njpwEvents.forEach(event => {
    if (event.date >= today) {
      events.push({
        event_name: event.event_name,
        promotion: 'NJPW',
        date: event.date.toISOString().split('T')[0],
        time_et: '05:00',
        time_pt: '02:00',
        time_cet: '11:00',
        venue: event.venue,
        city: event.city,
        network: 'NJPW World',
        event_type: 'ppv',
        match_card: ['IWGP World Championship', 'IWGP Intercontinental Championship']
      });
    }
  });
  
  return events;
};
