import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth';

export async function POST(
  request: Request,
  { params }: { params: { messageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const messageId = params.messageId;

    // Verify the message belongs to the user
    const message = await prisma.unifiedMessage.findFirst({
      where: {
        id: messageId,
        userId: session.user.id,
      },
    });

    if (!message) {
      return new NextResponse('Message not found', { status: 404 });
    }

    // Update message status
    await prisma.unifiedMessage.update({
      where: {
        id: messageId,
      },
      data: {
        status: 'READ',
      },
    });

    return new NextResponse('Message marked as read', { status: 200 });
  } catch (error) {
    console.error('Error marking message as read:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 