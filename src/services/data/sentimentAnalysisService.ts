
// Simple sentiment analysis and wrestler mention extraction
export interface SentimentResult {
  score: number; // 0-1 scale where 0.5 is neutral
  magnitude: number;
}

// Simple keyword-based sentiment analysis
export const analyzeSentiment = (text: string): SentimentResult => {
  if (!text || text.trim().length === 0) {
    return { score: 0.5, magnitude: 0 };
  }

  const positiveWords = [
    'champion', 'winner', 'victory', 'successful', 'amazing', 'great', 'excellent',
    'outstanding', 'impressive', 'dominant', 'powerful', 'strong', 'talented',
    'skilled', 'push', 'rising', 'star', 'featured', 'main event', 'title shot',
    'breakthrough', 'momentum', 'hot', 'over', 'popular', 'crowd favorite'
  ];

  const negativeWords = [
    'lost', 'defeated', 'failed', 'terrible', 'awful', 'bad', 'worst',
    'weak', 'buried', 'jobber', 'squash', 'destruction', 'dominated',
    'crushed', 'embarrassed', 'humiliated', 'flop', 'boring', 'stale',
    'heat', 'go away', 'change channel', 'bathroom break', 'boring'
  ];

  const words = text.toLowerCase().split(/\s+/);
  let positiveScore = 0;
  let negativeScore = 0;

  words.forEach(word => {
    if (positiveWords.some(pos => word.includes(pos))) {
      positiveScore++;
    }
    if (negativeWords.some(neg => word.includes(neg))) {
      negativeScore++;
    }
  });

  const totalWords = words.length;
  const magnitude = (positiveScore + negativeScore) / totalWords;
  
  // Calculate sentiment score (0-1 scale)
  let score = 0.5; // neutral
  if (positiveScore > negativeScore) {
    score = 0.5 + (positiveScore / (positiveScore + negativeScore)) * 0.4;
  } else if (negativeScore > positiveScore) {
    score = 0.5 - (negativeScore / (positiveScore + negativeScore)) * 0.4;
  }

  return {
    score: Math.max(0, Math.min(1, score)),
    magnitude: Math.max(0, Math.min(1, magnitude))
  };
};

