/**
 * Smart Search Parser
 * Intelligently classifies user search queries into location, style, artist name, or general search
 */

export interface SearchClassification {
  type: 'location' | 'style' | 'artist_name' | 'combined' | 'general'
  location?: string
  style?: string
  artistName?: string
  confidence: number
  originalQuery: string
}

// Comprehensive tattoo styles database
const TATTOO_STYLES = [
  // Core styles
  'traditional', 'american traditional', 'old school', 'traditional american',
  'realism', 'realistic', 'photo realism', 'photorealism',
  'watercolor', 'watercolour',
  'geometric', 'geometry',
  'minimalist', 'minimal', 'simple',
  
  // Regional/Cultural styles
  'japanese', 'irezumi', 'oriental', 'asian',
  'tribal', 'polynesian', 'maori', 'samoan',
  'celtic', 'norse', 'viking',
  'chicano', 'cholo',
  
  // Technique-based styles
  'blackwork', 'black work', 'black and grey', 'black and gray',
  'neo-traditional', 'neo traditional', 'neotraditional',
  'new school', 'newschool',
  'dotwork', 'dot work', 'stippling',
  'fine line', 'fineline', 'thin line', 'linework', 'line work',
  'hand poke', 'stick and poke', 'handpoke',
  'sketch', 'sketchy',
  
  // Subject-based styles
  'portrait', 'portraiture',
  'biomechanical', 'bio mechanical', 'bio mech',
  'abstract', 'abstractionism',
  'illustrative', 'illustration',
  'surreal', 'surrealism', 'surrealist',
  'trash polka', 'trashpolka',
  
  // Decorative styles
  'mandala', 'mandalas',
  'ornamental', 'ornament',
  'floral', 'botanical', 'flower', 'flowers',
  
  // Text styles
  'script', 'lettering', 'calligraphy', 'typography',
  
  // Other
  'cover up', 'coverup',
  'color', 'colour', 'colorful', 'colourful',
  'sleeve', 'half sleeve', 'full sleeve',
  'micro', 'tiny', 'small'
]

// Common location indicators
const LOCATION_INDICATORS = [
  // Political divisions
  'city', 'town', 'village', 'county', 'state', 'province', 'region',
  
  // Directional
  'north', 'south', 'east', 'west', 'northern', 'southern', 'eastern', 'western',
  'downtown', 'uptown', 'midtown',
  
  // Street/Address
  'street', 'st', 'avenue', 'ave', 'boulevard', 'blvd', 'road', 'rd',
  'drive', 'dr', 'lane', 'ln', 'place', 'pl', 'way', 'court', 'ct',
  
  // Geographic features
  'beach', 'coast', 'island', 'mountain', 'valley', 'bay', 'harbor',
  
  // Location prepositions
  'in', 'near', 'around', 'by', 'at'
]

// Common filler words to remove before geocoding
const FILLER_WORDS = [
  'tattoo', 'tattoos', 'artist', 'artists', 'shop', 'shops', 'studio', 'studios',
  'parlor', 'parlors', 'parlour', 'parlours', 'in', 'near', 'around', 'by', 'at',
  'the', 'a', 'an', 'for', 'to', 'from', 'with'
]

// Common typo corrections for city names
const CITY_TYPO_MAP: { [key: string]: string } = {
  'buffallo': 'buffalo',
  'buffulo': 'buffalo',
  'sanfransisco': 'san francisco',
  'sanfran': 'san francisco',
  'losangeles': 'los angeles',
  'newyork': 'new york',
  'newyor': 'new york',
  'philidelphia': 'philadelphia',
  'philly': 'philadelphia',
  'pittsburg': 'pittsburgh',
  'cincinatti': 'cincinnati',
  'nashvile': 'nashville',
  'lousville': 'louisville',
  'phenix': 'phoenix',
  'phoneix': 'phoenix',
  'albuquerqe': 'albuquerque',
  'alburquerque': 'albuquerque',
  'minnapolis': 'minneapolis',
  'milwakee': 'milwaukee',
  'seatle': 'seattle',
  'sandiego': 'san diego',
  'sanjose': 'san jose'
}

