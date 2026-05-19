import { redirect } from 'next/navigation';

export default function BookmarksPage() {
  // Redirect to dashboard where bookmarks are managed
  redirect('/dashboard');
}
