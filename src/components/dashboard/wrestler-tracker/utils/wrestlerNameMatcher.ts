
// Improved wrestler name matching function - same as used in analysis service
export const isWrestlerMentioned = (wrestlerName: string, content: string): boolean => {
  const normalizedWrestlerName = wrestlerName.toLowerCase().trim();
  const normalizedContent = content.toLowerCase();
  
  // Split wrestler name into parts
  const nameParts = normalizedWrestlerName.split(' ').filter(part => part.length > 0);
  
  // For single names (rare), require exact match with word boundaries
  if (nameParts.length === 1) {
    const singleName = nameParts[0];
    // Only match if it's a distinctive name (more than 3 characters) and appears as a whole word
    if (singleName.length > 3) {
      const regex = new RegExp(`\\b${singleName}\\b`, 'i');
      return regex.test(normalizedContent);
    }
    return false;
  }
  
  // For multi-part names, use a more flexible approach
  if (nameParts.length >= 2) {
    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];
    
    // Check for exact full name match first (highest priority)
    const fullNameRegex = new RegExp(`\\b${normalizedWrestlerName.replace(/\s+/g, '\\s+')}\\b`, 'i');
    if (fullNameRegex.test(normalizedContent)) {
      return true;
    }
    
    // Check for "First Last" pattern (most common)
    const firstLastRegex = new RegExp(`\\b${firstName}\\s+${lastName}\\b`, 'i');
    if (firstLastRegex.test(normalizedContent)) {
      return true;
    }
    
    // For unique combinations, check if both names appear (with more distance allowed)
    const firstNameRegex = new RegExp(`\\b${firstName}\\b`, 'i');
    const lastNameRegex = new RegExp(`\\b${lastName}\\b`, 'i');
    
    const hasFirstName = firstNameRegex.test(normalizedContent);
    const hasLastName = lastNameRegex.test(normalizedContent);
    
    if (hasFirstName && hasLastName) {
      // Check if this is a unique enough combination to avoid false positives
      // Common first names that need stricter matching
      const commonFirstNames = ['adam', 'john', 'mike', 'chris', 'kevin', 'matt', 'mark', 'steve', 'daniel', 'bryan'];
      
      if (commonFirstNames.includes(firstName)) {
        // For common first names, require closer proximity (within 50 characters)
        const firstNameMatch = normalizedContent.match(firstNameRegex);
        const lastNameMatch = normalizedContent.match(lastNameRegex);
        
        if (firstNameMatch && lastNameMatch) {
          const firstNameIndex = normalizedContent.indexOf(firstNameMatch[0]);
          const lastNameIndex = normalizedContent.indexOf(lastNameMatch[0]);
          const distance = Math.abs(firstNameIndex - lastNameIndex);
          
          return distance <= 50;
        }
      } else {
        // For unique first names, allow more distance (within 150 characters)
        const firstNameMatch = normalizedContent.match(firstNameRegex);
        const lastNameMatch = normalizedContent.match(lastNameRegex);
        
        if (firstNameMatch && lastNameMatch) {
          const firstNameIndex = normalizedContent.indexOf(firstNameMatch[0]);
          const lastNameIndex = normalizedContent.indexOf(lastNameMatch[0]);
          const distance = Math.abs(firstNameIndex - lastNameIndex);
          
          return distance <= 150;
        }
      }
    }
    
    // Check for common wrestling name patterns
    // "Lastname" only for distinctive surnames
    if (lastName.length > 5 && !['johnson', 'williams', 'brown', 'jones', 'garcia', 'miller', 'davis'].includes(lastName)) {
      const lastNameOnlyRegex = new RegExp(`\\b${lastName}\\b`, 'i');
      if (lastNameOnlyRegex.test(normalizedContent)) {
        return true;
      }
    }
  }
  
  return false;
};