// US States (full names and abbreviations)
const US_STATES = [
  'alabama', 'al', 'alaska', 'ak', 'arizona', 'az', 'arkansas', 'ar',
  'california', 'ca', 'colorado', 'co', 'connecticut', 'ct',
  'delaware', 'de', 'florida', 'fl', 'georgia', 'ga',
  'hawaii', 'hi', 'idaho', 'id', 'illinois', 'il', 'indiana', 'in',
  'iowa', 'ia', 'kansas', 'ks', 'kentucky', 'ky', 'louisiana', 'la',
  'maine', 'me', 'maryland', 'md', 'massachusetts', 'ma', 'michigan', 'mi',
  'minnesota', 'mn', 'mississippi', 'ms', 'missouri', 'mo', 'montana', 'mt',
  'nebraska', 'ne', 'nevada', 'nv', 'new hampshire', 'nh', 'new jersey', 'nj',
  'new mexico', 'nm', 'new york', 'ny', 'north carolina', 'nc', 'north dakota', 'nd',
  'ohio', 'oh', 'oklahoma', 'ok', 'oregon', 'or', 'pennsylvania', 'pa',
  'rhode island', 'ri', 'south carolina', 'sc', 'south dakota', 'sd',
  'tennessee', 'tn', 'texas', 'tx', 'utah', 'ut', 'vermont', 'vt',
  'virginia', 'va', 'washington', 'wa', 'west virginia', 'wv',
  'wisconsin', 'wi', 'wyoming', 'wy'
]

// No hardcoded city list - we rely on universal geocoding API instead!

/**
 * Clean location string by removing filler words and fixing typos
 * Example: "tattoo in san francisco" -> "san francisco"
 * Example: "buffallo ny" -> "buffalo ny"
 */
function cleanLocationString(location: string): string {
  let cleaned = location.toLowerCase().trim()
  
  // Remove filler words
  for (const filler of FILLER_WORDS) {
    // Remove filler word with word boundaries
    const regex = new RegExp(`\\b${filler}\\b`, 'gi')
    cleaned = cleaned.replace(regex, ' ')
  }
  
  // Clean up extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim()
  
  // Fix common typos
  const words = cleaned.split(/\s+/)
  const correctedWords = words.map(word => {
    // Check for typo correction
    if (CITY_TYPO_MAP[word]) {
      console.log(`  ✏️ Typo correction: "${word}" -> "${CITY_TYPO_MAP[word]}"`)
      return CITY_TYPO_MAP[word]
    }
    return word
  })
  cleaned = correctedWords.join(' ')
  
  console.log(`  🧹 Cleaned location: "${location}" -> "${cleaned}"`)
  return cleaned
}

/**
 * Check if query contains a tattoo style
 */
function containsStyle(query: string): { match: boolean; style?: string; confidence: number } {
  const lowerQuery = query.toLowerCase()
  
  for (const style of TATTOO_STYLES) {
    // Exact match or word boundary match
    const styleRegex = new RegExp(`\\b${style}\\b`, 'i')
    if (styleRegex.test(lowerQuery)) {
      return { match: true, style, confidence: 0.95 }
    }
    
    // Partial match (less confident)
    if (lowerQuery.includes(style) || style.includes(lowerQuery)) {
      return { match: true, style, confidence: 0.7 }
    }
  }
  
  return { match: false, confidence: 0 }
}

// Map of state abbreviations to full names for normalization
const STATE_ABBREV_MAP: { [key: string]: string } = {
  'al': 'AL', 'ak': 'AK', 'az': 'AZ', 'ar': 'AR', 'ca': 'CA', 'co': 'CO', 'ct': 'CT',
  'de': 'DE', 'fl': 'FL', 'ga': 'GA', 'hi': 'HI', 'id': 'ID', 'il': 'IL', 'in': 'IN',
  'ia': 'IA', 'ks': 'KS', 'ky': 'KY', 'la': 'LA', 'me': 'ME', 'md': 'MD', 'ma': 'MA',
  'mi': 'MI', 'mn': 'MN', 'ms': 'MS', 'mo': 'MO', 'mt': 'MT', 'ne': 'NE', 'nv': 'NV',
  'nh': 'NH', 'nj': 'NJ', 'nm': 'NM', 'ny': 'NY', 'nc': 'NC', 'nd': 'ND', 'oh': 'OH',
  'ok': 'OK', 'or': 'OR', 'pa': 'PA', 'ri': 'RI', 'sc': 'SC', 'sd': 'SD', 'tn': 'TN',
  'tx': 'TX', 'ut': 'UT', 'vt': 'VT', 'va': 'VA', 'wa': 'WA', 'wv': 'WV', 'wi': 'WI', 'wy': 'WY'
}

