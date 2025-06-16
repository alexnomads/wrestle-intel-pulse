
// Enhanced wrestler name matching functionality with improved detection for real news content
export const isWrestlerMentioned = (wrestlerName: string, content: string): boolean => {
  const normalizedWrestlerName = wrestlerName.toLowerCase().trim();
  const normalizedContent = content.toLowerCase();
  
  console.log(`🔍 Checking if "${wrestlerName}" is mentioned in: "${content.substring(0, 150)}..."`);
  
  // Handle special cases and nicknames for popular wrestlers
  const specialCases = {
    'cody rhodes': ['cody rhodes', 'cody', 'american nightmare', 'the american nightmare'],
    'dustin rhodes': ['dustin rhodes', 'dustin', 'goldust'],
    'bobby lashley': ['bobby lashley', 'lashley', 'all mighty', 'the all mighty'],
    'mjf': ['mjf', 'maxwell jacob friedman', 'friedman', 'max friedman'],
    'tony khan': ['tony khan', 'khan'],
    'roman reigns': ['roman reigns', 'roman', 'tribal chief', 'head of the table', 'the tribal chief'],
    'seth rollins': ['seth rollins', 'seth', 'rollins', 'seth "freakin" rollins', 'seth freakin rollins'],
    'drew mcintyre': ['drew mcintyre', 'drew', 'mcintyre', 'scottish warrior', 'the scottish warrior'],
    'cm punk': ['cm punk', 'punk', 'phil brooks'],
    'jon moxley': ['jon moxley', 'moxley', 'dean ambrose'],
    'kenny omega': ['kenny omega', 'omega', 'cleaner', 'the cleaner'],
    'will ospreay': ['will ospreay', 'ospreay', 'aerial assassin'],
    'gunther': ['gunther', 'walter', 'ring general', 'the ring general'],
    'rhea ripley': ['rhea ripley', 'rhea', 'ripley', 'mami'],
    'bianca belair': ['bianca belair', 'bianca', 'belair', 'est', 'the est'],
    'becky lynch': ['becky lynch', 'becky', 'lynch', 'big time becks', 'the man'],
    'bayley': ['bayley', 'role model', 'the role model'],
    'la knight': ['la knight', 'knight', 'charisma'],
    'damian priest': ['damian priest', 'priest', 'archer of infamy'],
    'solo sikoa': ['solo sikoa', 'solo', 'sikoa', 'tribal combat officer'],
    'bron breakker': ['bron breakker', 'bron', 'breakker'],
    'john cena': ['john cena', 'cena'],
    'the undertaker': ['undertaker', 'the undertaker', 'taker'],
    'brock lesnar': ['brock lesnar', 'lesnar', 'brock'],
    'triple h': ['triple h', 'hhh', 'paul levesque'],
    'stone cold': ['stone cold', 'steve austin', 'austin'],
    'the rock': ['the rock', 'rock', 'dwayne johnson'],
    'kevin owens': ['kevin owens', 'owens', 'ko'],
    'sami zayn': ['sami zayn', 'zayn', 'sami'],
    'aj styles': ['aj styles', 'styles', 'aj'],
    'shinsuke nakamura': ['shinsuke nakamura', 'nakamura', 'shinsuke'],
    'chris jericho': ['chris jericho', 'jericho', 'y2j'],
    'rey mysterio': ['rey mysterio', 'mysterio', 'rey'],
    'finn balor': ['finn balor', 'balor', 'finn'],
    'paul heyman': ['paul heyman', 'heyman']
  };
  
  // Check for exact special case matches first
  const specialCase = specialCases[normalizedWrestlerName];
  if (specialCase) {
    for (const variant of specialCase) {
      const regex = new RegExp(`\\b${variant.replace(/\s+/g, '\\s+')}\\b`, 'i');
      if (regex.test(normalizedContent)) {
        console.log(`✅ Found special case match: "${variant}" for ${wrestlerName}`);
        return true;
      }
    }
  }
  
  // Split wrestler name into parts
  const nameParts = normalizedWrestlerName.split(' ').filter(part => part.length > 0);
  
  // For single names, require exact match with word boundaries (be more lenient)
  if (nameParts.length === 1) {
    const singleName = nameParts[0];
    if (singleName.length > 2) { // Lowered from 3 to 2
      const regex = new RegExp(`\\b${singleName}\\b`, 'i');
      const found = regex.test(normalizedContent);
      if (found) console.log(`✅ Found single name match: ${singleName}`);
      return found;
    }
    return false;
  }
  
  // For multi-part names, use multiple strategies with more flexibility
  if (nameParts.length >= 2) {
    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];
    
    // Strategy 1: Exact full name match (highest priority)
    const fullNameRegex = new RegExp(`\\b${normalizedWrestlerName.replace(/\s+/g, '\\s+')}\\b`, 'i');
    if (fullNameRegex.test(normalizedContent)) {
      console.log(`✅ Found exact full name match: ${normalizedWrestlerName}`);
      return true;
    }
    
    // Strategy 2: "First Last" pattern
    const firstLastRegex = new RegExp(`\\b${firstName}\\s+${lastName}\\b`, 'i');
    if (firstLastRegex.test(normalizedContent)) {
      console.log(`✅ Found first-last match: ${firstName} ${lastName}`);
      return true;
    }
    
    // Strategy 3: Check for distinctive last names with more lenient criteria
    const distinctiveLastNames = ['reigns', 'mysterio', 'mcintyre', 'rollins', 'lesnar', 'undertaker', 'cena', 'punk', 'lashley', 'owens', 'zayn', 'balor', 'styles', 'nakamura', 'jericho', 'moxley', 'omega', 'ospreay', 'gunther', 'ripley', 'belair', 'lynch', 'bayley', 'priest', 'sikoa', 'breakker', 'knight', 'rhodes', 'heyman', 'ambrose'];
    
    if (distinctiveLastNames.includes(lastName) && lastName.length > 3) { // Lowered from 4 to 3
      const lastNameRegex = new RegExp(`\\b${lastName}\\b`, 'i');
      if (lastNameRegex.test(normalizedContent)) {
        console.log(`✅ Found distinctive last name match: ${lastName}`);
        return true;
      }
    }
    
    // Strategy 4: Both names appear within reasonable distance (more lenient)
    const firstNameRegex = new RegExp(`\\b${firstName}\\b`, 'i');
    const lastNameRegex = new RegExp(`\\b${lastName}\\b`, 'i');
    
    if (firstNameRegex.test(normalizedContent) && lastNameRegex.test(normalizedContent)) {
      const firstMatch = normalizedContent.match(firstNameRegex);
      const lastMatch = normalizedContent.match(lastNameRegex);
      
      if (firstMatch && lastMatch) {
        const firstIndex = normalizedContent.indexOf(firstMatch[0]);
        const lastIndex = normalizedContent.indexOf(lastMatch[0]);
        const distance = Math.abs(firstIndex - lastIndex);
        
        // Increased distance allowance
        if (distance <= 200) { // Increased from 100 to 200
          console.log(`✅ Found both names within distance: ${firstName} ${lastName} (distance: ${distance})`);
          return true;
        }
      }
    }
    
    // Strategy 5: Check if this is a wrestling context (mentions wrestling terms)
    const wrestlingTerms = ['wwe', 'aew', 'wrestler', 'wrestling', 'match', 'champion', 'title', 'belt', 'smackdown', 'raw', 'dynamite', 'rampage', 'nxt', 'njpw', 'tna', 'impact', 'fight', 'bout', 'superstar', 'debut', 'feud', 'storyline', 'promo', 'heel', 'face', 'babyface'];
    const hasWrestlingContext = wrestlingTerms.some(term => normalizedContent.includes(term));
    
    if (hasWrestlingContext) {
      // More lenient matching in wrestling context
      if (firstNameRegex.test(normalizedContent) || lastNameRegex.test(normalizedContent)) {
        console.log(`✅ Found name in wrestling context: ${wrestlerName}`);
        return true;
      }
      
      // Check for partial name matches in wrestling context
      if (firstName.length > 3 && firstNameRegex.test(normalizedContent)) {
        console.log(`✅ Found first name in wrestling context: ${firstName}`);
        return true;
      }
      
      if (lastName.length > 3 && lastNameRegex.test(normalizedContent)) {
        console.log(`✅ Found last name in wrestling context: ${lastName}`);
        return true;
      }
    }
    
    // Strategy 6: Check for common wrestling name patterns
    // Many wrestlers are referred to by just their first name in certain contexts
    if (['cody', 'roman', 'seth', 'drew', 'punk', 'kenny', 'will', 'rhea', 'bianca', 'becky', 'bayley', 'damian', 'solo', 'bron'].includes(firstName)) {
      if (firstNameRegex.test(normalizedContent)) {
        console.log(`✅ Found common wrestling first name: ${firstName}`);
        return true;
      }
    }
  }
  
  console.log(`❌ No match found for: ${wrestlerName}`);
  return false;
};
