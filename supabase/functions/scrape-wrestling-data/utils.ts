
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export interface WrestlerData {
  name: string;
  real_name?: string;
  status: string;
  brand?: string;
  division: string;
  height?: string;
  weight?: string;
  hometown?: string;
  finisher?: string;
  image_url?: string;
  profile_url?: string;
  is_champion?: boolean;
  championship_title?: string;
}
