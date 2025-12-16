import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json({ error: 'Query parameter required' }, { status: 400 })
  }

  try {
    // Try Nominatim first - get more results to find the best match
    const nominatimResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'TATU-App/1.0',
          'Accept': 'application/json'
        }
      }
    )

    if (nominatimResponse.ok) {
      const data = await nominatimResponse.json()
      if (Array.isArray(data) && data.length > 0) {
        console.log('Nominatim results for', query, ':', data.map(r => ({ 
          name: r.display_name, 
          type: r.type, 
          class: r.class,
          importance: r.importance 
        })))
        
        // Prioritize cities/towns over regions/states
        // Place types in order of preference
        const preferredTypes = ['city', 'town', 'village', 'municipality', 'hamlet', 'suburb', 'locality']
        const avoidTypes = ['administrative', 'state', 'region', 'province']
        
        // Score each result based on how well it matches our criteria
        const scoredResults = data.map(result => {
          let score = 0
          
          // High score for preferred types
          if (preferredTypes.includes(result.type) || preferredTypes.includes(result.class)) {
            score += 10
          }
          
          // Penalize avoided types heavily
          if (avoidTypes.includes(result.type) || avoidTypes.includes(result.class)) {
            score -= 20
          }
          
          // Bonus for higher importance (more well-known places)
          if (result.importance) {
            score += result.importance * 5
          }
          
          // Bonus for results that include state/country in name (more specific)
          if (result.display_name && (result.display_name.includes(',') && result.display_name.split(',').length >= 3)) {
            score += 2
          }
          
          return { result, score }
        })
        
        // Sort by score (highest first)
        scoredResults.sort((a, b) => b.score - a.score)
        
        console.log('Scored results:', scoredResults.map(r => ({ 
          name: r.result.display_name, 
          type: r.result.type,
          score: r.score 
        })))
        
        const bestResult = scoredResults[0].result
        
        console.log('Selected result:', { 
          name: bestResult.display_name, 
          type: bestResult.type, 
          class: bestResult.class 
        })
        
        return NextResponse.json({ 
          success: true, 
          lat: parseFloat(bestResult.lat), 
          lon: parseFloat(bestResult.lon),
          display_name: bestResult.display_name
        })
      }
    }

    // Try Photon as fallback
    const photonResponse = await fetch(
      `https://photon.komoot.io/api?q=${encodeURIComponent(query)}&limit=1`
    )

    if (photonResponse.ok) {
      const data = await photonResponse.json()
      if (data?.features && data.features.length > 0) {
        const coords = data.features[0].geometry.coordinates
        return NextResponse.json({ 
          success: true, 
          lat: coords[1], 
          lon: coords[0],
          display_name: data.features[0].properties.name
        })
      }
    }

    return NextResponse.json({ error: 'No results found' }, { status: 404 })
  } catch (error) {
    console.error('Geocoding error:', error)
    return NextResponse.json({ error: 'Geocoding failed' }, { status: 500 })
  }
}

