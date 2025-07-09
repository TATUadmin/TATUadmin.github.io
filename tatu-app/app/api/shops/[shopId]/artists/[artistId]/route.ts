import { NextResponse } from 'next/server'
import { auth } from '@/app/auth'
import { prisma } from '@/lib/prisma'
import { sendArtistRemovalNotification } from '@/lib/email'

export async function DELETE(
  req: Request,
  { params }: { params: { shopId: string; artistId: string } }
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

    // Check if the artist is associated with the shop
    const association = await prisma.shopsOnArtists.findUnique({
      where: {
        shopId_artistId: {
          shopId: params.shopId,
          artistId: params.artistId,
        },
      },
    })

    if (!association) {
      return NextResponse.json(
        { error: 'Artist is not associated with this shop' },
        { status: 404 }
      )
    }

    // Remove the association
    await prisma.shopsOnArtists.delete({
      where: {
        shopId_artistId: {
          shopId: params.shopId,
          artistId: params.artistId,
        },
      },
    })

    // Get artist details for email notification
    const removedArtist = await prisma.user.findUnique({
      where: { id: params.artistId },
      select: {
        email: true,
        name: true,
      },
    })

    if (removedArtist) {
      await sendArtistRemovalNotification({
        artistEmail: removedArtist.email,
        artistName: removedArtist.name || 'Artist',
        shopName: shop.name,
      })
    }

    return NextResponse.json({ message: 'Artist removed successfully' })
  } catch (error) {
    console.error('Error removing artist:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 