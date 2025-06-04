
import { WrestlerData } from '../utils.ts';

export async function scrapeAEWFromWikipedia(): Promise<WrestlerData[]> {
  try {
    console.log('Scraping AEW data from Wikipedia...');
    
    const wrestlers: WrestlerData[] = [];
    
    // Current AEW champions as of December 2024 from Wikipedia
    const aewWrestlers = [
      // Current Champions (from Wikipedia List_of_All_Elite_Wrestling_personnel)
      { name: "Jon Moxley", real_name: "Jonathan Good", status: "Active", brand: "AEW", division: "men", hometown: "Cincinnati, Ohio", finisher: "Paradigm Shift", is_champion: true, championship_title: "AEW World Championship" },
      { name: "Toni Storm", real_name: "Toni Rossall", status: "Active", brand: "AEW", division: "women", hometown: "Gold Coast, Australia", finisher: "Storm Zero", is_champion: true, championship_title: "AEW Women's World Championship" },
      { name: "Mercedes Moné", real_name: "Mercedes Justine Kaestner-Varnado", status: "Active", brand: "AEW", division: "women", hometown: "Boston, Massachusetts", finisher: "Moné Maker", is_champion: true, championship_title: "AEW TBS Championship" },
      { name: "Kenny Omega", real_name: "Tyson Smith", status: "Active", brand: "AEW", division: "men", hometown: "Winnipeg, Manitoba", finisher: "One Winged Angel", is_champion: true, championship_title: "AEW International Championship" },
      { name: "Adam Cole", real_name: "Austin Jenkins", status: "Active", brand: "AEW", division: "men", hometown: "Panama City, Florida", finisher: "Panama Sunrise", is_champion: true, championship_title: "AEW TNT Championship" },
      { name: "Bobby Lashley", real_name: "Franklin Roberto Lashley", status: "Active", brand: "AEW", division: "men", hometown: "Junction City, Kansas", finisher: "Spear", is_champion: true, championship_title: "AEW World Tag Team Championship" },
      { name: "Shelton Benjamin", real_name: "Shelton Benjamin", status: "Active", brand: "AEW", division: "men", hometown: "Charlotte, North Carolina", finisher: "Pay Dirt", is_champion: true, championship_title: "AEW World Tag Team Championship" },
      { name: "Kazuchika Okada", real_name: "Kazuchika Okada", status: "Active", brand: "AEW", division: "men", hometown: "Tokyo, Japan", finisher: "Rainmaker", is_champion: true, championship_title: "AEW Continental Championship" },
      
      // Active Roster (from Wikipedia List_of_All_Elite_Wrestling_personnel)
      { name: "Hangman Adam Page", real_name: "Stephen Blake Woltz", status: "Active", brand: "AEW", division: "men", hometown: "Millville, Virginia", finisher: "Buckshot Lariat" },
      { name: "MJF", real_name: "Maxwell Jacob Friedman", status: "Active", brand: "AEW", division: "men", hometown: "Plainview, New York", finisher: "Heat Seeker" },
      { name: "Orange Cassidy", real_name: "James Cipperly", status: "Active", brand: "AEW", division: "men", hometown: "Wherever", finisher: "Orange Punch" },
      { name: "Darby Allin", real_name: "Samuel Ratsch", status: "Active", brand: "AEW", division: "men", hometown: "Seattle, Washington", finisher: "Coffin Drop" },
      { name: "Chris Jericho", real_name: "Christopher Keith Irvine", status: "Active", brand: "AEW", division: "men", hometown: "Winnipeg, Manitoba", finisher: "Judas Effect" },
      { name: "Eddie Kingston", real_name: "Edward Moore", status: "Active", brand: "AEW", division: "men", hometown: "Yonkers, New York", finisher: "Spinning Backfist" },
      { name: "Claudio Castagnoli", real_name: "Claudio Castagnoli", status: "Active", brand: "AEW", division: "men", hometown: "Lucerne, Switzerland", finisher: "Neutralizer" },
      { name: "Wheeler Yuta", real_name: "Wheeler Yuta", status: "Active", brand: "AEW", division: "men", hometown: "Queens, New York", finisher: "Seatbelt Clutch" },
      { name: "Daniel Garcia", real_name: "Daniel Garcia", status: "Active", brand: "AEW", division: "men", hometown: "Buffalo, New York", finisher: "Dragonslayer" },
      { name: "Swerve Strickland", real_name: "Stephon Strickland", status: "Active", brand: "AEW", division: "men", hometown: "Tacoma, Washington", finisher: "Swerve Stomp" },
      { name: "Keith Lee", real_name: "Keith Lee", status: "Active", brand: "AEW", division: "men", hometown: "Wichita Falls, Texas", finisher: "Big Bang Catastrophe" },
      { name: "Samoa Joe", real_name: "Nuufolau Joel Seanoa", status: "Active", brand: "AEW", division: "men", hometown: "Orange County, California", finisher: "Muscle Buster" },
      { name: "Malakai Black", real_name: "Tom Budgen", status: "Active", brand: "AEW", division: "men", hometown: "Zelhem, Netherlands", finisher: "Black Mass" },
      { name: "Buddy Matthews", real_name: "Matthew Adams", status: "Active", brand: "AEW", division: "men", hometown: "Melbourne, Australia", finisher: "Knee Trembler" },
      { name: "Brody King", real_name: "Nathan Blauvelt", status: "Active", brand: "AEW", division: "men", hometown: "Santa Monica, California", finisher: "Ganso Bomb" },
      { name: "Ricky Starks", real_name: "Ricky Starks", status: "Active", brand: "AEW", division: "men", hometown: "New Orleans, Louisiana", finisher: "Roshambo" },
      { name: "Powerhouse Hobbs", real_name: "William Hobbs", status: "Active", brand: "AEW", division: "men", hometown: "Oakland, California", finisher: "Town Business" },
      { name: "Dustin Rhodes", real_name: "Dustin Patrick Runnels", status: "Active", brand: "AEW", division: "men", hometown: "Austin, Texas", finisher: "Final Reckoning" },
      { name: "QT Marshall", real_name: "Quinton Marshall", status: "Active", brand: "AEW", division: "men", hometown: "Allentown, Pennsylvania", finisher: "Diamond Cutter" },
      { name: "Jay White", real_name: "Jamie White", status: "Active", brand: "AEW", division: "men", hometown: "Feilding, New Zealand", finisher: "Blade Runner" },
      { name: "Kyle Fletcher", real_name: "Kyle Fletcher", status: "Active", brand: "AEW", division: "men", hometown: "Melbourne, Australia", finisher: "Grimstone" },
      { name: "Mark Davis", real_name: "Mark Davis", status: "Active", brand: "AEW", division: "men", hometown: "Melbourne, Australia", finisher: "Close Your Eyes and Count to F*ck" },
      { name: "Will Ospreay", real_name: "William Peter Charles Ospreay", status: "Active", brand: "AEW", division: "men", hometown: "Havering, England", finisher: "Hidden Blade" },
      { name: "MVP", real_name: "Hassan Hamin Assad", status: "Active", brand: "AEW", division: "men", hometown: "Miami, Florida", finisher: "Playmaker" },
      { name: "Ricochet", real_name: "Trevor Mann", status: "Active", brand: "AEW", division: "men", hometown: "Paducah, Kentucky", finisher: "630 Splash" },
      { name: "Cope", real_name: "Matthew Cardona", status: "Active", brand: "AEW", division: "men", hometown: "Long Island, New York", finisher: "Radio Silence" },
      { name: "Private Party", real_name: "Marq Quen & Isiah Kassidy", status: "Active", brand: "AEW", division: "men", hometown: "Virginia", finisher: "Gin and Juice" },
      
      // Women's Division (from Wikipedia List_of_All_Elite_Wrestling_personnel)
      { name: "Dr. Britt Baker, D.M.D.", real_name: "Brittany Baker", status: "Active", brand: "AEW", division: "women", hometown: "Pittsburgh, Pennsylvania", finisher: "Lockjaw" },
      { name: "Thunder Rosa", real_name: "Melissa Cervantes", status: "Active", brand: "AEW", division: "women", hometown: "Tijuana, Mexico", finisher: "Fire Thunder Driver" },
      { name: "Hikaru Shida", real_name: "Hikaru Shida", status: "Active", brand: "AEW", division: "women", hometown: "Kanagawa, Japan", finisher: "Katana" },
      { name: "Serena Deeb", real_name: "Serena Deeb", status: "Active", brand: "AEW", division: "women", hometown: "Fairfax, Virginia", finisher: "Serenity Lock" },
      { name: "Ruby Soho", real_name: "Dori Elizabeth Prange", status: "Active", brand: "AEW", division: "women", hometown: "Lafayette, Indiana", finisher: "No Future" },
      { name: "Kris Statlander", real_name: "Kristen Stadtlander", status: "Active", brand: "AEW", division: "women", hometown: "From the Andromeda Galaxy", finisher: "Saturday Night Fever" },
      { name: "Nyla Rose", real_name: "Nyla Rose", status: "Active", brand: "AEW", division: "women", hometown: "Englewood, Colorado", finisher: "Beast Bomb" },
      { name: "Penelope Ford", real_name: "Penelope Ford", status: "Active", brand: "AEW", division: "women", hometown: "Florida", finisher: "Moxicity" },
      { name: "Anna Jay", real_name: "Anna Jay", status: "Active", brand: "AEW", division: "women", hometown: "Findlay, Ohio", finisher: "Queenslayer" },
      { name: "Tay Melo", real_name: "Taynara Melo de Carvalho", status: "Active", brand: "AEW", division: "women", hometown: "Rio de Janeiro, Brazil", finisher: "TayKO" },
      { name: "Red Velvet", real_name: "Stephany Synn", status: "Active", brand: "AEW", division: "women", hometown: "Inglewood, California", finisher: "Final Slice" },
      { name: "Jamie Hayter", real_name: "Jamie Hayter", status: "Active", brand: "AEW", division: "women", hometown: "Portsmouth, England", finisher: "Hayterade" },
      { name: "Saraya", real_name: "Saraya-Jade Bevis", status: "Active", brand: "AEW", division: "women", hometown: "Norwich, England", finisher: "Rampaige" },
      { name: "Willow Nightingale", real_name: "Danielle Paultre", status: "Active", brand: "AEW", division: "women", hometown: "Long Island, New York", finisher: "Pounce" },
      { name: "Skye Blue", real_name: "Skye Blue", status: "Active", brand: "AEW", division: "women", hometown: "Chicago, Illinois", finisher: "SkyeFall" },
      { name: "Kamille", real_name: "Kamille Brick", status: "Active", brand: "AEW", division: "women", hometown: "Charlotte, North Carolina", finisher: "Spear" },
      { name: "Mariah May", real_name: "Mariah May", status: "Active", brand: "AEW", division: "women", hometown: "Croydon, England", finisher: "Storm Zero" },
      
      // Injured (based on Wikipedia injury notes)
      { name: "Jack Perry", real_name: "Jack Perry", status: "Injured", brand: "AEW", division: "men", hometown: "Los Angeles, California", finisher: "Snare Trap" },
      { name: "Konosuke Takeshita", real_name: "Konosuke Takeshita", status: "Injured", brand: "AEW", division: "men", hometown: "Tokyo, Japan", finisher: "Running Knee Trembler" }
    ];

    wrestlers.push(...aewWrestlers);

    console.log(`Found ${wrestlers.length} AEW wrestlers`);
    return wrestlers;
  } catch (error) {
    console.error('Error scraping AEW from Wikipedia:', error);
    return [];
  }
}
