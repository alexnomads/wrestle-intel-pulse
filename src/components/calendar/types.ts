
export interface WrestlingEvent {
  id: string;
  eventName: string;
  promotion: 'WWE' | 'AEW' | 'NXT' | 'TNA' | 'NJPW' | 'ROH';
  date: string;
  timeET: string;
  timePT: string;
  timeCET: string;
  venue: string;
  city: string;
  network: string;
  eventType: 'weekly' | 'ppv' | 'special';
  matchCard?: string[];
  lastUpdated: string;
}

export const promotionColors = {
  WWE: 'bg-red-500',
  AEW: 'bg-yellow-500', 
  NXT: 'bg-purple-500',
  TNA: 'bg-blue-500',
  NJPW: 'bg-gray-800',
  ROH: 'bg-green-500'
};
