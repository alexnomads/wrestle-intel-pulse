
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
    
    // Parse wrestler data from the HTML more efficiently
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
    // Find sections for men's and women's divisions more efficiently
    const menSectionMatch = html.match(/<span[^>]*class="mw-headline"[^>]*id="Men's_division"[^>]*>/i);
    const womenSectionMatch = html.match(/<span[^>]*class="mw-headline"[^>]*id="Women's_division"[^>]*>/i);
    
    const menSectionStart = menSectionMatch ? menSectionMatch.index || 0 : 0;
    const womenSectionStart = womenSectionMatch ? womenSectionMatch.index || html.length : html.length;
    
    // Extract men's division wrestlers
    if (menSectionStart < womenSectionStart) {
      const menSection = html.substring(menSectionStart, womenSectionStart);
      const menWrestlers = extractWrestlersFromSection(menSection, 'men');
      wrestlers.push(...menWrestlers);
      console.log(`Found ${menWrestlers.length} men's division wrestlers`);
    }
    
    // Extract women's division wrestlers
    if (womenSectionStart < html.length) {
      const womenSection = html.substring(womenSectionStart);
      const womenWrestlers = extractWrestlersFromSection(womenSection, 'women');
      wrestlers.push(...womenWrestlers);
      console.log(`Found ${womenWrestlers.length} women's division wrestlers`);
    }
    
    // If we didn't get enough results, try alternative parsing
    if (wrestlers.length < 20) {
      console.log('Low wrestler count, trying alternative parsing...');
      const alternativeWrestlers = parseAlternativeStructure(html);
      wrestlers.push(...alternativeWrestlers);
    }
    
    return wrestlers;
    
  } catch (error) {
    console.error('Error parsing AEW Wikipedia page:', error);
    return [];
  }
}

function extractWrestlersFromSection(sectionHtml: string, division: 'men' | 'women'): WrestlerData[] {
  const wrestlers: WrestlerData[] = [];
  
  // Look for table rows with wrestler information
  const tableRowPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let match;
  
  while ((match = tableRowPattern.exec(sectionHtml)) !== null && wrestlers.length < 50) {
    const rowContent = match[1];
    
    // Extract wrestler name from links
    const nameMatch = rowContent.match(/<a[^>]*href="\/wiki\/([^"]*)"[^>]*title="([^"]*)"[^>]*>([^<]+)<\/a>/);
    if (nameMatch) {
      const ringName = nameMatch[3].trim();
      const realName = nameMatch[2].trim();
      
      if (isValidWrestlerName(ringName)) {
        // Extract additional info from table cells
        const cells = rowContent.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
        let status = 'Active';
        
        // Check for status indicators in the row
        const rowText = rowContent.toLowerCase();
        if (rowText.includes('injured') || rowText.includes('injury')) {
          status = 'Injured';
        } else if (rowText.includes('suspended')) {
          status = 'Suspended';
        } else if (rowText.includes('released') || rowText.includes('departed')) {
          status = 'Released';
        }
        
        const wrestler: WrestlerData = {
          name: ringName,
          real_name: realName !== ringName ? realName : null,
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
        console.log(`Added AEW wrestler: ${ringName} (${division})`);
      }
    }
    
    // Prevent infinite loops
    if (wrestlers.length >= 100) break;
  }
  
  return wrestlers;
}

function parseAlternativeStructure(html: string): WrestlerData[] {
  const wrestlers: WrestlerData[] = [];
  
  // Look for wrestler names in list items or simpler structures
  const listItemPattern = /<li[^>]*>[\s\S]*?<a[^>]*href="\/wiki\/[^"]*"[^>]*title="([^"]*)"[^>]*>([^<]+)<\/a>[\s\S]*?<\/li>/gi;
  let match;
  
  while ((match = listItemPattern.exec(html)) !== null && wrestlers.length < 50) {
    const realName = match[1].trim();
    const ringName = match[2].trim();
    
    if (isValidWrestlerName(ringName)) {
      const division = inferDivision(ringName, realName);
      
      wrestlers.push({
        name: ringName,
        real_name: realName !== ringName ? realName : null,
        status: 'Active',
        brand: 'AEW',
        division: division,
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
}

function isValidWrestlerName(name: string): boolean {
  if (!name || name.length < 2 || name.length > 50) return false;
  
  const excludeTerms = [
    'championship', 'title', 'match', 'event', 'show', 'network',
    'episode', 'season', 'year', 'month', 'week', 'time', 'date',
    'wikipedia', 'edit', 'source', 'reference', 'category', 'template',
    'all elite wrestling', 'dynamite', 'rampage', 'collision', 'roster',
    'division', 'personnel', 'staff', 'executive', 'announcer'
  ];
  
  const lowerName = name.toLowerCase();
  for (const term of excludeTerms) {
    if (lowerName.includes(term)) return false;
  }
  
  // Must start with capital letter
  if (!/^[A-Z]/.test(name)) return false;
  
  // Check for reasonable word count
  const words = name.split(' ').filter(w => w.length > 0);
  if (words.length < 1 || words.length > 4) return false;
  
  return true;
}

function inferDivision(ringName: string, realName?: string): 'men' | 'women' {
  const femaleNames = [
    'toni storm', 'mercedes moné', 'jamie hayter', 'britt baker', 'hikaru shida',
    'riho', 'yuka sakazaki', 'nyla rose', 'jade cargill', 'kris statlander',
    'anna jay', 'serena deeb', 'willow nightingale', 'skye blue', 'ruby soho',
    'penelope ford', 'red velvet', 'thunder rosa', 'athena', 'julia hart',
    'emi sakura', 'queen aminata', 'kamille', 'deonna purrazzo', 'diamanté',
    'rachael ellering', 'leila grey', 'harley cameron', 'viva van', 'thekla',
    'kiera hogan', 'madison rayne', 'megan bayne'
  ];
  
  const searchText = `${ringName} ${realName || ''}`.toLowerCase();
  
  // Check against known female wrestlers
  for (const femaleName of femaleNames) {
    if (searchText.includes(femaleName)) {
      return 'women';
    }
  }
  
  // Check for female indicators in names
  const femaleIndicators = [
    'woman', 'lady', 'girl', 'queen', 'princess', 'duchess', 'miss', 'mrs'
  ];
  
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
      is_champion: false,
      championship_title: null
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
      is_champion: false,
      championship_title: null
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
      is_champion: false,
      championship_title: null
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