// Comprehensive wrestler name database for accurate extraction
const WRESTLER_DATABASE = [
  // WWE Main Roster
  'Roman Reigns', 'Cody Rhodes', 'Seth Rollins', 'Drew McIntyre', 'CM Punk', 'John Cena',
  'Gunther', 'Damian Priest', 'Rhea Ripley', 'Bianca Belair', 'Becky Lynch', 'Bayley',
  'Liv Morgan', 'Dominik Mysterio', 'Finn Balor', 'JD McDonagh', 'Carlito', 'Rey Mysterio',
  'Kevin Owens', 'Randy Orton', 'LA Knight', 'Logan Paul', 'Jey Uso', 'Jimmy Uso',
  'Solo Sikoa', 'Tama Tonga', 'Tonga Loa', 'Jacob Fatu', 'Bron Breakker', 'Sheamus',
  'Ludwig Kaiser', 'Giovanni Vinci', 'Ilja Dragunov', 'Ricochet', 'Chad Gable',
  'Otis', 'Akira Tozawa', 'Xavier Woods', 'Kofi Kingston', 'Big E', 'Apollo Crews',
  'Baron Corbin', 'Bobby Lashley', 'Braun Strowman', 'Bronson Reed', 'Pete Dunne',
  'Tyler Bate', 'Butch', 'Ridge Holland', 'Elias', 'Matt Riddle', 'Shinsuke Nakamura',
  
  // WWE Women
  'Nia Jax', 'Tiffany Stratton', 'Candice LeRae', 'Indi Hartwell', 'Shayna Baszler',
  'Zoey Stark', 'Raquel Rodriguez', 'Dakota Kai', 'IYO SKY', 'Kairi Sane', 'Asuka',
  'Chelsea Green', 'Piper Niven', 'Blair Davenport', 'Natalya', 'Tamina', 'Naomi',
  'Jade Cargill', 'Michin', 'B-Fab', 'Katana Chance', 'Kayden Carter', 'Lyra Valkyria',
  
  // WWE NXT
  'Trick Williams', 'Roxanne Perez', 'Oba Femi', 'Kelani Jordan', 'Je\'Von Evans',
  'Ethan Page', 'Wes Lee', 'Nathan Frazer', 'Axiom', 'Joe Coffey', 'Mark Coffey',
  'Wolfgang', 'Gallus', 'Brooks Jensen', 'Josh Briggs', 'Fallon Henley', 'Kiana James',
  'Sol Ruca', 'Lash Legend', 'Jakara Jackson', 'Lola Vice', 'Jaida Parker', 'Jacy Jayne',
  'Gigi Dolin', 'Cora Jade', 'Thea Hail', 'Javier Bernal', 'Damon Kemp', 'Andre Chase',
  'Duke Hudson', 'Riley Osborne', 'Oro Mensah', 'Noam Dar', 'Dragon Lee', 'Hank Walker',
  
  // AEW Roster
  'Jon Moxley', 'Kenny Omega', 'Chris Jericho', 'Adam Cole', 'MJF', 'Hangman Page',
  'Will Ospreay', 'Orange Cassidy', 'Darby Allin', 'Sting', 'Christian Cage', 'Edge',
  'FTR', 'Dax Harwood', 'Cash Wheeler', 'Young Bucks', 'Matt Jackson', 'Nick Jackson',
  'Lucha Brothers', 'Rey Fenix', 'Penta El Zero M', 'House of Black', 'Malakai Black',
  'Brody King', 'Buddy Matthews', 'Julia Hart', 'Wardlow', 'Powerhouse Hobbs',
  'Ricky Starks', 'Hook', 'Jack Perry', 'Daniel Garcia', 'Wheeler Yuta', 'Claudio Castagnoli',
  'Jon Moxley', 'Eddie Kingston', 'Samoa Joe', 'Keith Lee', 'Swerve Strickland',
  'AR Fox', 'Top Flight', 'Dante Martin', 'Darius Martin', 'Private Party', 'Isiah Kassidy',
  'Marq Quen', 'Best Friends', 'Chuck Taylor', 'Trent Beretta', 'Kris Statlander',
  
  // AEW Women
  'Mercedes Moné', 'Toni Storm', 'Mariah May', 'Jamie Hayter', 'Britt Baker',
  'Thunder Rosa', 'Ruby Soho', 'Saraya', 'Athena', 'Jade Cargill', 'Kris Statlander',
  'Willow Nightingale', 'Skye Blue', 'Anna Jay', 'Tay Melo', 'Penelope Ford',
  'Abadon', 'Red Velvet', 'Leyla Hirsch', 'Hikaru Shida', 'Riho', 'Yuka Sakazaki',
  'Emi Sakura', 'Serena Deeb', 'Madison Rayne', 'KiLynn King', 'Diamante',
  
  // Impact Wrestling
  'Moose', 'Eddie Edwards', 'Rich Swann', 'Sami Callihan', 'Jordynne Grace',
  'Knockouts Champion', 'World Champion', 'X-Division Champion', 'Ace Austin',
  'Chris Bey', 'Mike Bailey', 'Trey Miguel', 'Zachary Wentz', 'Gisele Shaw',
  'Masha Slamovich', 'Alisha Edwards', 'Savannah Evans', 'Jai Vidal', 'Laredo Kid',
  'Joe Hendry', 'Ryan Nemeth', 'Frankie Kazarian', 'Christopher Daniels', 'Matt Cardona',
  
  // NJPW
  'Will Ospreay', 'Hiroshi Tanahashi', 'Kazuchika Okada', 'Tetsuya Naito', 'Kota Ibushi',
  'Tomohiro Ishii', 'Hirooki Goto', 'YOSHI-HASHI', 'Tama Tonga', 'Tanga Loa',
  'Bad Luck Fale', 'Chase Owens', 'Yujiro Takahashi', 'KENTA', 'Taiji Ishimori',
  'El Phantasmo', 'Robbie Eagles', 'Francesco Akira', 'TJP', 'Clark Connors',
  'Hiroyoshi Tenzan', 'Satoshi Kojima', 'Yuji Nagata', 'Manabu Nakanishi', 'Togi Makabe',
  
  // Independent/Other Promotions
  'Nick Gage', 'Matt Cardona', 'Effy', 'Allie Katch', 'Joey Janela', 'Mick Foley',
  'AJ Styles', 'Samoa Joe', 'Christopher Daniels', 'Frankie Kazarian', 'Low Ki',
  'Amazing Red', 'Sonjay Dutt', 'Jay Lethal', 'Consequences Creed', 'Suicide',
  'Austin Aries', 'Bobby Roode', 'James Storm', 'Robert Roode', 'Eric Young',
  
  // Legends/Part-time
  'The Undertaker', 'Kane', 'Triple H', 'Shawn Michaels', 'Stone Cold Steve Austin',
  'The Rock', 'Dwayne Johnson', 'Mick Foley', 'Mankind', 'Cactus Jack', 'Bret Hart',
  'Hulk Hogan', 'Andre the Giant', 'Macho Man Randy Savage', 'Ultimate Warrior',
  'Jake Roberts', 'Roddy Piper', 'Ric Flair', 'Dusty Rhodes', 'Harley Race',
  'Nick Bockwinkel', 'Verne Gagne', 'Bruno Sammartino', 'Bob Backlund', 'Pedro Morales'
];

