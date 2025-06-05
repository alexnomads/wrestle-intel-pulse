
import { WrestlerData } from '../utils.ts';

export async function scrapeWWEFromWikipedia(): Promise<WrestlerData[]> {
  try {
    console.log('Scraping WWE data from Wikipedia...');
    
    const wrestlers: WrestlerData[] = [];
    
    // Fetch the Wikipedia page for WWE personnel
    const response = await fetch('https://en.wikipedia.org/wiki/List_of_WWE_personnel', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Wrestling-Data-Scraper/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch WWE Wikipedia page:', response.status);
      return getFallbackWWEData();
    }

    const html = await response.text();
    console.log(`Retrieved WWE Wikipedia page, length: ${html.length}`);
    
    // Parse wrestler data from the HTML
    const parsedWrestlers = parseWWEWikipediaPage(html);
    wrestlers.push(...parsedWrestlers);
    
    console.log(`Successfully parsed ${wrestlers.length} WWE wrestlers from Wikipedia`);
    return wrestlers;
    
  } catch (error) {
    console.error('Error scraping WWE from Wikipedia:', error);
    return getFallbackWWEData();
  }
}

function parseWWEWikipediaPage(html: string): WrestlerData[] {
  const wrestlers: WrestlerData[] = [];
  
  try {
    // Look for wrestler data in tables with specific patterns
    // WWE Wikipedia typically has tables for Raw, SmackDown, and other brands
    
    // Pattern 1: Standard wrestler table rows
    const wrestlerPattern = /<tr[^>]*>[\s\S]*?<td[^>]*>[\s\S]*?<a[^>]*title="([^"]+)"[^>]*>([^<]+)<\/a>[\s\S]*?<\/td>[\s\S]*?<td[^>]*>([^<]*)<\/td>[\s\S]*?<td[^>]*>([^<]*)<\/td>[\s\S]*?<\/tr>/gi;
    
    let match;
    let currentBrand = '';
    
    // Detect brand sections in the page
    const brandSectionPattern = /<span[^>]*class="mw-headline"[^>]*id="([^"]*)"[^>]*>([^<]*(?:Raw|SmackDown|NXT))/gi;
    let brandMatch;
    const brandPositions: { brand: string; position: number }[] = [];
    
    while ((brandMatch = brandSectionPattern.exec(html)) !== null) {
      brandPositions.push({
        brand: brandMatch[2].trim(),
        position: brandMatch.index
      });
    }
    
    // Parse wrestler entries
    while ((match = wrestlerPattern.exec(html)) !== null) {
      const name = match[2]?.trim() || '';
      const realName = match[1]?.trim() || '';
      const status = 'Active'; // Assume active if on current roster
      
      // Determine brand based on position in HTML
      let brand = 'WWE';
      for (const brandPos of brandPositions.reverse()) {
        if (match.index > brandPos.position) {
          brand = brandPos.brand;
          break;
        }
      }
      
      if (name && name.length > 2) {
        const wrestler: WrestlerData = {
          name: name,
          real_name: realName !== name ? realName : null,
          status: status,
          brand: brand,
          division: inferGender(name, realName),
          hometown: '',
          finisher: '',
          height: '',
          weight: '',
          is_champion: false,
          championship_title: null
        };
        
        wrestlers.push(wrestler);
        console.log(`Added WWE wrestler: ${name} (${brand})`);
      }
    }
    
    // If we didn't get many results, try alternative parsing
    if (wrestlers.length < 10) {
      console.log('Low wrestler count, trying alternative parsing...');
      
      // Look for simpler link patterns
      const simplePattern = /<a[^>]*href="\/wiki\/[^"]*"[^>]*title="([^"]+)"[^>]*>([^<]+)<\/a>/gi;
      const potentialWrestlers = new Set<string>();
      
      while ((match = simplePattern.exec(html)) !== null) {
        const title = match[1]?.trim() || '';
        const text = match[2]?.trim() || '';
        
        // Filter for likely wrestler names (avoid other Wikipedia links)
        if (isLikelyWrestlerName(text) && !title.includes('(wrestler)') === false) {
          potentialWrestlers.add(text);
        }
      }
      
      // Add potential wrestlers
      for (const name of Array.from(potentialWrestlers).slice(0, 50)) {
        wrestlers.push({
          name: name,
          real_name: null,
          status: 'Active',
          brand: 'WWE',
          division: inferGender(name),
          hometown: '',
          finisher: '',
          height: '',
          weight: '',
          is_champion: false,
          championship_title: null
        });
      }
    }
    
    return wrestlers;
    
  } catch (error) {
    console.error('Error parsing WWE Wikipedia page:', error);
    return [];
  }
}

