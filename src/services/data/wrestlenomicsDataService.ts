
import { WrestlenomicsData } from './dataTypes';

export const scrapeWrestlenomicsData = async (): Promise<Partial<WrestlenomicsData>> => {
  const data: Partial<WrestlenomicsData> = {};
  
  try {
    console.log('Fetching real Wrestlenomics data...');
    
    // Import the Wrestlenomics service functions
    const { getStoredTVRatings, getStoredTicketSales, getStoredELORankings } = await import('../wrestlenomicsService');
    
    // Fetch stored data from Supabase
    const [tvRatings, ticketSales, eloRankings] = await Promise.all([
      getStoredTVRatings(),
      getStoredTicketSales(),
      getStoredELORankings()
    ]);

    // Transform the data to match our interfaces
    data.tvRatings = tvRatings.map((rating: any) => ({
      show: rating.show,
      date: rating.air_date,
      rating: rating.rating,
      viewership: rating.viewership,
      network: rating.network
    }));

    data.ticketSales = ticketSales.map((ticket: any) => ({
      event: ticket.event_name,
      venue: ticket.venue,
      date: ticket.event_date,
      capacity: ticket.capacity,
      sold: ticket.tickets_sold,
      attendance_percentage: ticket.attendance_percentage
    }));

    data.eloRankings = eloRankings.map((elo: any) => ({
      wrestler: elo.wrestler_name,
      elo_rating: elo.elo_rating,
      promotion: elo.promotion,
      rank: elo.ranking_position,
      trend: elo.trend as 'up' | 'down' | 'stable'
    }));
    
    console.log('Successfully fetched Wrestlenomics data:', {
      tvRatings: data.tvRatings?.length || 0,
      ticketSales: data.ticketSales?.length || 0,
      eloRankings: data.eloRankings?.length || 0
    });
  } catch (error) {
    console.error('Error fetching Wrestlenomics data:', error);
    
    // Fallback to empty arrays instead of mock data
    data.tvRatings = [];
    data.ticketSales = [];
    data.eloRankings = [];
  }
  
  return data;
};
