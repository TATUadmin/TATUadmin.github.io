import { NextResponse } from 'next/server'
import { auth } from '@/app/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { sendArtistInvitation } from '@/lib/email'

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function POST(
  req: Request,
  { params }: { params: { shopId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user || user.role !== 'SHOP_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const shop = await prisma.shop.findUnique({
      where: { id: params.shopId },
    })

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
    }

    if (shop.ownerId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    const { email } = inviteSchema.parse(data)

    // Check if the artist exists
    const artist = await prisma.user.findUnique({
      where: { email },
      include: {
        artistAtShops: {
          where: { shopId: params.shopId },
        },
      },
    })

    if (!artist) {
      return NextResponse.json(
        { error: 'Artist not found. Please make sure they have registered as an artist.' },
        { status: 404 }
      )
    }

    if (artist.role !== 'ARTIST') {
      return NextResponse.json(
        { error: 'The provided email does not belong to an artist.' },
        { status: 400 }
      )
    }

    if (artist.artistAtShops.length > 0) {
      return NextResponse.json(
        { error: 'This artist is already associated with your shop.' },
        { status: 400 }
      )
    }

    // Create the association
    await prisma.shopsOnArtists.create({
      data: {
        shopId: params.shopId,
        artistId: artist.id,
      },
    })

    // Send email notification to the artist
    await sendArtistInvitation({
      artistEmail: email,
      artistName: artist.name || 'Artist',
      shopName: shop.name,
      inviteLink: `${process.env.NEXTAUTH_URL}/dashboard/artists/shops/${params.shopId}/accept`,
    })

    return NextResponse.json({ message: 'Artist invited successfully' })
  } catch (error) {
    console.error('Error inviting artist:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 