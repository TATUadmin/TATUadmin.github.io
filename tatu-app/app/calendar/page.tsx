import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import UnifiedCalendar from '@/app/components/UnifiedCalendar'

export const metadata = {
  title: 'Unified Calendar | TATU',
  description: 'Manage all your appointments from one unified calendar',
}

export default async function CalendarPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/api/auth/signin?callbackUrl=/calendar')
  }

  // Get user's subscription tier
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: {
        select: {
          subscriptionTier: true,
        },
      },
    },
  })

  const tier = user?.profile?.subscriptionTier || 'FREE'

  return (
    <div className="min-h-screen">
      <UnifiedCalendar userId={session.user.id} userTier={tier} />
    </div>
  )
}
