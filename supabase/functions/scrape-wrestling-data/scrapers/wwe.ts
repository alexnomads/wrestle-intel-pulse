
import { WrestlerData } from '../utils.ts';

export async function scrapeWWEFromWikipedia(): Promise<WrestlerData[]> {
  try {
    console.log('Scraping WWE data from Wikipedia...');
    
    const wrestlers: WrestlerData[] = [];
    
    // Fetch current WWE roster from Wikipedia
    const response = await fetch('https://en.wikipedia.org/wiki/List_of_WWE_personnel');
    const html = await response.text();
    
    console.log('Fetched WWE Wikipedia page successfully');
    
    // Extract current champions from the page
    const championMatches = html.match(/([A-Za-z\s]+)\s*(?:–|—|\(c\)|\(champion\)|is the current|reigning|defending)\s*(?:WWE|World|Intercontinental|United States|Women's|Tag Team|NXT)\s*(?:Champion|Championship)/gi);
    
    let detectedChampions: string[] = [];
    if (championMatches) {
      detectedChampions = championMatches.map(match => {
        const nameMatch = match.match(/^([A-Za-z\s]+)/);
        return nameMatch ? nameMatch[1].trim() : '';
      }).filter(name => name.length > 0);
      console.log('Detected champions from Wikipedia:', detectedChampions);
    }

    // Current WWE roster with updated championship detection
    const wweWrestlers = [
      // Main Event Scene
      { name: "Cody Rhodes", real_name: "Cody Garrett Runnels", status: "Active", brand: "WWE", division: "men", hometown: "Marietta, Georgia", finisher: "Cross Rhodes" },
      { name: "Gunther", real_name: "Walter Hahn", status: "Active", brand: "WWE", division: "men", hometown: "Vienna, Austria", finisher: "Powerbomb" },
      { name: "Roman Reigns", real_name: "Joe Anoa'i", status: "Active", brand: "WWE", division: "men", hometown: "Pensacola, Florida", finisher: "Superman Punch, Spear" },
      { name: "Seth Rollins", real_name: "Colby Daniel Lopez", status: "Active", brand: "WWE", division: "men", hometown: "Davenport, Iowa", finisher: "Stomp" },
      { name: "CM Punk", real_name: "Phillip Jack Brooks", status: "Active", brand: "WWE", division: "men", hometown: "Chicago, Illinois", finisher: "GTS" },
      { name: "Drew McIntyre", real_name: "Andrew McLean Galloway IV", status: "Active", brand: "WWE", division: "men", hometown: "Ayr, Scotland", finisher: "Claymore Kick" },

      // Women's Division
      { name: "Rhea Ripley", real_name: "Demi Bennett", status: "Active", brand: "WWE", division: "women", hometown: "Adelaide, Australia", finisher: "Riptide" },
      { name: "Nia Jax", real_name: "Savelina Fanene", status: "Active", brand: "WWE", division: "women", hometown: "Sydney, Australia", finisher: "Annihilator" },
      { name: "Bianca Belair", real_name: "Bianca Nicole Blair", status: "Active", brand: "WWE", division: "women", hometown: "Knoxville, Tennessee", finisher: "KOD" },
      { name: "Jade Cargill", real_name: "Jade Cargill", status: "Active", brand: "WWE", division: "women", hometown: "Gifford, Florida", finisher: "Jaded" },
      { name: "Bayley", real_name: "Pamela Rose Martinez", status: "Active", brand: "WWE", division: "women", hometown: "San Jose, California", finisher: "Bayley-to-Belly" },
      { name: "Liv Morgan", real_name: "Gionna Jene Daddio", status: "Active", brand: "WWE", division: "women", hometown: "Paramus, New Jersey", finisher: "ObLIVion" },
      { name: "IYO SKY", real_name: "Masami Odate", status: "Active", brand: "WWE", division: "women", hometown: "Tokyo, Japan", finisher: "Over the Moonsault" },
      { name: "Tiffany Stratton", real_name: "Tiffany Nieves", status: "Active", brand: "WWE", division: "women", hometown: "Orlando, Florida", finisher: "Prettiest Moonsault Ever" },

      // Mid-Card and Rising Stars
      { name: "Bron Breakker", real_name: "Bronson Rechsteiner", status: "Active", brand: "WWE", division: "men", hometown: "Acworth, Georgia", finisher: "Spear" },
      { name: "LA Knight", real_name: "Shaun Ricker", status: "Active", brand: "WWE", division: "men", hometown: "Los Angeles, California", finisher: "BFT" },
      { name: "Damian Priest", real_name: "Luis Martinez", status: "Active", brand: "WWE", division: "men", hometown: "New York City, New York", finisher: "South of Heaven" },
      { name: "Finn Balor", real_name: "Fergal Devitt", status: "Active", brand: "WWE", division: "men", hometown: "Bray, Ireland", finisher: "Coup de Grace" },
      { name: "JD McDonagh", real_name: "Jordan Devlin", status: "Active", brand: "WWE", division: "men", hometown: "Dublin, Ireland", finisher: "Devil Inside" },
      { name: "Dominik Mysterio", real_name: "Dominik Gutierrez", status: "Active", brand: "WWE", division: "men", hometown: "San Diego, California", finisher: "South of Heaven" },
      { name: "Rey Mysterio", real_name: "Oscar Gutierrez", status: "Active", brand: "WWE", division: "men", hometown: "San Diego, California", finisher: "619" },
      { name: "The Miz", real_name: "Michael Mizanin", status: "Active", brand: "WWE", division: "men", hometown: "Cleveland, Ohio", finisher: "Skull Crushing Finale" },
      { name: "Kevin Owens", real_name: "Kevin Yanick Steen", status: "Active", brand: "WWE", division: "men", hometown: "Marieville, Quebec", finisher: "Stunner" },
      { name: "Carmelo Hayes", real_name: "Carmelo Anthony Hayes", status: "Active", brand: "WWE", division: "men", hometown: "Worcester, Massachusetts", finisher: "Nothing But Net" },
      { name: "Andrade", real_name: "Manuel Alfonso Andrade Oropeza", status: "Active", brand: "WWE", division: "men", hometown: "Gomez Palacio, Mexico", finisher: "Hammerlock DDT" },
      { name: "Chad Gable", real_name: "Charles Betts", status: "Active", brand: "WWE", division: "men", hometown: "Minneapolis, Minnesota", finisher: "Ankle Lock" },
      { name: "Bronson Reed", real_name: "Jermaine Haley", status: "Active", brand: "WWE", division: "men", hometown: "Adelaide, Australia", finisher: "Tsunami" },
      { name: "Pete Dunne", real_name: "Peter England", status: "Active", brand: "WWE", division: "men", hometown: "Birmingham, England", finisher: "Bitter End" },
      { name: "Sheamus", real_name: "Stephen Farrelly", status: "Active", brand: "WWE", division: "men", hometown: "Dublin, Ireland", finisher: "Brogue Kick" },
      { name: "Ludwig Kaiser", real_name: "Marcel Barthel", status: "Active", brand: "WWE", division: "men", hometown: "Dresden, Germany", finisher: "Kaiser Roll" },
      { name: "Giovanni Vinci", real_name: "Fabian Aichner", status: "Active", brand: "WWE", division: "men", hometown: "South Tyrol, Italy", finisher: "Lariat" },
      { name: "Ilja Dragunov", real_name: "Ilja Rukober", status: "Active", brand: "WWE", division: "men", hometown: "Moscow, Russia", finisher: "Torpedo Moscow" },

      // Tag Teams and Others
      { name: "Johnny Gargano", real_name: "John Anthony Nicholas Gargano Jr.", status: "Active", brand: "WWE", division: "men", hometown: "Cleveland, Ohio", finisher: "Garga-No Escape" },
      { name: "Tommaso Ciampa", real_name: "Tommaso Whitney", status: "Active", brand: "WWE", division: "men", hometown: "Boston, Massachusetts", finisher: "Fairy Tale Ending" },
      { name: "Alex Shelley", real_name: "Patrick Martin", status: "Active", brand: "WWE", division: "men", hometown: "Detroit, Michigan", finisher: "Sliced Bread #2" },
      { name: "Chris Sabin", real_name: "Joshua Harter", status: "Active", brand: "WWE", division: "men", hometown: "Detroit, Michigan", finisher: "Cradle Shock" },
      { name: "Solo Sikoa", real_name: "Joseph Fatu", status: "Active", brand: "WWE", division: "men", hometown: "Pensacola, Florida", finisher: "Samoan Spike" },
      { name: "Jacob Fatu", real_name: "Jacob Fatu", status: "Active", brand: "WWE", division: "men", hometown: "San Francisco, California", finisher: "Moonsault" },
      { name: "Tama Tonga", real_name: "Alipate Aloisio Leone", status: "Active", brand: "WWE", division: "men", hometown: "Tonga", finisher: "Gun Stun" },
      { name: "Tonga Loa", real_name: "Tevita Tu'amoeloa Fetaiakimoeata Fifita", status: "Active", brand: "WWE", division: "men", hometown: "Tonga", finisher: "Tongan Death Grip" },
      
      // More Women's Division
      { name: "Dakota Kai", real_name: "Cheree Crowley", status: "Active", brand: "WWE", division: "women", hometown: "Auckland, New Zealand", finisher: "Kairopractor" },
      { name: "Kairi Sane", real_name: "Kaori Housako", status: "Active", brand: "WWE", division: "women", hometown: "Hikari, Japan", finisher: "InSane Elbow" },
      { name: "Shayna Baszler", real_name: "Shayna Andrea Baszler", status: "Active", brand: "WWE", division: "women", hometown: "Sioux Falls, South Dakota", finisher: "Kirifuda Clutch" },
      { name: "Zoey Stark", real_name: "Theresa Serrano", status: "Active", brand: "WWE", division: "women", hometown: "Las Vegas, Nevada", finisher: "Z360" },
      { name: "Raquel Rodriguez", real_name: "Victoria Gonzalez", status: "Active", brand: "WWE", division: "women", hometown: "Cedar Park, Texas", finisher: "Texana Bomb" },
      { name: "Naomi", real_name: "Trinity McCray", status: "Active", brand: "WWE", division: "women", hometown: "Sanford, Florida", finisher: "Rear View" },
      { name: "Candice LeRae", real_name: "Candice Gargano", status: "Active", brand: "WWE", division: "women", hometown: "Riverside, California", finisher: "Garga-No Escape" },
      { name: "Chelsea Green", real_name: "Chelsea Anne Green", status: "Active", brand: "WWE", division: "women", hometown: "Victoria, British Columbia", finisher: "Unprettier" },
      { name: "Lyra Valkyria", real_name: "Aoife Cusack", status: "Active", brand: "WWE", division: "women", hometown: "Dublin, Ireland", finisher: "Night Wing" },
      { name: "Piper Niven", real_name: "Kimberly Benson", status: "Active", brand: "WWE", division: "women", hometown: "Ayrshire, Scotland", finisher: "Piper Driver" },

      // Veterans and Part-Time
      { name: "R-Truth", real_name: "Ron Killings", status: "Active", brand: "WWE", division: "men", hometown: "Charlotte, North Carolina", finisher: "Attitude Adjustment" },
      { name: "Carlito", real_name: "Carlos Colon Jr.", status: "Active", brand: "WWE", division: "men", hometown: "San Juan, Puerto Rico", finisher: "Backstabber" },
      { name: "Dragon Lee", real_name: "Rush Gonzalez", status: "Active", brand: "WWE", division: "men", hometown: "Mexico City, Mexico", finisher: "Knee Trembler" },
      { name: "Santos Escobar", real_name: "Jorge Luis Alvarado Ibarra", status: "Active", brand: "WWE", division: "men", hometown: "Mexico City, Mexico", finisher: "Phantom Driver" },
      { name: "Apollo Crews", real_name: "Uhaa Nation", status: "Active", brand: "WWE", division: "men", hometown: "Sacramento, California", finisher: "Gorilla Press Powerslam" },
      { name: "Baron Corbin", real_name: "Thomas Pestock", status: "Active", brand: "WWE", division: "men", hometown: "Kansas City, Missouri", finisher: "End of Days" },
      { name: "Otis", real_name: "Nikola Bogojević", status: "Active", brand: "WWE", division: "men", hometown: "Minneapolis, Minnesota", finisher: "Caterpillar" },
      { name: "Akira Tozawa", real_name: "Akira Tozawa", status: "Active", brand: "WWE", division: "men", hometown: "Osaka, Japan", finisher: "Senton Bomb" },

      // Injured/Part-Time
      { name: "Randy Orton", real_name: "Randal Keith Orton", status: "Active", brand: "WWE", division: "men", hometown: "St. Louis, Missouri", finisher: "RKO" }
    ];

    // Now check each wrestler against the detected champions and HTML content
    for (const wrestler of wweWrestlers) {
      // Check if wrestler name appears in detected champions
      const isDetectedChampion = detectedChampions.some(champion => 
        champion.toLowerCase().includes(wrestler.name.toLowerCase()) || 
        wrestler.name.toLowerCase().includes(champion.toLowerCase())
      );

      // Also check the HTML content for championship context
      const wrestlerNameRegex = new RegExp(wrestler.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      let championshipTitle = null;
      let isChampion = false;

      if (wrestlerNameRegex.test(html)) {
        const wrestlerContext = html.match(new RegExp(`(.{0,500}${wrestler.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.{0,500})`, 'gi'));
        
        if (wrestlerContext && wrestlerContext.length > 0) {
          const context = wrestlerContext[0].toLowerCase();
          
          // Check for championship indicators
          if (context.includes('wwe championship') || context.includes('wwe champion')) {
            isChampion = true;
            championshipTitle = "WWE Championship";
          } else if (context.includes('world heavyweight championship') || context.includes('world heavyweight champion')) {
            isChampion = true;
            championshipTitle = "World Heavyweight Championship";
          } else if (context.includes('intercontinental championship') || context.includes('intercontinental champion')) {
            isChampion = true;
            championshipTitle = "Intercontinental Championship";
          } else if (context.includes('united states championship') || context.includes('united states champion')) {
            isChampion = true;
            championshipTitle = "United States Championship";
          } else if (context.includes('women\'s championship') && context.includes('wwe')) {
            isChampion = true;
            championshipTitle = "WWE Women's Championship";
          } else if (context.includes('women\'s world championship')) {
            isChampion = true;
            championshipTitle = "Women's World Championship";
          } else if (context.includes('tag team championship') && context.includes('world')) {
            isChampion = true;
            championshipTitle = "World Tag Team Championship";
          } else if (context.includes('women\'s tag team championship')) {
            isChampion = true;
            championshipTitle = "WWE Women's Tag Team Championship";
          }
        }
      }

      // If detected as champion but no specific title found, mark as champion
      if (isDetectedChampion && !isChampion) {
        isChampion = true;
        championshipTitle = "Champion";
      }

      wrestler.is_champion = isChampion;
      wrestler.championship_title = championshipTitle;

      if (isChampion) {
        console.log(`Detected ${wrestler.name} as WWE champion with title: ${championshipTitle}`);
      }
    }

    wrestlers.push(...wweWrestlers);

    console.log(`Found ${wrestlers.length} WWE wrestlers, ${wrestlers.filter(w => w.is_champion).length} champions`);
    return wrestlers;
  } catch (error) {
    console.error('Error scraping WWE from Wikipedia:', error);
    
    // Fallback to static data if scraping fails
    const fallbackWrestlers = [
      { name: "Cody Rhodes", real_name: "Cody Garrett Runnels", status: "Active", brand: "WWE", division: "men", hometown: "Marietta, Georgia", finisher: "Cross Rhodes", is_champion: true, championship_title: "WWE Championship" },
      { name: "Gunther", real_name: "Walter Hahn", status: "Active", brand: "WWE", division: "men", hometown: "Vienna, Austria", finisher: "Powerbomb", is_champion: true, championship_title: "World Heavyweight Championship" }
    ];
    
    return fallbackWrestlers;
  }
}
