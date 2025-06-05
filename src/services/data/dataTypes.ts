
// Core data type definitions for wrestling data services

export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  contentSnippet: string;
  source: string;
  guid: string;
  author?: string;
  category?: string;
}

export interface RedditPost {
  title: string;
  url: string;
  created_utc: number;
  score: number;
  num_comments: number;
  author: string;
  subreddit: string;
  selftext: string;
  permalink: string;
}

export interface WrestlenomicsData {
  tvRatings: TVRating[];
  ticketSales: TicketData[];
  eloRankings: ELORanking[];
}

export interface TVRating {
  show: string;
  date: string;
  rating: number;
  viewership: number;
  network: string;
}

export interface TicketData {
  event: string;
  venue: string;
  date: string;
  capacity: number;
  sold: number;
  attendance_percentage: number;
}

export interface ELORanking {
  wrestler: string;
  elo_rating: number;
  promotion: string;
  rank: number;
  trend: 'up' | 'down' | 'stable';
}
