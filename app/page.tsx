// app/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import SignOutButton from "../components/SignOutButton";
import NavBar from "../components/NavBar";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main className="min-h-screen bg-white text-black">
      <NavBar session={session} />
      <div className="p-8">
        <h1 className="text-3xl font-bold">Welcome to AUTH-O</h1>
        {session ? (
          <div className="mt-4">
            <p>Welcome, {session.user?.email}</p>
            <div className="mt-4">
              <SignOutButton />
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <p>You are not signed in</p>
            <div className="mt-4 space-y-4">
              <a 
                href="/auth/signin" 
                className="inline-block bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
              >
                Sign In
              </a>
              <p className="mt-2">
                Don't have an account?{" "}
                <a href="/auth/signup" className="text-blue-500 hover:underline">
                  Sign up
                </a>
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}