/**
 * Check if query contains a location
 * UNIVERSAL - works for ANY location via geocoding API
 */
function containsLocation(query: string): { match: boolean; location?: string; confidence: number } {
  const lowerQuery = query.toLowerCase()
  
  // First, clean the query to remove filler words
  const cleanedQuery = cleanLocationString(query)
  const words = cleanedQuery.split(/\s+/).filter(w => w.length > 0)
  
  // If cleaning removed everything, it's not a valid location
  if (words.length === 0) {
    return { match: false, confidence: 0 }
  }
  
  const workingQuery = cleanedQuery
  const workingWords = words
  
  // Check for city + state abbreviation pattern (e.g., "montgomery al", "tampa fl")
  if (workingWords.length >= 2) {
    const lastWord = workingWords[workingWords.length - 1]
    
    // Check if last word is a 2-letter state abbreviation
    if (lastWord.length === 2 && STATE_ABBREV_MAP[lastWord]) {
      // Format as "City, ST" for geocoding
      const cityPart = workingWords.slice(0, -1).join(' ')
      const formattedLocation = `${cityPart}, ${STATE_ABBREV_MAP[lastWord]}`
      console.log(`  📍 Detected city + state pattern: "${query}" → "${formattedLocation}"`)
      return { match: true, location: formattedLocation, confidence: 0.95 }
    }
  }
  
  // Check for US states (high confidence)
  for (const state of US_STATES) {
    const stateRegex = new RegExp(`\\b${state}\\b`, 'i')
    if (stateRegex.test(workingQuery)) {
      return { match: true, location: workingQuery, confidence: 0.9 }
    }
  }
  
  // Don't use LOCATION_INDICATORS to trigger a match anymore
  // (words like "in", "near" are just filler words to be removed)
  
  // Check for comma (often indicates city, state format)
  if (workingQuery.includes(',')) {
    return { match: true, location: workingQuery, confidence: 0.85 }
  }
  
  // Check for zip code pattern
  if (/\b\d{5}\b/.test(workingQuery)) {
    return { match: true, location: workingQuery, confidence: 0.9 }
  }
  
  // UNIVERSAL FALLBACK: If we get here and it's capitalized, 
  // or looks like a place name, treat it as location with good confidence
  // This allows ANY city/town/place name to work via geocoding API
  const isCapitalized = /^[A-Z]/.test(query.trim())
  const hasMultipleWords = workingWords.length >= 2
  const looksLikePlaceName = workingWords.length <= 4 && workingWords.every(w => w.length >= 2)
  
  if (isCapitalized || hasMultipleWords || looksLikePlaceName) {
    // Good confidence - let the geocoding API validate it
    // Return the cleaned version for better geocoding results
    return { match: true, location: workingQuery, confidence: 0.75 }
  }
  
  return { match: false, confidence: 0 }
}

/**
 * Check if query looks like an artist name
 */
function looksLikeArtistName(query: string): { match: boolean; confidence: number } {
  const trimmed = query.trim()
  const words = trimmed.split(/\s+/)
  
  // Single word that's not too short or long (could be first name)
  if (words.length === 1) {
    if (trimmed.length >= 3 && trimmed.length <= 15) {
      // Check it doesn't match other patterns
      const styleCheck = containsStyle(trimmed)
      const locationCheck = containsLocation(trimmed)
      
      if (!styleCheck.match && !locationCheck.match) {
        return { match: true, confidence: 0.6 }
      }
    }
  }
  
  // Two words (likely first and last name)
  if (words.length === 2) {
    // Check both words are reasonable name length
    const word1Valid = words[0].length >= 2 && words[0].length <= 15
    const word2Valid = words[1].length >= 2 && words[1].length <= 15
    
    if (word1Valid && word2Valid) {
      // Check doesn't contain location indicators
      const locationCheck = containsLocation(trimmed)
      const styleCheck = containsStyle(trimmed)
      
      if (!locationCheck.match && !styleCheck.match) {
        return { match: true, confidence: 0.85 }
      }
    }
  }
  
  // Three words (could be first, middle, last or with prefix like "Mr.")
  if (words.length === 3) {
    const allWordsValid = words.every(w => w.length >= 2 && w.length <= 15)
    if (allWordsValid) {
      const locationCheck = containsLocation(trimmed)
      const styleCheck = containsStyle(trimmed)
      
      if (!locationCheck.match && !styleCheck.match) {
        return { match: true, confidence: 0.75 }
      }
    }
  }
  
  return { match: false, confidence: 0 }
}

