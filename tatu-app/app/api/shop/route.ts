import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // TODO: Get user ID from session and verify they're a shop owner
    const userId = 'temp-user' // For now, use temp user

    const shop = await prisma.shop.findFirst({
      where: { ownerId: userId },
      include: {
        _count: {
          select: {
            artists: true
          }
        }
      }
    })

    if (!shop) {
      return NextResponse.json(null)
    }

    const response = {
      id: shop.id,
      name: shop.name,
      description: shop.description,
      address: shop.address,
      phone: shop.phone,
      email: shop.email,
      website: shop.website,
      instagram: shop.instagram,
      hours: {}, // TODO: Add hours field to schema
      images: [], // TODO: Add images field to schema
      status: shop.status,
      artistCount: shop._count.artists
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching shop:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shop information' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { name, description, address, phone, website, instagram } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Shop name is required' },
        { status: 400 }
      )
    }

    // TODO: Get user ID from session
    const userId = 'temp-user' // For now, use temp user

    // Check if shop exists, create if not
    const existingShop = await prisma.shop.findFirst({
      where: { ownerId: userId }
    })

    let shop
    if (existingShop) {
      shop = await prisma.shop.update({
        where: { id: existingShop.id },
        data: {
          name,
          description: description || '',
          address: address || '',
          phone: phone || '',
          website: website || '',
          instagram: instagram || ''
        }
      })
    } else {
      shop = await prisma.shop.create({
        data: {
          name,
          description: description || '',
          address: address || '',
          city: '', // Required field
          state: '', // Required field  
          zipCode: '', // Required field
          phone: phone || '',
          website: website || '',
          instagram: instagram || '',
          ownerId: userId,
          status: 'ACTIVE'
        }
      })
    }

    return NextResponse.json(shop)
  } catch (error) {
    console.error('Error updating shop:', error)
    return NextResponse.json(
      { error: 'Failed to update shop information' },
      { status: 500 }
    )
  }
} 