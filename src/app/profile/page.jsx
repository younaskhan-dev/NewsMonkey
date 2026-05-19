import { UserProfile } from '@clerk/nextjs';

export default function ProfilePage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4 bg-muted/30">
      <UserProfile routing="path" path="/profile" />
    </div>
  );
}