/**
 * Parse complex queries that might contain multiple elements
 * Examples: 
 * - "watercolor artist in Seattle"
 * - "David Kim geometric Chicago"
 * - "tampa fl linework"
 * - "traditional near LA"
 */
function parseComplexQuery(query: string): {
  location?: string
  style?: string
  artistName?: string
  confidence: number
} {
  const result: any = { confidence: 0 }
  const lowerQuery = query.toLowerCase()
  const words = query.split(/\s+/)
  
  console.log('🔄 Parsing complex query:', query, '| Words:', words)
  
  // First, scan all words to find style matches
  let styleMatches: Array<{style: string, position: number, length: number}> = []
  for (const style of TATTOO_STYLES) {
    const styleRegex = new RegExp(`\\b${style}\\b`, 'i')
    const match = query.match(styleRegex)
    if (match && match.index !== undefined) {
      styleMatches.push({
        style: style,
        position: match.index,
        length: style.length
      })
    }
  }
  
  // Sort by length (prefer longer matches like "fine line" over "line")
  styleMatches.sort((a, b) => b.length - a.length)
  
  if (styleMatches.length > 0) {
    result.style = styleMatches[0].style
    result.confidence += 0.35
    console.log('  🎨 Style found:', result.style)
  }
  
  // Try to extract location with explicit prepositions (highest priority)
  const explicitLocationMatch = lowerQuery.match(/\b(?:in|near|around|at)\s+([a-z\s,]+)$/i)
  if (explicitLocationMatch) {
    result.location = explicitLocationMatch[1].trim()
    result.confidence += 0.35
    console.log('  📍 Location (explicit):', result.location)
  } else {
    // Build remaining text by removing style
    let remainingText = query
    if (result.style) {
      remainingText = remainingText.replace(new RegExp(`\\b${result.style}\\b`, 'gi'), '').trim()
    }
    
    // Clean the remaining text to remove filler words and fix typos
    remainingText = cleanLocationString(remainingText)
    
    console.log('  Remaining after removing style and cleaning:', remainingText)
    
    // Split remaining text into words
    const remainingWords = remainingText.split(/\s+/).filter(w => w.length > 0)
    
    // Check if any part of remaining text is a location
    if (remainingWords.length > 0) {
      // Try to find location by checking combinations
      // For "tampa fl" - check both as one unit, and individual words
      
      // Try full remaining text first
      const fullCheck = containsLocation(remainingText)
      if (fullCheck.match) {
        // Use the formatted location from the check (might be normalized like "City, ST")
        result.location = fullCheck.location || remainingText
        result.confidence += 0.3
        console.log('  📍 Location (full remaining):', result.location)
      } else {
        // Try individual words or pairs
        for (let i = 0; i < remainingWords.length; i++) {
          // Try pairs first (e.g., "tampa fl")
          if (i < remainingWords.length - 1) {
            const pair = `${remainingWords[i]} ${remainingWords[i + 1]}`
            const pairCheck = containsLocation(pair)
            if (pairCheck.match && pairCheck.confidence >= 0.7) {
              // Use the formatted location from the check (might be normalized like "City, ST")
              result.location = pairCheck.location || pair
              result.confidence += 0.3
              console.log('  📍 Location (pair):', result.location)
              
              // Check if there's a remaining word that could be an artist name
              const otherWords = remainingWords.filter((_, idx) => idx !== i && idx !== i + 1).join(' ')
              if (otherWords.length > 0) {
                const nameCheck = looksLikeArtistName(otherWords)
                if (nameCheck.match) {
                  result.artistName = otherWords
                  result.confidence += 0.25
                  console.log('  👤 Artist (remaining):', result.artistName)
                }
              }
              break
            }
          }
          
          // Try single word
          if (!result.location) {
            const wordCheck = containsLocation(remainingWords[i])
            if (wordCheck.match && wordCheck.confidence >= 0.7) {
              result.location = remainingWords[i]
              result.confidence += 0.3
              console.log('  📍 Location (single word):', result.location)
              
              // Check if other words could be an artist name
              const otherWords = remainingWords.filter((_, idx) => idx !== i).join(' ')
              if (otherWords.length > 0) {
                const nameCheck = looksLikeArtistName(otherWords)
                if (nameCheck.match) {
                  result.artistName = otherWords
                  result.confidence += 0.25
                  console.log('  👤 Artist (remaining):', result.artistName)
                }
              }
              break
            }
          }
        }
      }
    }
  }
  
  // If we didn't find a location yet, check if remaining text (after removing style) is all location
  if (!result.location && result.style) {
    let textWithoutStyle = query.replace(new RegExp(`\\b${result.style}\\b`, 'gi'), '').trim()
    if (textWithoutStyle.length > 0) {
      const locationCheck = containsLocation(textWithoutStyle)
      if (locationCheck.match && locationCheck.confidence >= 0.65) {
        result.location = textWithoutStyle
        result.confidence += 0.3
        console.log('  📍 Location (all remaining):', result.location)
      }
    }
  }
  
  console.log('  ✅ Complex parse result:', result)
  
  return result
}

