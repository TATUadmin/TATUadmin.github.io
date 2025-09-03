import { redirect } from 'next/navigation';

export default function InboxPage() {
  // Redirect to dashboard inbox for now to avoid type issues
  redirect('/dashboard/inbox');
} 