function isLikelyWrestlerName(name: string): boolean {
  // Basic heuristics for wrestler names
  const words = name.split(' ');
  
  // Must be 1-4 words
  if (words.length < 1 || words.length > 4) return false;
  
  // Must be reasonable length
  if (name.length < 3 || name.length > 40) return false;
  
  // Exclude common non-wrestler terms
  const excludeTerms = [
    'championship', 'title', 'match', 'event', 'show', 'network',
    'episode', 'season', 'year', 'month', 'week', 'time', 'date',
    'wikipedia', 'edit', 'source', 'reference', 'category', 'template'
  ];
  
  const lowerName = name.toLowerCase();
  for (const term of excludeTerms) {
    if (lowerName.includes(term)) return false;
  }
  
  // Must start with capital letter
  if (!/^[A-Z]/.test(name)) return false;
  
  return true;
}

function inferGender(name: string, realName?: string): 'men' | 'women' {
  const femaleIndicators = [
    'woman', 'lady', 'girl', 'queen', 'princess', 'duchess', 'empress',
    // Common female wrestler names/nicknames
    'rhea', 'bianca', 'becky', 'charlotte', 'sasha', 'bayley', 'asuka',
    'alexa', 'nikki', 'brie', 'naomi', 'zelina', 'dakota', 'toni',
    'candice', 'indi', 'raquel', 'shayna', 'ronda', 'liv', 'dana'
  ];
  
  const searchText = `${name} ${realName || ''}`.toLowerCase();
  
  for (const indicator of femaleIndicators) {
    if (searchText.includes(indicator)) {
      return 'women';
    }
  }
  
  return 'men'; // Default to men's division
}

function getFallbackWWEData(): WrestlerData[] {
  // Fallback data based on known current WWE roster
  return [
    {
      name: "Roman Reigns",
      real_name: "Leati Joseph Anoa'i",
      status: "Active",
      brand: "SmackDown",
      division: "men",
      hometown: "Pensacola, Florida",
      finisher: "Spear",
      height: "6'3\"",
      weight: "265 lbs",
      is_champion: true,
      championship_title: "Undisputed WWE Championship"
    },
    {
      name: "CM Punk",
      real_name: "Phil Brooks",
      status: "Active", 
      brand: "Raw",
      division: "men",
      hometown: "Chicago, Illinois",
      finisher: "GTS",
      height: "6'2\"",
      weight: "218 lbs",
      is_champion: false,
      championship_title: null
    },
    {
      name: "Cody Rhodes",
      real_name: "Cody Garrett Runnels",
      status: "Active",
      brand: "SmackDown", 
      division: "men",
      hometown: "Marietta, Georgia",
      finisher: "Cross Rhodes",
      height: "6'1\"",
      weight: "225 lbs",
      is_champion: false,
      championship_title: null
    },
    {
      name: "Rhea Ripley",
      real_name: "Demi Bennett",
      status: "Active",
      brand: "Raw",
      division: "women",
      hometown: "Adelaide, Australia", 
      finisher: "Riptide",
      height: "5'7\"",
      weight: "137 lbs",
      is_champion: false,
      championship_title: null
    },
    {
      name: "Bianca Belair",
      real_name: "Bianca Crawford",
      status: "Active",
      brand: "SmackDown",
      division: "women",
      hometown: "Knoxville, Tennessee",
      finisher: "K.O.D.",
      height: "5'7\"", 
      weight: "165 lbs",
      is_champion: false,
      championship_title: null
    }
  ];
}
