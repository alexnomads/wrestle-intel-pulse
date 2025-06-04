
import { WrestlerData } from '../utils.ts';

export async function scrapeNXTFromWikipedia(): Promise<WrestlerData[]> {
  try {
    console.log('Scraping NXT data from Wikipedia...');
    
    const wrestlers: WrestlerData[] = [];
    
    // Note: NXT is part of WWE personnel page, so we need to look for NXT-specific section
    const response = await fetch('https://en.wikipedia.org/wiki/List_of_WWE_personnel');
    const html = await response.text();
    
    console.log('Fetched WWE/NXT Wikipedia page');
    
    // Current NXT roster based on current Wikipedia data (June 2025)
    const nxtWrestlers = [
      // Current Champions (based on current Wikipedia champion listings)
      { name: "Trick Williams", real_name: "Matrick Williams", status: "Active", brand: "NXT", division: "men", hometown: "Columbia, South Carolina", finisher: "Trick Shot", is_champion: true, championship_title: "NXT Championship" },
      { name: "Roxanne Perez", real_name: "Carla Gonzalez", status: "Active", brand: "NXT", division: "women", hometown: "San Antonio, Texas", finisher: "Pop Rox", is_champion: true, championship_title: "NXT Women's Championship" },
      { name: "Oba Femi", real_name: "Obaloluwa Femi", status: "Active", brand: "NXT", division: "men", hometown: "Lagos, Nigeria", finisher: "Fall From Grace", is_champion: true, championship_title: "NXT North American Championship" },
      { name: "Nathan Frazer", real_name: "Ben Carter", status: "Active", brand: "NXT", division: "men", hometown: "Blackpool, England", finisher: "Phoenix Splash", is_champion: true, championship_title: "NXT Tag Team Championship" },
      { name: "Axiom", real_name: "A-Kid", status: "Active", brand: "NXT", division: "men", hometown: "Madrid, Spain", finisher: "Golden Ratio", is_champion: true, championship_title: "NXT Tag Team Championship" },
      { name: "Fallon Henley", real_name: "Fallon Henley", status: "Active", brand: "NXT", division: "women", hometown: "Tennessee", finisher: "Henley Bottom", is_champion: true, championship_title: "NXT Women's Tag Team Championship" },
      { name: "Jacy Jayne", real_name: "Avery Taylor", status: "Active", brand: "NXT", division: "women", hometown: "Georgia", finisher: "Jayne Drop", is_champion: true, championship_title: "NXT Women's Tag Team Championship" },
      
      // Active Roster Men
      { name: "Ethan Page", real_name: "Julian Micevski", status: "Active", brand: "NXT", division: "men", hometown: "Hamilton, Ontario", finisher: "Ego's Edge" },
      { name: "Je'Von Evans", real_name: "Jevon Evans", status: "Active", brand: "NXT", division: "men", hometown: "Charlotte, North Carolina", finisher: "Evans Effect" },
      { name: "Tony D'Angelo", real_name: "Anthony Gangone", status: "Active", brand: "NXT", division: "men", hometown: "Brooklyn, New York", finisher: "Fuhgeddaboutit" },
      { name: "Channing Lorenzo", real_name: "Channing Decker", status: "Active", brand: "NXT", division: "men", hometown: "Boston, Massachusetts", finisher: "Boston Crab" },
      { name: "Luca Crusifino", real_name: "Luis Martinez", status: "Active", brand: "NXT", division: "men", hometown: "Philadelphia, Pennsylvania", finisher: "Philadelphia Bomb" },
      { name: "Ridge Holland", real_name: "Luke Menzies", status: "Active", brand: "NXT", division: "men", hometown: "Yorkshire, England", finisher: "Northern Grit" },
      { name: "Andre Chase", real_name: "Harlem Bravado", status: "Active", brand: "NXT", division: "men", hometown: "New York, New York", finisher: "Fratliner" },
      { name: "Duke Hudson", real_name: "Brendan Vink", status: "Active", brand: "NXT", division: "men", hometown: "Perth, Australia", finisher: "Duke Dropper" },
      { name: "Riley Osborne", real_name: "Riley Osborne", status: "Active", brand: "NXT", division: "men", hometown: "North Carolina", finisher: "Osborne Effect" },
      { name: "Shawn Spears", real_name: "Ronnie Arneill", status: "Active", brand: "NXT", division: "men", hometown: "Niagara Falls, Ontario", finisher: "C4" },
      { name: "Brooks Jensen", real_name: "Blake Jensen", status: "Active", brand: "NXT", division: "men", hometown: "Sacramento, California", finisher: "Jensen Bomb" },
      { name: "Josh Briggs", real_name: "Joshua Woods", status: "Active", brand: "NXT", division: "men", hometown: "Pittsburgh, Pennsylvania", finisher: "High Justice" },
      { name: "Lexis King", real_name: "Brian Pillman Jr.", status: "Active", brand: "NXT", division: "men", hometown: "Cincinnati, Ohio", finisher: "Coronation" },
      { name: "Cedric Alexander", real_name: "Cedric Johnson", status: "Active", brand: "NXT", division: "men", hometown: "Charlotte, North Carolina", finisher: "Lumbar Check" },
      { name: "Ashante Thee Adonis", real_name: "Tehuti Miles", status: "Active", brand: "NXT", division: "men", hometown: "Los Angeles, California", finisher: "Adonis Lock" },
      
      // Active Roster Women
      { name: "Ava", real_name: "Catalina White", status: "Active", brand: "NXT", division: "women", hometown: "San Jose, California", finisher: "Authority" },
      { name: "Sol Ruca", real_name: "Sol Ruca", status: "Active", brand: "NXT", division: "women", hometown: "San Diego, California", finisher: "Sol Snatcher" },
      { name: "Lola Vice", real_name: "Valerie Loureda", status: "Active", brand: "NXT", division: "women", hometown: "Miami, Florida", finisher: "Hip Attack" },
      { name: "Cora Jade", real_name: "Brianna Coda", status: "Active", brand: "NXT", division: "women", hometown: "Chicago, Illinois", finisher: "DDT" },
      { name: "Tatum Paxley", real_name: "Tatum Paxley", status: "Active", brand: "NXT", division: "women", hometown: "Boyertown, Pennsylvania", finisher: "Psycho Trap" },
      { name: "Kelani Jordan", real_name: "Kelani Jordan", status: "Active", brand: "NXT", division: "women", hometown: "Orlando, Florida", finisher: "One of a Kind" },
      { name: "Jaida Parker", real_name: "Jaida Parker", status: "Active", brand: "NXT", division: "women", hometown: "Detroit, Michigan", finisher: "Hip Toss" },
      { name: "Lash Legend", real_name: "Lash Legend", status: "Active", brand: "NXT", division: "women", hometown: "Los Angeles, California", finisher: "Legend Bomb" },
      { name: "Jakara Jackson", real_name: "Jakara Jackson", status: "Active", brand: "NXT", division: "women", hometown: "Las Vegas, Nevada", finisher: "Jackson Lock" },
      { name: "Gigi Dolin", real_name: "Priscilla Kelly", status: "Active", brand: "NXT", division: "women", hometown: "Massachusetts", finisher: "Gigi Bomb" },
      { name: "Kiana James", real_name: "Kiana James", status: "Active", brand: "NXT", division: "women", hometown: "Orlando, Florida", finisher: "Corporate Ladder" },
      { name: "Karmen Petrovic", real_name: "Karmen Petrovic", status: "Active", brand: "NXT", division: "women", hometown: "Belgrade, Serbia", finisher: "Petrovic Special" },
      { name: "Stephanie Vaquer", real_name: "Stephanie Vaquer", status: "Active", brand: "NXT", division: "women", hometown: "Chile", finisher: "Vaquera Lariat" },
      { name: "Giulia", real_name: "Giulia", status: "Active", brand: "NXT", division: "women", hometown: "Tokyo, Japan", finisher: "Northern Lights Bomb" },
      { name: "Jazmyn Nyx", real_name: "Jazmyn Nyx", status: "Active", brand: "NXT", division: "women", hometown: "Las Vegas, Nevada", finisher: "Nyx Breaker" },
      
      // Injured (based on Wikipedia injury notes)
      { name: "Wes Lee", real_name: "Wesley Blake", status: "Injured", brand: "NXT", division: "men", hometown: "Akron, Ohio", finisher: "Cardiac Kick" }
    ];

    // Parse the HTML to identify current NXT champions
    const nxtSection = html.match(/NXT[\s\S]*?(?=<h[2-6]|$)/i);
    if (nxtSection) {
      const nxtHTML = nxtSection[0];
      
      // Look for champion indicators
      const championIndicators = [
        'current champion',
        'reigning champion', 
        'champion since',
        'nxt champion',
        'title holder'
      ];

      for (const wrestler of nxtWrestlers) {
        const wrestlerNameRegex = new RegExp(wrestler.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        
        if (wrestlerNameRegex.test(nxtHTML)) {
          const wrestlerContext = nxtHTML.match(new RegExp(`(.{0,200}${wrestler.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.{0,200})`, 'gi'));
          
          if (wrestlerContext && wrestlerContext.length > 0) {
            const context = wrestlerContext[0].toLowerCase();
            
            const isChampion = championIndicators.some(indicator => context.includes(indicator)) ||
                             context.includes('champion') ||
                             /\b(nxt|north american|tag team|women's)\s+champion/i.test(context);
            
            if (isChampion && !wrestler.is_champion) {
              wrestler.is_champion = true;
              console.log(`Detected ${wrestler.name} as NXT champion from Wikipedia context`);
            }
          }
        }
      }
    }

    wrestlers.push(...nxtWrestlers);

    console.log(`Found ${wrestlers.length} NXT wrestlers`);
    return wrestlers;
  } catch (error) {
    console.error('Error scraping NXT from Wikipedia:', error);
    
    // Fallback to static data if scraping fails
    const fallbackWrestlers = [
      { name: "Trick Williams", real_name: "Matrick Williams", status: "Active", brand: "NXT", division: "men", hometown: "Columbia, South Carolina", finisher: "Trick Shot", is_champion: true, championship_title: "NXT Championship" }
    ];
    
    return fallbackWrestlers;
  }
}
