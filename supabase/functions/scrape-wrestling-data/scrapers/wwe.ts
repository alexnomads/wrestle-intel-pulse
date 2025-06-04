
import { WrestlerData } from '../utils.ts';

export async function scrapeWWEFromWikipedia(): Promise<WrestlerData[]> {
  try {
    console.log('Scraping WWE data from Wikipedia...');
    
    const wrestlers: WrestlerData[] = [];
    
    // Fetch current WWE roster from Wikipedia with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const response = await fetch('https://en.wikipedia.org/wiki/List_of_WWE_personnel', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    console.log('Fetched WWE Wikipedia page successfully');
    
    // Parse the HTML to extract wrestler information
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Find all wrestler entries in tables
    const tables = doc.querySelectorAll('table.wikitable');
    const championshipMap = new Map<string, string>();
    
    // First pass: identify current champions from the page
    for (const table of tables) {
      const rows = table.querySelectorAll('tr');
      
      for (const row of rows) {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 2) {
          const nameCell = cells[0];
          const notesCell = cells[cells.length - 1]; // Usually the last cell contains notes/status
          
          if (nameCell && notesCell) {
            const nameText = nameCell.textContent?.trim() || '';
            const notesText = notesCell.textContent?.trim().toLowerCase() || '';
            
            // Clean wrestler name (remove extra formatting)
            const cleanName = nameText.replace(/\([^)]*\)/g, '').trim();
            
            // Check for championship indicators in notes/status
            if (notesText.includes('champion') || notesText.includes('title')) {
              if (notesText.includes('wwe championship') || notesText.includes('wwe champion')) {
                championshipMap.set(cleanName, 'WWE Championship');
              } else if (notesText.includes('world heavyweight championship') || notesText.includes('world heavyweight champion')) {
                championshipMap.set(cleanName, 'World Heavyweight Championship');
              } else if (notesText.includes('intercontinental championship') || notesText.includes('intercontinental champion')) {
                championshipMap.set(cleanName, 'Intercontinental Championship');
              } else if (notesText.includes('united states championship') || notesText.includes('united states champion') || notesText.includes('us champion')) {
                championshipMap.set(cleanName, 'United States Championship');
              } else if (notesText.includes('world tag team championship') || notesText.includes('tag team champion')) {
                championshipMap.set(cleanName, 'World Tag Team Championship');
              } else if (notesText.includes("women's championship") || notesText.includes("women's champion")) {
                if (notesText.includes('wwe women')) {
                  championshipMap.set(cleanName, 'WWE Women\'s Championship');
                } else if (notesText.includes('world')) {
                  championshipMap.set(cleanName, 'Women\'s World Championship');
                } else if (notesText.includes('tag team')) {
                  championshipMap.set(cleanName, 'WWE Women\'s Tag Team Championship');
                }
              }
            }
          }
        }
      }
    }
    
    console.log(`Found ${championshipMap.size} potential champions from Wikipedia parsing`);
    championshipMap.forEach((title, name) => {
      console.log(`Champion found: ${name} - ${title}`);
    });
    
    // Now scrape wrestler roster information
    for (const table of tables) {
      const rows = table.querySelectorAll('tr');
      
      for (const row of rows) {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 2) {
          const nameCell = cells[0];
          const ringNameText = nameCell?.textContent?.trim() || '';
          
          if (ringNameText && !ringNameText.includes('Name') && ringNameText.length > 1) {
            // Clean the name
            const cleanName = ringNameText.replace(/\([^)]*\)/g, '').trim();
            
            // Skip if it's a header or empty
            if (cleanName.toLowerCase().includes('wrestler') || cleanName.toLowerCase().includes('name') || cleanName === '') {
              continue;
            }
            
            // Check if this wrestler is a champion
            const isChampion = championshipMap.has(cleanName);
            const championshipTitle = championshipMap.get(cleanName) || null;
            
            // Extract additional information from other cells if available
            let realName = cleanName;
            let brand = 'WWE';
            let status = 'Active';
            let division = 'men'; // Default, can be updated based on championships
            
            // Try to extract real name from parentheses in original text
            const realNameMatch = ringNameText.match(/\(([^)]+)\)/);
            if (realNameMatch) {
              realName = realNameMatch[1];
            }
            
            // Determine division based on championship
            if (championshipTitle && championshipTitle.toLowerCase().includes('women')) {
              division = 'women';
            }
            
            const wrestlerData: WrestlerData = {
              name: cleanName,
              real_name: realName,
              status: status,
              brand: brand,
              division: division,
              hometown: '', // Will be empty for now
              finisher: '', // Will be empty for now
              is_champion: isChampion,
              championship_title: championshipTitle
            };
            
            wrestlers.push(wrestlerData);
          }
        }
      }
    }
    
    // Remove duplicates based on name
    const uniqueWrestlers = wrestlers.filter((wrestler, index, self) => 
      index === self.findIndex(w => w.name.toLowerCase() === wrestler.name.toLowerCase())
    );
    
    const champions = uniqueWrestlers.filter(w => w.is_champion);
    
    console.log(`Found ${uniqueWrestlers.length} total WWE wrestlers`);
    console.log(`Found ${champions.length} WWE champions`);
    
    champions.forEach(champion => {
      console.log(`Champion: ${champion.name} - ${champion.championship_title}`);
    });
    
    return uniqueWrestlers;
    
  } catch (error) {
    console.error('Error scraping WWE from Wikipedia:', error);
    
    // Return empty array instead of fallback data to force real-time scraping
    console.log('Returning empty array to force real-time data fetching');
    return [];
  }
}
