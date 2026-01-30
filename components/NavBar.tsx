// components/NavBar.tsx

import { Session } from "next-auth";
import SignOutButton from "./SignOutButton";

interface NavBarProps {
  session: Session | null;
}

export default function NavBar({ session }: NavBarProps) {
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <a href="/" className="text-xl font-bold text-black">
              MALAKIA COMPANY
            </a>
          </div>
          
          <div className="flex items-center space-x-4">
            {session ? (
              // For signed-in users: Show Profile + Sign Out
              <>
                <a
                  href="/profile"
                  className="text-black hover:text-blue-500 px-3 py-2"
                >
                  Profile
                </a>
                <SignOutButton />
              </>
            ) : (
              // For visitors: Show ONLY Sign In button
              <a
                href="/auth/signin"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Sign In
              </a>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

