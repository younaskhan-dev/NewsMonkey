import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4 bg-muted/30">
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
    </div>
  );
}
