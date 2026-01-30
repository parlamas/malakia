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
              AUTH-O
            </a>
          </div>
          
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <span className="text-black">Welcome, {session.user?.email}</span>
                <SignOutButton />
              </>
            ) : (
              <>
                <a
                  href="/auth/signin"
                  className="text-black hover:text-blue-500 px-3 py-2"
                >
                  Sign In
                </a>
                <a
                  href="/auth/signup"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Sign Up
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}