
// Enhanced wrestler name matching functionality
export const isWrestlerMentioned = (wrestlerName: string, content: string): boolean => {
  const normalizedWrestlerName = wrestlerName.toLowerCase().trim();
  const normalizedContent = content.toLowerCase();
  
  console.log(`Checking if "${wrestlerName}" is mentioned in content snippet: "${content.substring(0, 100)}..."`);
  
  // Split wrestler name into parts
  const nameParts = normalizedWrestlerName.split(' ').filter(part => part.length > 0);
  
  // For single names, require exact match with word boundaries
  if (nameParts.length === 1) {
    const singleName = nameParts[0];
    if (singleName.length > 3) {
      const regex = new RegExp(`\\b${singleName}\\b`, 'i');
      const found = regex.test(normalizedContent);
      if (found) console.log(`✓ Found single name match: ${singleName}`);
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
      console.log(`✓ Found exact full name match: ${normalizedWrestlerName}`);
      return true;
    }
    
    // Strategy 2: "First Last" pattern
    const firstLastRegex = new RegExp(`\\b${firstName}\\s+${lastName}\\b`, 'i');
    if (firstLastRegex.test(normalizedContent)) {
      console.log(`✓ Found first-last match: ${firstName} ${lastName}`);
      return true;
    }
    
    // Strategy 3: Check for distinctive last names only (relaxed matching)
    const distinctiveLastNames = ['reigns', 'mysterio', 'mcintyre', 'rollins', 'lesnar', 'undertaker', 'cena', 'punk', 'rhodes', 'owens', 'zayn', 'balor', 'styles', 'nakamura', 'jericho', 'moxley', 'omega', 'ospreay', 'gunther', 'ripley', 'belair', 'lynch', 'bayley', 'priest', 'sikoa', 'breakker'];
    
    if (distinctiveLastNames.includes(lastName) && lastName.length > 4) {
      const lastNameRegex = new RegExp(`\\b${lastName}\\b`, 'i');
      if (lastNameRegex.test(normalizedContent)) {
        console.log(`✓ Found distinctive last name match: ${lastName}`);
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
          console.log(`✓ Found both names within distance: ${firstName} ${lastName} (distance: ${distance})`);
          return true;
        }
      }
    }
  }
  
  return false;
};
