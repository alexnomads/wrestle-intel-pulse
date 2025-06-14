
export interface TwitterAccount {
  username: string;
  displayName: string;
  type: 'wrestler' | 'federation' | 'journalist' | 'insider' | 'legend' | 'community';
  active: boolean;
  priority?: 'high' | 'medium' | 'low';
  verified?: boolean;
}

// Comprehensive wrestling accounts (synchronized from twitterService)
export const WRESTLING_ACCOUNTS: TwitterAccount[] = [
  // Core wrestling federations and news
  { username: 'WWE', displayName: 'WWE', type: 'federation', active: true, priority: 'high', verified: true },
  { username: 'AEW', displayName: 'All Elite Wrestling', type: 'federation', active: true, priority: 'high', verified: true },
  { username: 'njpw1972', displayName: 'NJPW', type: 'federation', active: true, priority: 'high', verified: true },
  { username: 'ThisIsTNA', displayName: 'TNA Wrestling', type: 'federation', active: true, priority: 'high', verified: true },
  
  // Wrestling Journalists & Insiders
  { username: 'SeanRossSapp', displayName: 'Sean Ross Sapp', type: 'journalist', active: true, priority: 'high', verified: true },
  { username: 'WrestleVotes', displayName: 'WrestleVotes', type: 'insider', active: true, priority: 'high', verified: false },
  { username: 'davemeltzerWON', displayName: 'Dave Meltzer', type: 'journalist', active: true, priority: 'high', verified: true },
  { username: 'ryansatin', displayName: 'Ryan Satin', type: 'journalist', active: true, priority: 'high', verified: true },
  { username: 'MikeJohnson_pwtorch', displayName: 'Mike Johnson', type: 'journalist', active: true, priority: 'high', verified: true },
  { username: 'WrestlingInc', displayName: 'Wrestling Inc', type: 'journalist', active: true, priority: 'medium', verified: true },
  { username: 'Fightful', displayName: 'Fightful', type: 'journalist', active: true, priority: 'medium', verified: true },
  
  // Major Wrestling Stars
  { username: 'TrueKofi', displayName: 'Kofi Kingston', type: 'wrestler', active: true, priority: 'high', verified: true },
  { username: 'joehendry', displayName: 'Joe Hendry', type: 'wrestler', active: true, priority: 'medium', verified: false },
  { username: 'briancagegmsi', displayName: 'Brian Cage', type: 'wrestler', active: true, priority: 'medium', verified: false },
  { username: 'JohnCena', displayName: 'John Cena', type: 'wrestler', active: true, priority: 'high', verified: true },
  { username: 'LanceHoyt', displayName: 'Lance Hoyt', type: 'wrestler', active: true, priority: 'medium', verified: false },
  { username: 'theflipgordon', displayName: 'Flip Gordon', type: 'wrestler', active: true, priority: 'medium', verified: false },
  { username: 'Therealrvd', displayName: 'Rob Van Dam', type: 'legend', active: true, priority: 'high', verified: true },
  { username: 'nikkita_wwe', displayName: 'Nikkita Lyons', type: 'wrestler', active: true, priority: 'medium', verified: false },
  { username: 'ZelinaVegaWWE', displayName: 'Zelina Vega', type: 'wrestler', active: true, priority: 'medium', verified: true },
  { username: 'realkillerkross', displayName: 'Killer Kross', type: 'wrestler', active: true, priority: 'medium', verified: false },
  { username: 'MiaYim', displayName: 'Mia Yim', type: 'wrestler', active: true, priority: 'medium', verified: false },
  { username: 'RefBaeDaphWWE', displayName: 'Daphanie LaShaunn', type: 'wrestler', active: true, priority: 'low', verified: false },
  { username: 'SpeedballBailey', displayName: 'Speedball Bailey', type: 'wrestler', active: true, priority: 'medium', verified: false },
  { username: 'TheLethalJay', displayName: 'Jay Lethal', type: 'wrestler', active: true, priority: 'medium', verified: false },
  { username: 'TheREALRIKISHI', displayName: 'Rikishi', type: 'legend', active: true, priority: 'medium', verified: true },
  { username: 'RealBillyGunn', displayName: 'Billy Gunn', type: 'legend', active: true, priority: 'medium', verified: true },
  { username: 'theraveneffect', displayName: 'Raven', type: 'legend', active: true, priority: 'medium', verified: false },
  { username: 'RealDDP', displayName: 'Diamond Dallas Page', type: 'legend', active: true, priority: 'medium', verified: true },
  { username: 'ScottSteiner', displayName: 'Scott Steiner', type: 'legend', active: true, priority: 'medium', verified: false },
  { username: 'zena_wwe', displayName: 'Zena Sterling', type: 'wrestler', active: true, priority: 'low', verified: false },
  { username: 'TheTrinity_Fatu', displayName: 'Trinity Fatu', type: 'wrestler', active: true, priority: 'medium', verified: false },
  { username: 'TheDariaRae', displayName: 'Daria Rae', type: 'wrestler', active: true, priority: 'low', verified: false },
  { username: 'RealIslaDawn', displayName: 'Isla Dawn', type: 'wrestler', active: true, priority: 'low', verified: false },
  { username: 'BlakeMonroeWWE', displayName: 'Blake Monroe', type: 'wrestler', active: true, priority: 'low', verified: false },
  { username: 'Steph_Vaquer', displayName: 'Stephanie Vaquer', type: 'wrestler', active: true, priority: 'medium', verified: false },
  { username: 'kelani_wwe', displayName: 'Kelani Jordan', type: 'wrestler', active: true, priority: 'medium', verified: false },
  { username: 'RealKingRegal', displayName: 'William Regal', type: 'legend', active: true, priority: 'high', verified: true },
  { username: '_Theory1', displayName: 'Theory', type: 'wrestler', active: true, priority: 'medium', verified: true },
  { username: 'PeteDunneYxB', displayName: 'Pete Dunne', type: 'wrestler', active: true, priority: 'medium', verified: false },
  { username: 'SuperKingofBros', displayName: 'Matt Riddle', type: 'wrestler', active: true, priority: 'medium', verified: false },
  { username: 'Aleister_Blxck', displayName: 'Aleister Black', type: 'wrestler', active: true, priority: 'medium', verified: false },
  { username: 'TheSamiCallihan', displayName: 'Sami Callihan', type: 'wrestler', active: true, priority: 'medium', verified: false },
  { username: 'DEATHxWALKS', displayName: 'Malakai Black', type: 'wrestler', active: true, priority: 'medium', verified: false },
  { username: 'RicFlairNatrBoy', displayName: 'Ric Flair', type: 'legend', active: true, priority: 'high', verified: true },
  { username: 'StuBennett', displayName: 'Wade Barrett', type: 'wrestler', active: true, priority: 'medium', verified: false },
  { username: 'BronsonIsHere', displayName: 'Bronson Reed', type: 'wrestler', active: true, priority: 'medium', verified: false },
  { username: 'RealJakeHager', displayName: 'Jake Hager', type: 'wrestler', active: true, priority: 'medium', verified: false },
  { username: 'Ivar_WWE', displayName: 'Ivar', type: 'wrestler', active: true, priority: 'medium', verified: false },
  { username: 'TheGiantOmos', displayName: 'Omos', type: 'wrestler', active: true, priority: 'medium', verified: false },
  { username: 'CiampaWWE', displayName: 'Tommaso Ciampa', type: 'wrestler', active: true, priority: 'medium', verified: false },
  { username: 'TheRock', displayName: 'The Rock', type: 'legend', active: true, priority: 'high', verified: true },
  { username: 'eric_bugenhagen', displayName: 'Eric Bugenhagen', type: 'wrestler', active: true, priority: 'low', verified: false },
  { username: 'realboogey', displayName: 'The Boogeyman', type: 'legend', active: true, priority: 'low', verified: false },
  { username: 'ShawnMichaels', displayName: 'Shawn Michaels', type: 'legend', active: true, priority: 'high', verified: true },
  { username: 'steveaustinBSR', displayName: 'Steve Austin', type: 'legend', active: true, priority: 'high', verified: true },
  { username: 'TheMarkHenry', displayName: 'Mark Henry', type: 'legend', active: true, priority: 'medium', verified: true },
  { username: 'JerryLawler', displayName: 'Jerry Lawler', type: 'legend', active: true, priority: 'medium', verified: true },
  { username: 'catherinekelley', displayName: 'Catherine Kelley', type: 'journalist', active: true, priority: 'low', verified: false },
  { username: 'mikethemiz', displayName: 'The Miz', type: 'wrestler', active: true, priority: 'medium', verified: true },
  { username: 'MustafaAli_X', displayName: 'Mustafa Ali', type: 'wrestler', active: true, priority: 'medium', verified: true },
  { username: 'RealKurtAngle', displayName: 'Kurt Angle', type: 'legend', active: true, priority: 'medium', verified: true },
  { username: 'WWEGable', displayName: 'Chad Gable', type: 'wrestler', active: true, priority: 'medium', verified: true },
  { username: 's_d_naito', displayName: 'Shinsuke Nakamura', type: 'wrestler', active: true, priority: 'medium', verified: false },
  { username: 'KingRicochet', displayName: 'Ricochet', type: 'wrestler', active: true, priority: 'medium', verified: true },
  { username: 'Christian4Peeps', displayName: 'Christian Cage', type: 'wrestler', active: true, priority: 'medium', verified: false },
  { username: 'TheAdamPages', displayName: 'Adam Page', type: 'wrestler', active: true, priority: 'medium', verified: false },
  { username: 'THETOMMYDREAMER', displayName: 'Tommy Dreamer', type: 'legend', active: true, priority: 'medium', verified: false },
  { username: 'otiswwe', displayName: 'Otis', type: 'wrestler', active: true, priority: 'medium', verified: false },
  { username: 'AJStylesOrg', displayName: 'AJ Styles', type: 'wrestler', active: true, priority: 'high', verified: true },
  { username: 'WWESheamus', displayName: 'Sheamus', type: 'wrestler', active: true, priority: 'medium', verified: true },
  { username: 'FightOwensFight', displayName: 'Kevin Owens', type: 'wrestler', active: true, priority: 'medium', verified: true },
  { username: 'WWENikkiCross', displayName: 'Nikki Cross', type: 'wrestler', active: true, priority: 'medium', verified: true },
  { username: 'TheMattCardona', displayName: 'Matt Cardona', type: 'wrestler', active: true, priority: 'medium', verified: false },
  { username: 'realkevinkelly', displayName: 'Kevin Kelly', type: 'journalist', active: true, priority: 'medium', verified: false },
  { username: 'TheKingOfStrong', displayName: 'Roderick Strong', type: 'wrestler', active: true, priority: 'medium', verified: false },
  { username: 'RealNickAldis', displayName: 'Nick Aldis', type: 'wrestler', active: true, priority: 'medium', verified: false },
  { username: 'RealJeffJarrett', displayName: 'Jeff Jarrett', type: 'legend', active: true, priority: 'medium', verified: true },
  
  // Wrestling News & Media
  { username: 'WrestleNotice', displayName: 'Wrestling Notice', type: 'community', active: true, priority: 'medium', verified: false },
  { username: 'WrestleTubePC', displayName: 'WrestleTube', type: 'community', active: true, priority: 'low', verified: false },
  { username: 'FanSidedDDT', displayName: 'FanSided Wrestling', type: 'community', active: true, priority: 'low', verified: false },
  { username: 'AEWonTV', displayName: 'AEW on TV', type: 'community', active: true, priority: 'medium', verified: false },
  { username: 'IamAllElite', displayName: 'I Am All Elite', type: 'community', active: true, priority: 'low', verified: false },
  { username: 'WrestlePurists', displayName: 'Wrestling Purists', type: 'community', active: true, priority: 'low', verified: false },
  { username: 'WWEItalia', displayName: 'WWE Italia', type: 'community', active: true, priority: 'low', verified: false },
  { username: 'TNADixie', displayName: 'TNA Dixie', type: 'community', active: true, priority: 'low', verified: false },
  { username: 'WrestleTix', displayName: 'WrestleTix', type: 'community', active: true, priority: 'medium', verified: false },
  { username: 'WrestleFeatures', displayName: 'Wrestling Features', type: 'community', active: true, priority: 'low', verified: false },
  { username: 'BustedOpenRadio', displayName: 'Busted Open Radio', type: 'community', active: true, priority: 'medium', verified: true },
  { username: 'AEWNeckbeard', displayName: 'AEW Neckbeard', type: 'community', active: true, priority: 'low', verified: false },
  { username: 'WWEVacant', displayName: 'WWE Vacant', type: 'community', active: true, priority: 'low', verified: false },
  { username: 'WrestlingCovers', displayName: 'Wrestling Covers', type: 'community', active: true, priority: 'low', verified: false },
  
  // Wrestling Personalities & Legends
  { username: 'TheJimCornette', displayName: 'Jim Cornette', type: 'legend', active: true, priority: 'medium', verified: false },
  { username: 'THEVinceRusso', displayName: 'Vince Russo', type: 'legend', active: true, priority: 'medium', verified: false },
  { username: 'tanahashi1_100', displayName: 'Hiroshi Tanahashi', type: 'wrestler', active: true, priority: 'medium', verified: false },
  { username: 'EBischoff', displayName: 'Eric Bischoff', type: 'legend', active: true, priority: 'medium', verified: true },
  { username: 'TheHypeManAlex', displayName: 'Alex Marvez', type: 'journalist', active: true, priority: 'low', verified: false },
  
  // Wrestling Community (Additional accounts from twitterService)
  { username: 'ChandranTheMan', displayName: 'Chandran', type: 'community', active: true, priority: 'low', verified: false },
  { username: 'moyscharles03', displayName: 'Charles Moys', type: 'community', active: true, priority: 'low', verified: false },
  { username: 'ArmbarsNCigars', displayName: 'Armbars N Cigars', type: 'community', active: true, priority: 'low', verified: false },
  { username: 'ChiefsMuseee', displayName: 'Chiefs Muse', type: 'community', active: true, priority: 'low', verified: false },
  { username: 'wittyjack__', displayName: 'Witty Jack', type: 'community', active: true, priority: 'low', verified: false },
  { username: 'TurpTime84', displayName: 'Turp Time', type: 'community', active: true, priority: 'low', verified: false },
  { username: 'MrMrWolf4', displayName: 'Mr Wolf', type: 'community', active: true, priority: 'low', verified: false },
  { username: 'AllEliteSicko', displayName: 'All Elite Sicko', type: 'community', active: true, priority: 'low', verified: false },
  { username: 'Alexa518970', displayName: 'Alexa', type: 'community', active: true, priority: 'low', verified: false },
  { username: 'riveraJonath949', displayName: 'Jonathan Rivera', type: 'community', active: true, priority: 'low', verified: false },
  { username: 'ScrapDaddyAP', displayName: 'Scrap Daddy', type: 'community', active: true, priority: 'low', verified: false },
  { username: 'Thecoachrules', displayName: 'The Coach', type: 'community', active: true, priority: 'low', verified: false },
  { username: 'toxic_thekla', displayName: 'Toxic Thekla', type: 'community', active: true, priority: 'low', verified: false },
  { username: 'PatrullaBCN', displayName: 'Patrulla BCN', type: 'community', active: true, priority: 'low', verified: false },
  { username: 'NemexyxOfficial', displayName: 'Nemexyx', type: 'community', active: true, priority: 'low', verified: false },
  { username: 'jnmegatron', displayName: 'JN Megatron', type: 'community', active: true, priority: 'low', verified: false },
  { username: 'ARealFoxx', displayName: 'A Real Foxx', type: 'community', active: true, priority: 'low', verified: false },
  { username: 'SamanthaTheBomb', displayName: 'Samantha The Bomb', type: 'community', active: true, priority: 'low', verified: false },
  { username: 'Litocolon279', displayName: 'Litocolon', type: 'community', active: true, priority: 'low', verified: false },
  { username: 'JakeSnakeDDT', displayName: 'Jake Snake DDT', type: 'community', active: true, priority: 'low', verified: false }
];

// Get accounts by priority for processing optimization
export const getAccountsByPriority = (priority: 'high' | 'medium' | 'low') => {
  return WRESTLING_ACCOUNTS.filter(account => account.priority === priority && account.active);
};

// Get all active accounts
export const getActiveAccounts = () => {
  return WRESTLING_ACCOUNTS.filter(account => account.active);
};

// Get account usernames for API calls
export const getAccountUsernames = () => {
  return getActiveAccounts().map(account => account.username);
};
