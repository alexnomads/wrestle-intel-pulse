
// Helper functions for venue and city data
export const getRandomVenue = (promotion: string): string => {
  const venues = {
    WWE: [
      'Madison Square Garden', 'Allstate Arena', 'Toyota Center', 'Wells Fargo Center',
      'American Airlines Center', 'Barclays Center', 'Capital One Arena', 'Amway Center'
    ],
    AEW: [
      'Daily\'s Place', 'United Center', 'Prudential Center', 'PPG Paints Arena',
      'KeyBank Center', 'Heritage Bank Center', 'CFG Bank Arena', 'Van Andel Arena'
    ],
    ROH: [
      'Hammerstein Ballroom', 'Temple University', 'Philadelphia 2300 Arena',
      'Sam\'s Town Live', 'Globe Theatre', 'Chesapeake Employers Insurance Arena'
    ]
  };
  
  const promotionVenues = venues[promotion as keyof typeof venues] || venues.WWE;
  return promotionVenues[Math.floor(Math.random() * promotionVenues.length)];
};

export const getRandomCity = (): string => {
  const cities = [
    'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
    'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
    'Austin, TX', 'Jacksonville, FL', 'Fort Worth, TX', 'Columbus, OH', 'Charlotte, NC',
    'Detroit, MI', 'El Paso, TX', 'Memphis, TN', 'Denver, CO', 'Washington, DC'
  ];
  
  return cities[Math.floor(Math.random() * cities.length)];
};

export const convertToTimezones = (etTime: string) => {
  const [hours, minutes] = etTime.split(':').map(Number);
  
  // Convert ET to PT (3 hours behind)
  let ptHours = hours - 3;
  if (ptHours < 0) ptHours += 24;
  
  // Convert ET to CET (6 hours ahead)
  let cetHours = hours + 6;
  if (cetHours >= 24) cetHours -= 24;
  
  return {
    time_pt: `${ptHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
    time_cet: `${cetHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  };
};