// Organizations to exclude from wrestler extraction
const WRESTLING_ORGANIZATIONS = [
  'WWE', 'AEW', 'TNA', 'IMPACT', 'NJPW', 'ROH', 'NXT', 'ECW', 'WCW', 'WWF',
  'Ring of Honor', 'All Elite Wrestling', 'World Wrestling Entertainment',
  'New Japan Pro Wrestling', 'Total Nonstop Action', 'Extreme Championship Wrestling',
  'World Championship Wrestling', 'Monday Night Raw', 'Friday Night SmackDown',
  'AEW Dynamite', 'AEW Rampage', 'AEW Collision', 'WWE Raw', 'WWE SmackDown',
  'WrestleMania', 'SummerSlam', 'Royal Rumble', 'Survivor Series', 'Money in the Bank',
  'Hell in a Cell', 'Extreme Rules', 'TLC', 'Elimination Chamber', 'Fastlane',
  'All Out', 'Revolution', 'Double or Nothing', 'Full Gear', 'Forbidden Door',
  'Bound for Glory', 'Slammiversary', 'Genesis', 'Lockdown', 'Destination X',
  'Turning Point', 'Final Resolution', 'Against All Odds', 'Victory Road',
  'Hardcore Justice', 'No Surrender', 'Sacrifice', 'Rebellion', 'Redemption'
];

// Extract wrestler mentions from text with better accuracy
export const extractWrestlerMentions = (text: string): string[] => {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const mentions: string[] = [];
  const lowerText = text.toLowerCase();
  
  // Check against our wrestler database
  WRESTLER_DATABASE.forEach(wrestler => {
    const lowerWrestler = wrestler.toLowerCase();
    
    // Check for exact name match
    if (lowerText.includes(lowerWrestler)) {
      mentions.push(wrestler);
      return;
    }
    
    // Check for last name only (for common references)
    const nameParts = wrestler.split(' ');
    if (nameParts.length > 1) {
      const lastName = nameParts[nameParts.length - 1].toLowerCase();
      // Only match last name if it's distinctive (more than 4 characters)
      if (lastName.length > 4 && lowerText.includes(lastName)) {
        mentions.push(wrestler);
      }
    }
  });
  
  // Filter out organization names that might have been picked up
  const filteredMentions = mentions.filter(mention => {
    return !WRESTLING_ORGANIZATIONS.some(org => 
      org.toLowerCase() === mention.toLowerCase()
    );
  });
  
  // Remove duplicates and return
  return [...new Set(filteredMentions)];
};
