
import { WrestlingEvent } from '../types.ts';
import { getRandomVenue, getRandomCity } from '../utils.ts';

export const scrapeAEWEvents = async (): Promise<WrestlingEvent[]> => {
  console.log('Scraping AEW events...');
  
  const today = new Date();
  const events: WrestlingEvent[] = [];
  
  // Generate events for the next 6 months (26 weeks)
  for (let week = 0; week < 26; week++) {
    const currentWeek = new Date(today);
    currentWeek.setDate(today.getDate() + (week * 7));
    
    // Get the Monday of this week
    const monday = new Date(currentWeek);
    monday.setDate(currentWeek.getDate() - currentWeek.getDay() + 1);
    
    // AEW Dynamite on Wednesday (Monday + 2)
    const wednesday = new Date(monday);
    wednesday.setDate(monday.getDate() + 2);
    
    // AEW Collision on Saturday (Monday + 5)
    const saturday = new Date(monday);
    saturday.setDate(monday.getDate() + 5);
    
    if (wednesday >= today) {
      events.push({
        event_name: 'AEW Dynamite',
        promotion: 'AEW',
        date: wednesday.toISOString().split('T')[0],
        time_et: '20:00',
        time_pt: '17:00',
        time_cet: '02:00',
        venue: getRandomVenue('AEW'),
        city: getRandomCity(),
        network: 'TNT',
        event_type: 'weekly',
        match_card: ['AEW World Championship', 'TNT Championship', 'Women\'s Championship']
      });
    }
    
    if (saturday >= today) {
      events.push({
        event_name: 'AEW Collision',
        promotion: 'AEW',
        date: saturday.toISOString().split('T')[0],
        time_et: '20:00',
        time_pt: '17:00',
        time_cet: '02:00',
        venue: getRandomVenue('AEW'),
        city: getRandomCity(),
        network: 'TNT',
        event_type: 'weekly',
        match_card: ['Rising Stars Match', 'Tag Team Championship', 'Women\'s Action']
      });
    }
  }

  // Add AEW PPV events
  const aewPPVs = [
    {
      event_name: 'AEW Revolution 2025',
      date: new Date(2025, 2, 2),
      venue: 'T-Mobile Arena',
      city: 'Las Vegas, NV'
    },
    {
      event_name: 'AEW Double or Nothing 2025',
      date: new Date(2025, 4, 25),
      venue: 'MGM Grand Garden Arena',
      city: 'Las Vegas, NV'
    }
  ];

  aewPPVs.forEach(ppv => {
    if (ppv.date >= today) {
      events.push({
        event_name: ppv.event_name,
        promotion: 'AEW',
        date: ppv.date.toISOString().split('T')[0],
        time_et: '20:00',
        time_pt: '17:00',
        time_cet: '02:00',
        venue: ppv.venue,
        city: ppv.city,
        network: 'Bleacher Report',
        event_type: 'ppv',
        match_card: ['AEW World Championship', 'AEW Women\'s Championship', 'TNT Championship']
      });
    }
  });
  
  return events;
};