/**
 * Main smart search parser
 */
export function classifySearch(query: string): SearchClassification {
  const trimmed = query.trim()
  
  console.log('🔍 classifySearch called with:', trimmed)
  
  if (!trimmed) {
    return {
      type: 'general',
      originalQuery: query,
      confidence: 0
    }
  }
  
  // Try complex query parsing first
  const complexParse = parseComplexQuery(trimmed)
  console.log('  Complex parse result:', complexParse)
  if (complexParse.confidence >= 0.6) {
    console.log('  ✅ Returning COMBINED')
    return {
      type: 'combined',
      location: complexParse.location,
      style: complexParse.style,
      artistName: complexParse.artistName,
      originalQuery: query,
      confidence: complexParse.confidence
    }
  }
  
  // Check for style first (most specific)
  const styleCheck = containsStyle(trimmed)
  console.log('  Style check:', styleCheck)
  if (styleCheck.match && styleCheck.confidence >= 0.7) {
    console.log('  ✅ Returning STYLE')
    return {
      type: 'style',
      style: styleCheck.style,
      originalQuery: query,
      confidence: styleCheck.confidence
    }
  }
  
  // Check for location (prioritize over artist name for single words)
  const locationCheck = containsLocation(trimmed)
  const nameCheck = looksLikeArtistName(trimmed)
  console.log('  Location check:', locationCheck)
  console.log('  Name check:', nameCheck)
  
  // If location check found something (even with lower confidence), prefer it over name
  // This makes "Tampa", "Austin", etc. work as locations instead of names
  if (locationCheck.match && locationCheck.confidence >= 0.65) {
    // If both location and name match, prefer location if confidence is close
    if (nameCheck.match && nameCheck.confidence > locationCheck.confidence + 0.15) {
      // Name is significantly more confident - use it
      console.log('  ✅ Returning ARTIST_NAME (name more confident)')
      return {
        type: 'artist_name',
        artistName: trimmed,
        originalQuery: query,
        confidence: nameCheck.confidence
      }
    }
    
    // Default to location - use the cleaned location from locationCheck
    console.log('  ✅ Returning LOCATION')
    return {
      type: 'location',
      location: locationCheck.location || trimmed,
      originalQuery: query,
      confidence: locationCheck.confidence
    }
  }
  
  // Check for artist name only if location didn't match
  if (nameCheck.match && nameCheck.confidence >= 0.6) {
    console.log('  ✅ Returning ARTIST_NAME')
    return {
      type: 'artist_name',
      artistName: trimmed,
      originalQuery: query,
      confidence: nameCheck.confidence
    }
  }
  
  // Default to general search
  console.log('  ✅ Returning GENERAL (no match)')
  return {
    type: 'general',
    originalQuery: query,
    confidence: 0.3
  }
}

/**
 * Format search results for debugging
 */
export function formatSearchClassification(classification: SearchClassification): string {
  const parts = [
    `Type: ${classification.type}`,
    `Confidence: ${(classification.confidence * 100).toFixed(0)}%`
  ]
  
  if (classification.location) parts.push(`Location: ${classification.location}`)
  if (classification.style) parts.push(`Style: ${classification.style}`)
  if (classification.artistName) parts.push(`Artist: ${classification.artistName}`)
  
  return parts.join(' | ')
}

