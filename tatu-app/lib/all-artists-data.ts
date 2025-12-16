// Complete artist database - synced with map markers
// This ensures all artists appear in both search results and map pins

export interface Artist {
  id: string
  name: string
  bio: string
  avatar: string
  location: string
  specialties: string[]
  instagram: string
  portfolioCount: number
  rating: number
  reviewCount: number
  featured: boolean
}

export const ALL_ARTISTS: Artist[] = [
  // New York City (5 artists)
  { id: "1", name: "Alex Rivera", bio: "Professional tattoo artist with over 8 years of experience.", avatar: "/api/placeholder/150/150", location: "Lower Manhattan, NY", specialties: ["Traditional American"], instagram: "@alexrivera_tattoo", portfolioCount: 24, rating: 4.8, reviewCount: 127, featured: true },
  { id: "2", name: "Sarah Chen", bio: "Watercolor and minimalist tattoo specialist.", avatar: "/api/placeholder/150/150", location: "Times Square, NY", specialties: ["Watercolor", "Minimalist"], instagram: "@sarahchen_ink", portfolioCount: 18, rating: 4.9, reviewCount: 89, featured: false },
  { id: "3", name: "Marcus Johnson", bio: "Realism and portrait artist known for detailed work.", avatar: "/api/placeholder/150/150", location: "Financial District, NY", specialties: ["Realism", "Portraits"], instagram: "@marcusjohnson_tattoo", portfolioCount: 31, rating: 4.7, reviewCount: 156, featured: true },
  { id: "4", name: "Elena Rodriguez", bio: "Japanese traditional and geometric tattoo artist.", avatar: "/api/placeholder/150/150", location: "Upper West Side, NY", specialties: ["Japanese Traditional", "Geometric"], instagram: "@elenarodriguez_ink", portfolioCount: 22, rating: 4.6, reviewCount: 94, featured: false },
  { id: "5", name: "David Kim", bio: "Neo-traditional and new school artist.", avatar: "/api/placeholder/150/150", location: "East Village, NY", specialties: ["Neo-Traditional"], instagram: "@davidkim_tattoo", portfolioCount: 19, rating: 4.8, reviewCount: 112, featured: false },

  // Los Angeles (5 artists)
  { id: "6", name: "Maria Garcia", bio: "Traditional American and neo-traditional styles.", avatar: "/api/placeholder/150/150", location: "Downtown LA, CA", specialties: ["Blackwork", "Traditional American"], instagram: "@mariagarcia_ink", portfolioCount: 28, rating: 4.7, reviewCount: 134, featured: false },
  { id: "7", name: "James Wilson", bio: "Fine line and minimalist specialist.", avatar: "/api/placeholder/150/150", location: "Hollywood, CA", specialties: ["Geometric", "Fine Line"], instagram: "@jameswilson_ink", portfolioCount: 15, rating: 4.9, reviewCount: 67, featured: false },
  { id: "8", name: "Lisa Thompson", bio: "Geometric designs and minimalist blackwork.", avatar: "/api/placeholder/150/150", location: "Santa Monica, CA", specialties: ["Minimalist", "Blackwork"], instagram: "@lisathompson_ink", portfolioCount: 21, rating: 4.6, reviewCount: 89, featured: false },
  { id: "9", name: "Michael Brown", bio: "Photorealistic portraits and nature scenes.", avatar: "/api/placeholder/150/150", location: "West Hollywood, CA", specialties: ["Realism", "Portraits"], instagram: "@michaelbrown_ink", portfolioCount: 34, rating: 4.8, reviewCount: 145, featured: true },
  { id: "10", name: "Jessica Lee", bio: "Vibrant watercolor and abstract designs.", avatar: "/api/placeholder/150/150", location: "Venice, CA", specialties: ["Watercolor", "Abstract"], instagram: "@jessicalee_ink", portfolioCount: 19, rating: 4.9, reviewCount: 78, featured: false },

  // Chicago (5 artists)
  { id: "11", name: "Robert Davis", bio: "Classic American traditional tattoos.", avatar: "/api/placeholder/150/150", location: "Loop, IL", specialties: ["Traditional American"], instagram: "@robertdavis_tattoo", portfolioCount: 26, rating: 4.7, reviewCount: 98, featured: false },
  { id: "12", name: "Amanda White", bio: "Authentic Japanese Irezumi and traditional designs.", avatar: "/api/placeholder/150/150", location: "River North, IL", specialties: ["Japanese Traditional"], instagram: "@amandawhite_ink", portfolioCount: 29, rating: 4.8, reviewCount: 112, featured: false },
  { id: "13", name: "Carlos Martinez", bio: "Bold blackwork and dotwork designs.", avatar: "/api/placeholder/150/150", location: "Pilsen, IL", specialties: ["Blackwork", "Geometric"], instagram: "@carlosmartinez_ink", portfolioCount: 22, rating: 4.6, reviewCount: 76, featured: false },
  { id: "14", name: "Rachel Green", bio: "Modern twist on traditional tattooing.", avatar: "/api/placeholder/150/150", location: "Wicker Park, IL", specialties: ["Neo-Traditional"], instagram: "@rachelgreen_ink", portfolioCount: 25, rating: 4.9, reviewCount: 89, featured: true },
  { id: "15", name: "Kevin Taylor", bio: "Precision geometric patterns and sacred geometry.", avatar: "/api/placeholder/150/150", location: "Lincoln Park, IL", specialties: ["Geometric", "Minimalist"], instagram: "@kevintaylor_ink", portfolioCount: 27, rating: 4.7, reviewCount: 103, featured: false },

  // Houston (5 artists)
  { id: "16", name: "Jennifer Lopez", bio: "Photorealistic portraits and wildlife.", avatar: "/api/placeholder/150/150", location: "Downtown Houston, TX", specialties: ["Realism", "Portraits"], instagram: "@jenniferlopez_ink", portfolioCount: 32, rating: 4.8, reviewCount: 125, featured: true },
  { id: "17", name: "Daniel Rodriguez", bio: "Classic American traditional with bold lines.", avatar: "/api/placeholder/150/150", location: "Montrose, TX", specialties: ["Traditional American"], instagram: "@danielrodriguez_ink", portfolioCount: 24, rating: 4.6, reviewCount: 87, featured: false },
  { id: "18", name: "Stephanie Kim", bio: "Vibrant watercolor and abstract art.", avatar: "/api/placeholder/150/150", location: "Heights, TX", specialties: ["Watercolor", "Abstract"], instagram: "@stephaniekim_ink", portfolioCount: 19, rating: 4.9, reviewCount: 94, featured: false },
  { id: "19", name: "Anthony Garcia", bio: "Bold blackwork and geometric patterns.", avatar: "/api/placeholder/150/150", location: "Midtown, TX", specialties: ["Blackwork", "Geometric"], instagram: "@anthonygarcia_ink", portfolioCount: 22, rating: 4.7, reviewCount: 78, featured: false },
  { id: "20", name: "Nicole Anderson", bio: "Clean lines and subtle, elegant designs.", avatar: "/api/placeholder/150/150", location: "Rice Village, TX", specialties: ["Minimalist"], instagram: "@nicoleanderson_ink", portfolioCount: 18, rating: 4.8, reviewCount: 65, featured: false },

  // Phoenix (5 artists)
  { id: "21", name: "Brandon Scott", bio: "Sacred geometry and mandala designs.", avatar: "/api/placeholder/150/150", location: "Downtown Phoenix, AZ", specialties: ["Geometric"], instagram: "@brandonscott_ink", portfolioCount: 25, rating: 4.7, reviewCount: 92, featured: false },
  { id: "22", name: "Ashley Miller", bio: "Classic American traditional tattoos.", avatar: "/api/placeholder/150/150", location: "Scottsdale, AZ", specialties: ["Traditional American"], instagram: "@ashleymiller_ink", portfolioCount: 21, rating: 4.6, reviewCount: 73, featured: false },
  { id: "23", name: "Ryan Johnson", bio: "Photorealistic portraits and nature scenes.", avatar: "/api/placeholder/150/150", location: "Tempe, AZ", specialties: ["Realism", "Portraits"], instagram: "@ryanjohnson_ink", portfolioCount: 30, rating: 4.8, reviewCount: 108, featured: false },
  { id: "24", name: "Megan Davis", bio: "Vibrant watercolor and abstract designs.", avatar: "/api/placeholder/150/150", location: "Mesa, AZ", specialties: ["Watercolor", "Abstract"], instagram: "@megandavis_ink", portfolioCount: 17, rating: 4.9, reviewCount: 81, featured: false },
  { id: "25", name: "Tyler Wilson", bio: "Modern twist on traditional tattooing.", avatar: "/api/placeholder/150/150", location: "Chandler, AZ", specialties: ["Neo-Traditional"], instagram: "@tylerwilson_ink", portfolioCount: 24, rating: 4.7, reviewCount: 96, featured: false },

  // Philadelphia (5 artists)
  { id: "26", name: "Samantha Brown", bio: "Authentic Japanese Irezumi and traditional designs.", avatar: "/api/placeholder/150/150", location: "Center City, PA", specialties: ["Japanese Traditional"], instagram: "@samanthabrown_ink", portfolioCount: 28, rating: 4.8, reviewCount: 115, featured: false },
  { id: "27", name: "Christopher Lee", bio: "Bold blackwork and dotwork designs.", avatar: "/api/placeholder/150/150", location: "Fishtown, PA", specialties: ["Blackwork"], instagram: "@christopherlee_ink", portfolioCount: 22, rating: 4.6, reviewCount: 84, featured: false },
  { id: "28", name: "Victoria Taylor", bio: "Photorealistic portraits and wildlife.", avatar: "/api/placeholder/150/150", location: "Rittenhouse, PA", specialties: ["Realism", "Portraits"], instagram: "@victoriataylor_ink", portfolioCount: 33, rating: 4.9, reviewCount: 127, featured: true },
  { id: "29", name: "Jonathan Martinez", bio: "Classic American traditional with bold lines.", avatar: "/api/placeholder/150/150", location: "Northern Liberties, PA", specialties: ["Traditional American"], instagram: "@jonathanmartinez_ink", portfolioCount: 26, rating: 4.7, reviewCount: 98, featured: false },
  { id: "30", name: "Amanda Garcia", bio: "Clean lines and subtle, elegant designs.", avatar: "/api/placeholder/150/150", location: "Queen Village, PA", specialties: ["Minimalist"], instagram: "@amandagarcia_ink", portfolioCount: 19, rating: 4.8, reviewCount: 72, featured: false },

  // San Antonio (5 artists)
  { id: "31", name: "Matthew Rodriguez", bio: "Sacred geometry and mandala designs.", avatar: "/api/placeholder/150/150", location: "Downtown San Antonio, TX", specialties: ["Geometric"], instagram: "@matthewrodriguez_ink", portfolioCount: 25, rating: 4.7, reviewCount: 89, featured: false },
  { id: "32", name: "Isabella White", bio: "Vibrant watercolor and abstract art.", avatar: "/api/placeholder/150/150", location: "Alamo Heights, TX", specialties: ["Watercolor", "Abstract"], instagram: "@isabellawhite_ink", portfolioCount: 20, rating: 4.9, reviewCount: 76, featured: false },
  { id: "33", name: "Andrew Kim", bio: "Photorealistic portraits and nature scenes.", avatar: "/api/placeholder/150/150", location: "Stone Oak, TX", specialties: ["Realism", "Portraits"], instagram: "@andrewkim_ink", portfolioCount: 29, rating: 4.6, reviewCount: 102, featured: false },
  { id: "34", name: "Olivia Davis", bio: "Modern twist on traditional tattooing.", avatar: "/api/placeholder/150/150", location: "Southtown, TX", specialties: ["Neo-Traditional"], instagram: "@oliviadavis_ink", portfolioCount: 24, rating: 4.8, reviewCount: 94, featured: false },
  { id: "35", name: "Nathan Wilson", bio: "Bold blackwork and geometric patterns.", avatar: "/api/placeholder/150/150", location: "Pearl District, TX", specialties: ["Blackwork", "Geometric"], instagram: "@nathanwilson_ink", portfolioCount: 23, rating: 4.7, reviewCount: 87, featured: false },

  // San Diego (5 artists)
  { id: "36", name: "Sophia Anderson", bio: "Clean lines and subtle, elegant designs.", avatar: "/api/placeholder/150/150", location: "Downtown San Diego, CA", specialties: ["Minimalist"], instagram: "@sophiaanderson_ink", portfolioCount: 17, rating: 4.9, reviewCount: 68, featured: false },
  { id: "37", name: "Ethan Thompson", bio: "Classic American traditional tattoos.", avatar: "/api/placeholder/150/150", location: "Pacific Beach, CA", specialties: ["Traditional American"], instagram: "@ethanthompson_ink", portfolioCount: 25, rating: 4.6, reviewCount: 91, featured: false },
  { id: "38", name: "Emma Garcia", bio: "Authentic Japanese Irezumi and traditional designs.", avatar: "/api/placeholder/150/150", location: "North Park, CA", specialties: ["Japanese Traditional"], instagram: "@emmagarcia_ink", portfolioCount: 28, rating: 4.8, reviewCount: 113, featured: false },
  { id: "39", name: "Liam Johnson", bio: "Photorealistic portraits and wildlife.", avatar: "/api/placeholder/150/150", location: "La Jolla, CA", specialties: ["Realism", "Portraits"], instagram: "@liamjohnson_ink", portfolioCount: 31, rating: 4.7, reviewCount: 105, featured: false },
  { id: "40", name: "Ava Martinez", bio: "Vibrant watercolor and abstract designs.", avatar: "/api/placeholder/150/150", location: "Hillcrest, CA", specialties: ["Watercolor", "Abstract"], instagram: "@avamartinez_ink", portfolioCount: 20, rating: 4.9, reviewCount: 79, featured: false },

  // Dallas (5 artists)
  { id: "41", name: "Noah Brown", bio: "Sacred geometry and mandala designs.", avatar: "/api/placeholder/150/150", location: "Downtown Dallas, TX", specialties: ["Geometric"], instagram: "@noahbrown_ink", portfolioCount: 26, rating: 4.7, reviewCount: 96, featured: false },
  { id: "42", name: "Mia Davis", bio: "Bold blackwork and dotwork designs.", avatar: "/api/placeholder/150/150", location: "Deep Ellum, TX", specialties: ["Blackwork"], instagram: "@miadavis_ink", portfolioCount: 22, rating: 4.6, reviewCount: 82, featured: false },
  { id: "43", name: "William Taylor", bio: "Photorealistic portraits and nature scenes.", avatar: "/api/placeholder/150/150", location: "Uptown, TX", specialties: ["Realism", "Portraits"], instagram: "@williamtaylor_ink", portfolioCount: 32, rating: 4.8, reviewCount: 118, featured: true },
  { id: "44", name: "Charlotte Wilson", bio: "Modern twist on traditional tattooing.", avatar: "/api/placeholder/150/150", location: "Bishop Arts, TX", specialties: ["Neo-Traditional"], instagram: "@charlottewilson_ink", portfolioCount: 24, rating: 4.9, reviewCount: 87, featured: false },
  { id: "45", name: "James Rodriguez", bio: "Classic American traditional with bold lines.", avatar: "/api/placeholder/150/150", location: "Oak Cliff, TX", specialties: ["Traditional American"], instagram: "@jamesrodriguez_ink", portfolioCount: 27, rating: 4.7, reviewCount: 101, featured: false },

  // San Jose (5 artists)
  { id: "46", name: "Amelia Garcia", bio: "Clean lines and subtle, elegant designs.", avatar: "/api/placeholder/150/150", location: "Downtown San Jose, CA", specialties: ["Minimalist"], instagram: "@ameliagarcia_ink", portfolioCount: 18, rating: 4.8, reviewCount: 74, featured: false },
  { id: "47", name: "Benjamin Lee", bio: "Authentic Japanese Irezumi and traditional designs.", avatar: "/api/placeholder/150/150", location: "Willow Glen, CA", specialties: ["Japanese Traditional"], instagram: "@benjaminlee_ink", portfolioCount: 29, rating: 4.7, reviewCount: 109, featured: false },
  { id: "48", name: "Harper Kim", bio: "Vibrant watercolor and abstract art.", avatar: "/api/placeholder/150/150", location: "Santana Row, CA", specialties: ["Watercolor", "Abstract"], instagram: "@harperkim_ink", portfolioCount: 21, rating: 4.9, reviewCount: 85, featured: false },
  { id: "49", name: "Lucas Anderson", bio: "Sacred geometry and mandala designs.", avatar: "/api/placeholder/150/150", location: "Campbell, CA", specialties: ["Geometric"], instagram: "@lucasanderson_ink", portfolioCount: 25, rating: 4.6, reviewCount: 93, featured: false },
  { id: "50", name: "Evelyn Thompson", bio: "Photorealistic portraits and wildlife.", avatar: "/api/placeholder/150/150", location: "Los Gatos, CA", specialties: ["Realism", "Portraits"], instagram: "@evelynthompson_ink", portfolioCount: 33, rating: 4.8, reviewCount: 126, featured: true },

  // Austin (5 artists)
  { id: "51", name: "Alexander Martinez", bio: "Classic American traditional tattoos.", avatar: "/api/placeholder/150/150", location: "Downtown Austin, TX", specialties: ["Traditional American"], instagram: "@alexandermartinez_ink", portfolioCount: 26, rating: 4.7, reviewCount: 97, featured: false },
  { id: "52", name: "Abigail Wilson", bio: "Bold blackwork and geometric patterns.", avatar: "/api/placeholder/150/150", location: "South Austin, TX", specialties: ["Blackwork", "Geometric"], instagram: "@abigailwilson_ink", portfolioCount: 23, rating: 4.8, reviewCount: 88, featured: false },
  { id: "53", name: "Henry Davis", bio: "Modern twist on traditional tattooing.", avatar: "/api/placeholder/150/150", location: "East Austin, TX", specialties: ["Neo-Traditional"], instagram: "@henrydavis_ink", portfolioCount: 25, rating: 4.9, reviewCount: 95, featured: false },
  { id: "54", name: "Emily Rodriguez", bio: "Clean lines and subtle, elegant designs.", avatar: "/api/placeholder/150/150", location: "West Austin, TX", specialties: ["Minimalist"], instagram: "@emilyrodriguez_ink", portfolioCount: 19, rating: 4.6, reviewCount: 71, featured: false },
  { id: "55", name: "Sebastian Garcia", bio: "Photorealistic portraits and nature scenes.", avatar: "/api/placeholder/150/150", location: "North Austin, TX", specialties: ["Realism", "Portraits"], instagram: "@sebastiangarcia_ink", portfolioCount: 31, rating: 4.8, reviewCount: 112, featured: true },

  // Jacksonville (5 artists)
  { id: "56", name: "Madison Brown", bio: "Vibrant watercolor and abstract designs.", avatar: "/api/placeholder/150/150", location: "Downtown Jacksonville, FL", specialties: ["Watercolor", "Abstract"], instagram: "@madisonbrown_ink", portfolioCount: 21, rating: 4.7, reviewCount: 83, featured: false },
  { id: "57", name: "Jackson Taylor", bio: "Authentic Japanese Irezumi and traditional designs.", avatar: "/api/placeholder/150/150", location: "Riverside, FL", specialties: ["Japanese Traditional"], instagram: "@jacksontaylor_ink", portfolioCount: 28, rating: 4.6, reviewCount: 106, featured: false },
  { id: "58", name: "Sofia Anderson", bio: "Sacred geometry and mandala designs.", avatar: "/api/placeholder/150/150", location: "San Marco, FL", specialties: ["Geometric"], instagram: "@sofiaanderson_ink", portfolioCount: 24, rating: 4.8, reviewCount: 91, featured: false },
  { id: "59", name: "Aiden Wilson", bio: "Classic American traditional with bold lines.", avatar: "/api/placeholder/150/150", location: "Avondale, FL", specialties: ["Traditional American"], instagram: "@aidenwilson_ink", portfolioCount: 27, rating: 4.7, reviewCount: 99, featured: false },
  { id: "60", name: "Chloe Martinez", bio: "Photorealistic portraits and wildlife.", avatar: "/api/placeholder/150/150", location: "Beaches, FL", specialties: ["Realism", "Portraits"], instagram: "@chloemartinez_ink", portfolioCount: 32, rating: 4.9, reviewCount: 117, featured: true },

  // Fort Worth (5 artists)
  { id: "61", name: "Carter Johnson", bio: "Bold blackwork and dotwork designs.", avatar: "/api/placeholder/150/150", location: "Downtown Fort Worth, TX", specialties: ["Blackwork"], instagram: "@carterjohnson_ink", portfolioCount: 22, rating: 4.6, reviewCount: 86, featured: false },
  { id: "62", name: "Grace Davis", bio: "Clean lines and subtle, elegant designs.", avatar: "/api/placeholder/150/150", location: "Cultural District, TX", specialties: ["Minimalist"], instagram: "@gracedavis_ink", portfolioCount: 19, rating: 4.8, reviewCount: 73, featured: false },
  { id: "63", name: "Owen Rodriguez", bio: "Modern twist on traditional tattooing.", avatar: "/api/placeholder/150/150", location: "Stockyards, TX", specialties: ["Neo-Traditional"], instagram: "@owenrodriguez_ink", portfolioCount: 25, rating: 4.7, reviewCount: 94, featured: false },
  { id: "64", name: "Victoria Garcia", bio: "Photorealistic portraits and nature scenes.", avatar: "/api/placeholder/150/150", location: "West 7th, TX", specialties: ["Realism", "Portraits"], instagram: "@victoriagarcia_ink", portfolioCount: 33, rating: 4.9, reviewCount: 124, featured: true },
  { id: "65", name: "Wyatt Wilson", bio: "Classic American traditional tattoos.", avatar: "/api/placeholder/150/150", location: "Magnolia, TX", specialties: ["Traditional American"], instagram: "@wyattwilson_ink", portfolioCount: 24, rating: 4.6, reviewCount: 88, featured: false },

  // Columbus (5 artists)
  { id: "66", name: "Scarlett Anderson", bio: "Vibrant watercolor and abstract art.", avatar: "/api/placeholder/150/150", location: "Downtown Columbus, OH", specialties: ["Watercolor", "Abstract"], instagram: "@scarlettanderson_ink", portfolioCount: 20, rating: 4.8, reviewCount: 81, featured: false },
  { id: "67", name: "Luke Brown", bio: "Authentic Japanese Irezumi and traditional designs.", avatar: "/api/placeholder/150/150", location: "Short North, OH", specialties: ["Japanese Traditional"], instagram: "@lukebrown_ink", portfolioCount: 28, rating: 4.7, reviewCount: 103, featured: false },
  { id: "68", name: "Zoey Taylor", bio: "Sacred geometry and mandala designs.", avatar: "/api/placeholder/150/150", location: "German Village, OH", specialties: ["Geometric"], instagram: "@zoeytaylor_ink", portfolioCount: 24, rating: 4.6, reviewCount: 89, featured: false },
  { id: "69", name: "Gabriel Martinez", bio: "Photorealistic portraits and wildlife.", avatar: "/api/placeholder/150/150", location: "Clintonville, OH", specialties: ["Realism", "Portraits"], instagram: "@gabrielmartinez_ink", portfolioCount: 31, rating: 4.9, reviewCount: 115, featured: true },
  { id: "70", name: "Lily Wilson", bio: "Clean lines and subtle, elegant designs.", avatar: "/api/placeholder/150/150", location: "Brewery District, OH", specialties: ["Minimalist"], instagram: "@lilywilson_ink", portfolioCount: 20, rating: 4.7, reviewCount: 76, featured: false },

  // Charlotte (5 artists)
  { id: "71", name: "Jack Davis", bio: "Classic American traditional with bold lines.", avatar: "/api/placeholder/150/150", location: "Downtown Charlotte, NC", specialties: ["Traditional American"], instagram: "@jackdavis_ink", portfolioCount: 25, rating: 4.6, reviewCount: 92, featured: false },
  { id: "72", name: "Nora Rodriguez", bio: "Bold blackwork and geometric patterns.", avatar: "/api/placeholder/150/150", location: "NoDa, NC", specialties: ["Blackwork", "Geometric"], instagram: "@norarodriguez_ink", portfolioCount: 26, rating: 4.8, reviewCount: 97, featured: false },
  { id: "73", name: "Eli Garcia", bio: "Modern twist on traditional tattooing.", avatar: "/api/placeholder/150/150", location: "South End, NC", specialties: ["Neo-Traditional"], instagram: "@eligarcia_ink", portfolioCount: 23, rating: 4.7, reviewCount: 85, featured: false },
  { id: "74", name: "Hannah Anderson", bio: "Vibrant watercolor and abstract designs.", avatar: "/api/placeholder/150/150", location: "Plaza Midwood, NC", specialties: ["Watercolor", "Abstract"], instagram: "@hannahanderson_ink", portfolioCount: 18, rating: 4.9, reviewCount: 78, featured: false },
  { id: "75", name: "Mason Wilson", bio: "Photorealistic portraits and nature scenes.", avatar: "/api/placeholder/150/150", location: "Dilworth, NC", specialties: ["Realism", "Portraits"], instagram: "@masonwilson_ink", portfolioCount: 30, rating: 4.8, reviewCount: 109, featured: false },

  // San Francisco (5 artists)
  { id: "76", name: "Aria Brown", bio: "Clean lines and subtle, elegant designs.", avatar: "/api/placeholder/150/150", location: "Downtown San Francisco, CA", specialties: ["Minimalist"], instagram: "@ariabrown_ink", portfolioCount: 17, rating: 4.9, reviewCount: 69, featured: false },
  { id: "77", name: "Logan Taylor", bio: "Authentic Japanese Irezumi and traditional designs.", avatar: "/api/placeholder/150/150", location: "Mission District, CA", specialties: ["Japanese Traditional"], instagram: "@logantaylor_ink", portfolioCount: 29, rating: 4.7, reviewCount: 111, featured: false },
  { id: "78", name: "Layla Martinez", bio: "Sacred geometry and mandala designs.", avatar: "/api/placeholder/150/150", location: "Castro, CA", specialties: ["Geometric"], instagram: "@laylamartinez_ink", portfolioCount: 25, rating: 4.8, reviewCount: 95, featured: false },
  { id: "79", name: "Caleb Wilson", bio: "Photorealistic portraits and wildlife.", avatar: "/api/placeholder/150/150", location: "Haight-Ashbury, CA", specialties: ["Realism", "Portraits"], instagram: "@calebwilson_ink", portfolioCount: 29, rating: 4.6, reviewCount: 102, featured: false },
  { id: "80", name: "Zoe Davis", bio: "Classic American traditional tattoos.", avatar: "/api/placeholder/150/150", location: "North Beach, CA", specialties: ["Traditional American"], instagram: "@zoedavis_ink", portfolioCount: 24, rating: 4.7, reviewCount: 88, featured: false },

  // Indianapolis (5 artists)
  { id: "81", name: "Hunter Rodriguez", bio: "Bold blackwork and dotwork designs.", avatar: "/api/placeholder/150/150", location: "Downtown Indianapolis, IN", specialties: ["Blackwork"], instagram: "@hunterrodriguez_ink", portfolioCount: 22, rating: 4.6, reviewCount: 84, featured: false },
  { id: "82", name: "Natalie Garcia", bio: "Vibrant watercolor and abstract art.", avatar: "/api/placeholder/150/150", location: "Broad Ripple, IN", specialties: ["Watercolor", "Abstract"], instagram: "@nataliegarcia_ink", portfolioCount: 21, rating: 4.8, reviewCount: 82, featured: false },
  { id: "83", name: "Connor Anderson", bio: "Modern twist on traditional tattooing.", avatar: "/api/placeholder/150/150", location: "Fountain Square, IN", specialties: ["Neo-Traditional"], instagram: "@connoranderson_ink", portfolioCount: 24, rating: 4.7, reviewCount: 91, featured: false },
  { id: "84", name: "Brooklyn Wilson", bio: "Clean lines and subtle, elegant designs.", avatar: "/api/placeholder/150/150", location: "Mass Ave, IN", specialties: ["Minimalist"], instagram: "@brooklynwilson_ink", portfolioCount: 18, rating: 4.9, reviewCount: 67, featured: false },
  { id: "85", name: "Jordan Brown", bio: "Photorealistic portraits and nature scenes.", avatar: "/api/placeholder/150/150", location: "Irvington, IN", specialties: ["Realism", "Portraits"], instagram: "@jordanbrown_ink", portfolioCount: 31, rating: 4.8, reviewCount: 113, featured: true },

  // Seattle (5 artists)
  { id: "86", name: "Samantha Taylor", bio: "Authentic Japanese Irezumi and traditional designs.", avatar: "/api/placeholder/150/150", location: "Downtown Seattle, WA", specialties: ["Japanese Traditional"], instagram: "@samanthataylor_ink", portfolioCount: 28, rating: 4.7, reviewCount: 107, featured: false },
  { id: "87", name: "Tyler Martinez", bio: "Sacred geometry and mandala designs.", avatar: "/api/placeholder/150/150", location: "Capitol Hill, WA", specialties: ["Geometric"], instagram: "@tylermartinez_ink", portfolioCount: 25, rating: 4.6, reviewCount: 93, featured: false },
  { id: "88", name: "Avery Wilson", bio: "Vibrant watercolor and abstract designs.", avatar: "/api/placeholder/150/150", location: "Fremont, WA", specialties: ["Watercolor", "Abstract"], instagram: "@averywilson_ink", portfolioCount: 20, rating: 4.9, reviewCount: 79, featured: false },
  { id: "89", name: "Blake Davis", bio: "Classic American traditional with bold lines.", avatar: "/api/placeholder/150/150", location: "Ballard, WA", specialties: ["Traditional American"], instagram: "@blakedavis_ink", portfolioCount: 26, rating: 4.8, reviewCount: 96, featured: false },
  { id: "90", name: "Riley Anderson", bio: "Photorealistic portraits and wildlife.", avatar: "/api/placeholder/150/150", location: "Queen Anne, WA", specialties: ["Realism", "Portraits"], instagram: "@rileyanderson_ink", portfolioCount: 29, rating: 4.7, reviewCount: 104, featured: false },

  // Denver (8 artists)
  { id: "91", name: "Parker Rodriguez", bio: "Clean lines and subtle, elegant designs.", avatar: "/api/placeholder/150/150", location: "Downtown Denver, CO", specialties: ["Minimalist"], instagram: "@parkerrodriguez_ink", portfolioCount: 18, rating: 4.8, reviewCount: 75, featured: false },
  { id: "92", name: "Quinn Garcia", bio: "Bold blackwork and geometric patterns.", avatar: "/api/placeholder/150/150", location: "RiNo, CO", specialties: ["Blackwork", "Geometric"], instagram: "@quinngarcia_ink", portfolioCount: 22, rating: 4.6, reviewCount: 87, featured: false },
  { id: "93", name: "Sage Wilson", bio: "Modern twist on traditional tattooing.", avatar: "/api/placeholder/150/150", location: "LoDo, CO", specialties: ["Neo-Traditional"], instagram: "@sagewilson_ink", portfolioCount: 25, rating: 4.7, reviewCount: 89, featured: false },
  { id: "94", name: "River Brown", bio: "Photorealistic portraits and nature scenes.", avatar: "/api/placeholder/150/150", location: "Highlands, CO", specialties: ["Realism", "Portraits"], instagram: "@riverbrown_ink", portfolioCount: 34, rating: 4.9, reviewCount: 121, featured: true },
  { id: "95", name: "Skyler Taylor", bio: "Vibrant watercolor and abstract art.", avatar: "/api/placeholder/150/150", location: "Capitol Hill, CO", specialties: ["Watercolor", "Abstract"], instagram: "@skylertaylor_ink", portfolioCount: 20, rating: 4.8, reviewCount: 83, featured: false },
  { id: "96", name: "Dakota Martinez", bio: "Traditional Japanese irezumi and Oni masks.", avatar: "/api/placeholder/150/150", location: "Baker, CO", specialties: ["Japanese Traditional", "Tribal"], instagram: "@dakotamartinez_ink", portfolioCount: 28, rating: 4.7, reviewCount: 94, featured: false },
  { id: "97", name: "Morgan Lee", bio: "Sacred geometry and mandala designs.", avatar: "/api/placeholder/150/150", location: "City Park, CO", specialties: ["Geometric", "Minimalist"], instagram: "@morganlee_ink", portfolioCount: 27, rating: 4.9, reviewCount: 102, featured: true },
  { id: "98", name: "Casey Thompson", bio: "Classic American traditional with bold colors.", avatar: "/api/placeholder/150/150", location: "Washington Park, CO", specialties: ["Traditional American", "Color"], instagram: "@caseythompson_ink", portfolioCount: 21, rating: 4.6, reviewCount: 77, featured: false },

  // Memphis (2 artists - note: IDs 96-98 overlap with Denver in original data, using 99-100 here)
  { id: "99", name: "Indigo Davis", bio: "Photorealistic portraits and wildlife.", avatar: "/api/placeholder/150/150", location: "East Memphis, TN", specialties: ["Realism", "Portraits"], instagram: "@indigodavis_ink", portfolioCount: 32, rating: 4.9, reviewCount: 116, featured: true },
  { id: "100", name: "Ocean Garcia", bio: "Clean lines and subtle, elegant designs.", avatar: "/api/placeholder/150/150", location: "Germantown, TN", specialties: ["Minimalist"], instagram: "@oceangarcia_ink", portfolioCount: 20, rating: 4.7, reviewCount: 74, featured: false },
]

