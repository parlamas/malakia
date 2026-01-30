// app/page.tsx
"use client";

import { useSession } from "next-auth/react";
import SignOutButton from "../components/SignOutButton";

export default function Home() {
  const { data: session } = useSession();

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">Welcome to AUTH-O</h1>
      {session ? (
        <div>
          <p>Welcome, {session.user?.email}</p>
          <SignOutButton />
        </div>
      ) : (
        <div>
          <p>You are not signed in</p>
          <a href="/auth/signin" className="text-blue-500 hover:underline">
            Sign In
          </a>
        </div>
      )}
    </main>
  );
}

