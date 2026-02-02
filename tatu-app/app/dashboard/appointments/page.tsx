import { redirect } from 'next/navigation'

// Redirect old appointments route to unified calendar
export default function AppointmentsPage() {
  redirect('/dashboard/calendar')
}
