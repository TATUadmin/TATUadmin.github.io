import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create test artists
  const artists = [
    {
      name: 'Alex Rivera',
      email: 'alex@example.com',
      bio: 'Specializing in traditional and neo-traditional tattoos with over 8 years of experience. I love creating bold, colorful pieces that tell a story.',
      location: 'Los Angeles, CA',
      specialties: ['Traditional', 'Neo-Traditional', 'Portrait'],
      instagram: 'alexrivera_tattoo'
    },
    {
      name: 'Maya Chen',
      email: 'maya@example.com',
      bio: 'Fine line and minimalist tattoo artist. I focus on delicate, meaningful designs that capture the essence of your vision.',
      location: 'New York, NY',
      specialties: ['Minimalist', 'Fine Line', 'Geometric'],
      instagram: 'maya_fineline'
    },
    {
      name: 'Jake Thompson',
      email: 'jake@example.com',
      bio: 'Realism and portrait specialist. From photorealistic portraits to stunning nature scenes, I bring your ideas to life.',
      location: 'Austin, TX',
      specialties: ['Realism', 'Portrait', 'Blackwork'],
      instagram: 'jake_realism_ink'
    },
    {
      name: 'Sofia Martinez',
      email: 'sofia@example.com',
      bio: 'Watercolor and abstract artist. I love experimenting with vibrant colors and fluid designs that flow with your body.',
      location: 'Miami, FL',
      specialties: ['Watercolor', 'Abstract', 'Geometric'],
      instagram: 'sofia_watercolor'
    },
    {
      name: 'David Kim',
      email: 'david@example.com',
      bio: 'Japanese traditional tattoo master. Trained in authentic Japanese techniques, specializing in large-scale traditional pieces.',
      location: 'San Francisco, CA',
      specialties: ['Japanese', 'Traditional', 'Blackwork'],
      instagram: 'david_japanese_ink'
    }
  ]

  for (const artistData of artists) {
    // Create user
    const hashedPassword = await bcrypt.hash('password123', 10)
    
    const user = await prisma.user.create({
      data: {
        name: artistData.name,
        email: artistData.email,
        password: hashedPassword,
        role: 'ARTIST',
        emailVerified: new Date(),
        profile: {
          create: {
            bio: artistData.bio,
            location: artistData.location,
            specialties: artistData.specialties,
            instagram: artistData.instagram,
            completedRegistration: true
          }
        }
      }
    })

    // Create some portfolio items
    const portfolioItems = [
      {
        title: `${artistData.specialties[0]} Design 1`,
        description: `Beautiful ${artistData.specialties[0].toLowerCase()} tattoo design`,
        style: artistData.specialties[0],
        tags: [artistData.specialties[0], 'custom', 'original']
      },
      {
        title: `${artistData.specialties[1] || artistData.specialties[0]} Design 2`,
        description: `Stunning ${(artistData.specialties[1] || artistData.specialties[0]).toLowerCase()} piece`,
        style: artistData.specialties[1] || artistData.specialties[0],
        tags: [artistData.specialties[1] || artistData.specialties[0], 'detailed', 'artistic']
      }
    ]

    for (const item of portfolioItems) {
      await prisma.portfolioItem.create({
        data: {
          ...item,
          imageUrl: `https://picsum.photos/400/600?random=${Math.floor(Math.random() * 1000)}`,
          userId: user.id
        }
      })
    }

    // Create some reviews
    const reviewCount = Math.floor(Math.random() * 10) + 5
    for (let i = 0; i < reviewCount; i++) {
      // Create a customer for the review
      const customer = await prisma.user.upsert({
        where: { email: `customer${i}_${user.id}@example.com` },
        update: {},
        create: {
          name: `Customer ${i + 1}`,
          email: `customer${i}_${user.id}@example.com`,
          password: hashedPassword,
          role: 'CUSTOMER',
          emailVerified: new Date(),
          profile: {
            create: {
              completedRegistration: true
            }
          }
        }
      })

      // Create a shop for the review (simplified)
      const shop = await prisma.shop.upsert({
        where: { id: `shop_${user.id}` },
        update: {},
        create: {
          id: `shop_${user.id}`,
          name: `${artistData.name}'s Studio`,
          address: '123 Main St',
          city: artistData.location.split(',')[0],
          state: artistData.location.split(',')[1]?.trim() || 'CA',
          zipCode: '12345',
          ownerId: user.id
        }
      })

      await prisma.review.create({
        data: {
          rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
          content: `Amazing work by ${artistData.name}! Highly recommend.`,
          userId: customer.id,
          shopId: shop.id
        }
      })
    }

    console.log(`✅ Created artist: ${artistData.name}`)
  }

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 