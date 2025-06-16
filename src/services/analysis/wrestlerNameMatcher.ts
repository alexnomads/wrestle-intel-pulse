
// Enhanced wrestler name matching functionality with improved detection
export const isWrestlerMentioned = (wrestlerName: string, content: string): boolean => {
  const normalizedWrestlerName = wrestlerName.toLowerCase().trim();
  const normalizedContent = content.toLowerCase();
  
  console.log(`🔍 Checking if "${wrestlerName}" is mentioned in: "${content.substring(0, 100)}..."`);
  
  // Handle special cases and nicknames for popular wrestlers
  const specialCases = {
    'cody rhodes': ['cody rhodes', 'cody', 'american nightmare', 'the american nightmare'],
    'dustin rhodes': ['dustin rhodes', 'dustin', 'goldust'],
    'bobby lashley': ['bobby lashley', 'lashley', 'all mighty'],
    'mjf': ['mjf', 'maxwell jacob friedman', 'friedman', 'max friedman'],
    'tony khan': ['tony khan', 'khan'],
    'roman reigns': ['roman reigns', 'roman', 'tribal chief', 'head of the table'],
    'seth rollins': ['seth rollins', 'seth', 'rollins', 'seth "freakin" rollins'],
    'drew mcintyre': ['drew mcintyre', 'drew', 'mcintyre', 'scottish warrior'],
    'cm punk': ['cm punk', 'punk', 'phil brooks'],
    'jon moxley': ['jon moxley', 'moxley', 'dean ambrose'],
    'kenny omega': ['kenny omega', 'omega', 'cleaner'],
    'will ospreay': ['will ospreay', 'ospreay', 'aerial assassin'],
    'gunther': ['gunther', 'walter', 'ring general'],
    'rhea ripley': ['rhea ripley', 'rhea', 'ripley', 'mami'],
    'bianca belair': ['bianca belair', 'bianca', 'belair', 'est'],
    'becky lynch': ['becky lynch', 'becky', 'lynch', 'big time becks', 'the man'],
    'bayley': ['bayley', 'role model'],
    'la knight': ['la knight', 'knight', 'charisma'],
    'damian priest': ['damian priest', 'priest', 'archer of infamy'],
    'solo sikoa': ['solo sikoa', 'solo', 'sikoa', 'tribal combat officer'],
    'bron breakker': ['bron breakker', 'bron', 'breakker']
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
  
  // For single names, require exact match with word boundaries
  if (nameParts.length === 1) {
    const singleName = nameParts[0];
    if (singleName.length > 3) {
      const regex = new RegExp(`\\b${singleName}\\b`, 'i');
      const found = regex.test(normalizedContent);
      if (found) console.log(`✅ Found single name match: ${singleName}`);
      return found;
    }
    return false;
  }
  
  // For multi-part names, use multiple strategies
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
    
    // Strategy 3: Check for distinctive last names only
    const distinctiveLastNames = ['reigns', 'mysterio', 'mcintyre', 'rollins', 'lesnar', 'undertaker', 'cena', 'punk', 'lashley', 'owens', 'zayn', 'balor', 'styles', 'nakamura', 'jericho', 'moxley', 'omega', 'ospreay', 'gunther', 'ripley', 'belair', 'lynch', 'bayley', 'priest', 'sikoa', 'breakker', 'knight', 'rhodes'];
    
    if (distinctiveLastNames.includes(lastName) && lastName.length > 4) {
      const lastNameRegex = new RegExp(`\\b${lastName}\\b`, 'i');
      if (lastNameRegex.test(normalizedContent)) {
        console.log(`✅ Found distinctive last name match: ${lastName}`);
        return true;
      }
    }
    
    // Strategy 4: Both names appear within reasonable distance
    const firstNameRegex = new RegExp(`\\b${firstName}\\b`, 'i');
    const lastNameRegex = new RegExp(`\\b${lastName}\\b`, 'i');
    
    if (firstNameRegex.test(normalizedContent) && lastNameRegex.test(normalizedContent)) {
      const firstMatch = normalizedContent.match(firstNameRegex);
      const lastMatch = normalizedContent.match(lastNameRegex);
      
      if (firstMatch && lastMatch) {
        const firstIndex = normalizedContent.indexOf(firstMatch[0]);
        const lastIndex = normalizedContent.indexOf(lastMatch[0]);
        const distance = Math.abs(firstIndex - lastIndex);
        
        // Allow reasonable distance between names
        if (distance <= 100) {
          console.log(`✅ Found both names within distance: ${firstName} ${lastName} (distance: ${distance})`);
          return true;
        }
      }
    }
    
    // Strategy 5: Check if this is a wrestling context (mentions wrestling terms)
    const wrestlingTerms = ['wwe', 'aew', 'wrestler', 'wrestling', 'match', 'champion', 'title', 'belt', 'smackdown', 'raw', 'dynamite', 'rampage', 'nxt', 'njpw', 'tna', 'impact'];
    const hasWrestlingContext = wrestlingTerms.some(term => normalizedContent.includes(term));
    
    if (hasWrestlingContext && (firstNameRegex.test(normalizedContent) || lastNameRegex.test(normalizedContent))) {
      console.log(`✅ Found name in wrestling context: ${wrestlerName}`);
      return true;
    }
  }
  
  console.log(`❌ No match found for: ${wrestlerName}`);
  return false;
};
