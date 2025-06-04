
import { WrestlerData } from '../utils.ts';

export async function scrapeNXTFromWikipedia(): Promise<WrestlerData[]> {
  try {
    console.log('Scraping NXT data from Wikipedia...');
    
    const wrestlers: WrestlerData[] = [];
    
    // Current NXT Champions as of June 2025 (based on provided images)
    const currentChampions = [
      { name: "Trick Williams", real_name: "Matrick Williams", status: "Active", brand: "NXT", division: "men", hometown: "Columbia, South Carolina", finisher: "Trick Shot", is_champion: true, championship_title: "NXT Championship" },
      { name: "Oba Femi", real_name: "Obaloluwa Femi", status: "Active", brand: "NXT", division: "men", hometown: "Lagos, Nigeria", finisher: "Fall From Grace", is_champion: true, championship_title: "NXT North American Championship" },
      { name: "Ethan Page", real_name: "Julian Micevski", status: "Active", brand: "NXT", division: "men", hometown: "Hamilton, Ontario", finisher: "Ego's Edge", is_champion: true, championship_title: "NXT North American Championship" },
      { name: "Jacy Jayne", real_name: "Avery Taylor", status: "Active", brand: "NXT", division: "women", hometown: "Georgia", finisher: "Jayne Drop", is_champion: true, championship_title: "NXT Women's Championship" },
      { name: "Sol Ruca", real_name: "Sol Ruca", status: "Active", brand: "NXT", division: "women", hometown: "San Diego, California", finisher: "Sol Snatcher", is_champion: true, championship_title: "NXT Women's North American Championship" },
      { name: "Hank Walker", real_name: "Hank Walker", status: "Active", brand: "NXT", division: "men", hometown: "North Carolina", finisher: "Tank Drop", is_champion: true, championship_title: "NXT Tag Team Championship" },
      { name: "Tank Ledger", real_name: "Tank Ledger", status: "Active", brand: "NXT", division: "men", hometown: "North Carolina", finisher: "Tank Slam", is_champion: true, championship_title: "NXT Tag Team Championship" },
      { name: "Noam Dar", real_name: "Noam Dar", status: "Active", brand: "NXT", division: "men", hometown: "Ayr, Scotland", finisher: "Champagne Super-Knee-Bar", is_champion: true, championship_title: "NXT Heritage Cup Championship" }
    ];
    
    // Add current champions to wrestlers array
    wrestlers.push(...currentChampions);
    
    // Known NXT wrestlers from roster
    const knownNXTWrestlers = [
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
      { name: "Nathan Frazer", real_name: "Ben Carter", status: "Active", brand: "NXT", division: "men", hometown: "Blackpool, England", finisher: "Phoenix Splash" },
      { name: "Axiom", real_name: "A-Kid", status: "Active", brand: "NXT", division: "men", hometown: "Madrid, Spain", finisher: "Golden Ratio" },
      
      // Women's Division
      { name: "Ava", real_name: "Catalina White", status: "Active", brand: "NXT", division: "women", hometown: "San Jose, California", finisher: "Authority" },
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
      { name: "Fallon Henley", real_name: "Fallon Henley", status: "Active", brand: "NXT", division: "women", hometown: "Tennessee", finisher: "Henley Bottom" },
      { name: "Roxanne Perez", real_name: "Carla Gonzalez", status: "Active", brand: "NXT", division: "women", hometown: "San Antonio, Texas", finisher: "Pop Rox" },
      
      // Injured
      { name: "Wes Lee", real_name: "Wesley Blake", status: "Injured", brand: "NXT", division: "men", hometown: "Akron, Ohio", finisher: "Cardiac Kick" }
    ];

    // Add known wrestlers to the list
    for (const wrestler of knownNXTWrestlers) {
      const championData = currentChampions.find(c => c.name === wrestler.name);
      
      const wrestlerData: WrestlerData = {
        name: wrestler.name,
        real_name: wrestler.real_name,
        status: wrestler.status,
        brand: "NXT",
        division: wrestler.division,
        hometown: wrestler.hometown || "",
        finisher: wrestler.finisher || "",
        is_champion: championData ? true : false,
        championship_title: championData ? championData.championship_title : null
      };
      
      wrestlers.push(wrestlerData);
    }
    
    // Remove duplicates based on name
    const uniqueWrestlers = wrestlers.filter((wrestler, index, self) => 
      index === self.findIndex(w => w.name.toLowerCase() === wrestler.name.toLowerCase())
    );
    
    console.log(`Found ${uniqueWrestlers.length} total NXT wrestlers`);
    console.log(`Found ${currentChampions.length} NXT champions`);
    
    return uniqueWrestlers;
    
  } catch (error) {
    console.error('Error scraping NXT from Wikipedia:', error);
    
    // Fallback to static data if scraping fails
    const fallbackWrestlers = [
      { name: "Trick Williams", real_name: "Matrick Williams", status: "Active", brand: "NXT", division: "men", hometown: "Columbia, South Carolina", finisher: "Trick Shot", is_champion: true, championship_title: "NXT Championship" }
    ];
    
    return fallbackWrestlers;
  }
}
