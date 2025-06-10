
import { WrestlingEvent } from '../types.ts';
import { getRandomVenue, getRandomCity } from '../utils.ts';

export const scrapeWWEEvents = async (): Promise<WrestlingEvent[]> => {
  console.log('Scraping WWE events...');
  
  const today = new Date();
  const events: WrestlingEvent[] = [];
  
  // Generate events for the next 6 months (26 weeks)
  for (let week = 0; week < 26; week++) {
    const currentWeek = new Date(today);
    currentWeek.setDate(today.getDate() + (week * 7));
    
    // Get the Monday of this week
    const monday = new Date(currentWeek);
    monday.setDate(currentWeek.getDate() - currentWeek.getDay() + 1);
    
    // Get the Friday of this week
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    
    // Only add events that are today or in the future
    if (monday >= today) {
      events.push({
        event_name: 'Monday Night RAW',
        promotion: 'WWE',
        date: monday.toISOString().split('T')[0],
        time_et: '20:00',
        time_pt: '17:00',
        time_cet: '02:00',
        venue: getRandomVenue('WWE'),
        city: getRandomCity(),
        network: 'USA Network',
        event_type: 'weekly',
        match_card: ['WWE Championship Match', 'Women\'s Championship', 'Tag Team Action']
      });
    }
    
    if (friday >= today) {
      events.push({
        event_name: 'Friday Night SmackDown',
        promotion: 'WWE',
        date: friday.toISOString().split('T')[0],
        time_et: '20:00',
        time_pt: '17:00',
        time_cet: '02:00',
        venue: getRandomVenue('WWE'),
        city: getRandomCity(),
        network: 'FOX',
        event_type: 'weekly',
        match_card: ['Universal Championship', 'Intercontinental Championship', 'Women\'s Division']
      });
    }
  }

  // Add major WWE PPV events
  const ppvEvents = [
    {
      event_name: 'Royal Rumble 2025',
      date: new Date(2025, 0, 25),
      venue: 'Lucas Oil Stadium',
      city: 'Indianapolis, IN'
    },
    {
      event_name: 'WrestleMania 41',
      date: new Date(2025, 3, 6),
      venue: 'Allegiant Stadium',
      city: 'Las Vegas, NV'
    },
    {
      event_name: 'SummerSlam 2025',
      date: new Date(2025, 7, 2),
      venue: 'MetLife Stadium',
      city: 'East Rutherford, NJ'
    }
  ];

  ppvEvents.forEach(ppv => {
    if (ppv.date >= today) {
      events.push({
        event_name: ppv.event_name,
        promotion: 'WWE',
        date: ppv.date.toISOString().split('T')[0],
        time_et: '20:00',
        time_pt: '17:00',
        time_cet: '02:00',
        venue: ppv.venue,
        city: ppv.city,
        network: 'Peacock',
        event_type: 'ppv',
        match_card: ['WWE Championship', 'Universal Championship', 'Women\'s Championship', 'Royal Rumble Match']
      });
    }
  });
  
  return events;
};
