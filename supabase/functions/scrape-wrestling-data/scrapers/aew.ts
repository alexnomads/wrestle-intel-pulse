
import { WrestlerData } from '../utils.ts';

export async function scrapeAEWFromWikipedia(): Promise<WrestlerData[]> {
  try {
    console.log('Scraping AEW data from Wikipedia...');
    
    const wrestlers: WrestlerData[] = [];
    
    // Fetch the Wikipedia page for AEW personnel
    const response = await fetch('https://en.wikipedia.org/wiki/List_of_All_Elite_Wrestling_personnel', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Wrestling-Data-Scraper/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch AEW Wikipedia page:', response.status);
      return getFallbackAEWData();
    }

    const html = await response.text();
    console.log(`Retrieved AEW Wikipedia page, length: ${html.length}`);
    
    // Parse wrestler data from the HTML
    const parsedWrestlers = parseAEWWikipediaPage(html);
    wrestlers.push(...parsedWrestlers);
    
    console.log(`Successfully parsed ${wrestlers.length} AEW wrestlers from Wikipedia`);
    return wrestlers;
    
  } catch (error) {
    console.error('Error scraping AEW from Wikipedia:', error);
    return getFallbackAEWData();
  }
}

function parseAEWWikipediaPage(html: string): WrestlerData[] {
  const wrestlers: WrestlerData[] = [];
  
  try {
    // AEW Wikipedia page structure - look for roster tables
    const wrestlerPattern = /<tr[^>]*>[\s\S]*?<td[^>]*>[\s\S]*?<a[^>]*href="\/wiki\/[^"]*"[^>]*title="([^"]*)"[^>]*>([^<]+)<\/a>[\s\S]*?<\/td>[\s\S]*?<td[^>]*>([^<]*)<\/td>[\s\S]*?<\/tr>/gi;
    
    let match;
    let division = 'men'; // Default
    
    // Detect if we're in women's section
    const womenSectionPattern = /<span[^>]*class="mw-headline"[^>]*>.*?(?:Women|Female)/gi;
    const womenSectionMatch = womenSectionPattern.exec(html);
    const womenSectionStart = womenSectionMatch ? womenSectionMatch.index : -1;
    
    // Parse wrestler entries
    while ((match = wrestlerPattern.exec(html)) !== null) {
      const realName = match[1]?.trim() || '';
      const name = match[2]?.trim() || '';
      const notes = match[3]?.trim() || '';
      
      // Determine division based on position relative to women's section
      if (womenSectionStart > 0 && match.index > womenSectionStart) {
        division = 'women';
      } else {
        division = 'men';
      }
      
      // Determine status from notes
      let status = 'Active';
      if (notes.toLowerCase().includes('injured')) {
        status = 'Injured';
      } else if (notes.toLowerCase().includes('suspended')) {
        status = 'Suspended'; 
      } else if (notes.toLowerCase().includes('released')) {
        status = 'Released';
      }
      
      if (name && name.length > 2) {
        const wrestler: WrestlerData = {
          name: name,
          real_name: realName !== name ? realName : null,
          status: status,
          brand: 'AEW',
          division: division,
          hometown: '',
          finisher: '',
          height: '',
          weight: '',
          is_champion: false,
          championship_title: null
        };
        
        wrestlers.push(wrestler);
        console.log(`Added AEW wrestler: ${name} (${division})`);
      }
    }
    
    // If we didn't get many results, try alternative parsing
    if (wrestlers.length < 10) {
      console.log('Low AEW wrestler count, trying alternative parsing...');
      
      // Look for wrestler names in lists or alternative table structures
      const listPattern = /<li[^>]*>[\s\S]*?<a[^>]*href="\/wiki\/[^"]*"[^>]*title="([^"]*)"[^>]*>([^<]+)<\/a>[\s\S]*?<\/li>/gi;
      
      while ((match = listPattern.exec(html)) !== null) {
        const realName = match[1]?.trim() || '';
        const name = match[2]?.trim() || '';
        
        if (isLikelyWrestlerName(name)) {
          wrestlers.push({
            name: name,
            real_name: realName !== name ? realName : null,
            status: 'Active',
            brand: 'AEW',
            division: inferGender(name, realName),
            hometown: '',
            finisher: '',
            height: '',
            weight: '',
            is_champion: false,
            championship_title: null
          });
        }
      }
    }
    
    return wrestlers;
    
  } catch (error) {
    console.error('Error parsing AEW Wikipedia page:', error);
    return [];
  }
}

function isLikelyWrestlerName(name: string): boolean {
  const words = name.split(' ');
  
  if (words.length < 1 || words.length > 4) return false;
  if (name.length < 3 || name.length > 40) return false;
  
  const excludeTerms = [
    'championship', 'title', 'match', 'event', 'show', 'network',
    'episode', 'season', 'year', 'month', 'week', 'time', 'date',
    'wikipedia', 'edit', 'source', 'reference', 'category', 'template',
    'all elite wrestling', 'dynamite', 'rampage', 'collision'
  ];
  
  const lowerName = name.toLowerCase();
  for (const term of excludeTerms) {
    if (lowerName.includes(term)) return false;
  }
  
  if (!/^[A-Z]/.test(name)) return false;
  
  return true;
}

function inferGender(name: string, realName?: string): 'men' | 'women' {
  const femaleIndicators = [
    'woman', 'lady', 'girl', 'queen', 'princess', 'duchess', 'empress',
    'toni', 'storm', 'ruby', 'soho', 'jamie', 'hayter', 'britt', 'baker',
    'hikaru', 'shida', 'riho', 'yuka', 'sakazaki', 'nyla', 'rose',
    'jade', 'cargill', 'kris', 'statlander', 'anna', 'jay', 'serena',
    'deeb', 'mercedes', 'mone', 'willow', 'nightingale', 'skye', 'blue'
  ];
  
  const searchText = `${name} ${realName || ''}`.toLowerCase();
  
  for (const indicator of femaleIndicators) {
    if (searchText.includes(indicator)) {
      return 'women';
    }
  }
  
  return 'men';
}

function getFallbackAEWData(): WrestlerData[] {
  return [
    {
      name: "Jon Moxley",
      real_name: "Jonathan Good",
      status: "Active",
      brand: "AEW",
      division: "men",
      hometown: "Cincinnati, Ohio",
      finisher: "Paradigm Shift",
      height: "6'4\"",
      weight: "234 lbs",
      is_champion: true,
      championship_title: "AEW World Championship"
    },
    {
      name: "Kenny Omega",
      real_name: "Tyson Smith",
      status: "Active",
      brand: "AEW",
      division: "men", 
      hometown: "Winnipeg, Manitoba",
      finisher: "One Winged Angel",
      height: "6'0\"",
      weight: "200 lbs",
      is_champion: false,
      championship_title: null
    },
    {
      name: "Toni Storm",
      real_name: "Toni Rossall",
      status: "Active",
      brand: "AEW",
      division: "women",
      hometown: "Gold Coast, Australia",
      finisher: "Storm Zero",
      height: "5'6\"",
      weight: "137 lbs",
      is_champion: true,
      championship_title: "AEW Women's World Championship"
    },
    {
      name: "Mercedes Moné",
      real_name: "Mercedes Varnado",
      status: "Active",
      brand: "AEW",
      division: "women",
      hometown: "Boston, Massachusetts",
      finisher: "Moné Maker",
      height: "5'5\"",
      weight: "114 lbs",
      is_champion: true,
      championship_title: "AEW TBS Championship"
    },
    {
      name: "Will Ospreay",
      real_name: "William Peter Ospreay",
      status: "Active",
      brand: "AEW",
      division: "men",
      hometown: "Essex, England",
      finisher: "Hidden Blade",
      height: "6'0\"",
      weight: "202 lbs",
      is_champion: false,
      championship_title: null
    }
  ];
}
