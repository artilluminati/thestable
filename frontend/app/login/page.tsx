import { Suspense } from "react";

import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      {/* useSearchParams() (for the "session expired" banner) requires a
          Suspense boundary so the page can still be statically optimized. */}
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
