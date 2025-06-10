
export interface WrestlingEvent {
  event_name: string;
  promotion: 'WWE' | 'AEW' | 'NXT' | 'TNA' | 'NJPW' | 'ROH';
  date: string;
  time_et: string;
  time_pt: string;
  time_cet: string;
  venue: string;
  city: string;
  network: string;
  event_type: 'weekly' | 'ppv' | 'special';
  match_card?: string[];
}
