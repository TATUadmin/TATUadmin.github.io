import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/auth'
import { prisma } from '@/lib/prisma'
import UnifiedCalendar from '@/app/components/UnifiedCalendar'
import DashboardLayout from '../../components/DashboardLayout'

export const metadata = {
  title: 'Calendar & Appointments | TATU Dashboard',
  description: 'Unified calendar for managing appointments and events',
}

export default async function DashboardCalendarPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/dashboard/calendar')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      artistProfile: {
        select: {
          subscriptionTier: true,
        },
      },
    },
  })

  const tier = user?.artistProfile?.subscriptionTier || 'FREE'

  return (
    <DashboardLayout userRole="artist">
      <div className="min-h-screen bg-black">
        <UnifiedCalendar userId={session.user.id} userTier={tier} />
      </div>
    </DashboardLayout>
  )
}

