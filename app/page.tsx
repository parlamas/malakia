// app/page.tsx - Remove the SignOutButton import
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import NavBar from "../components/NavBar";
// Remove this line: import SignOutButton from "../components/SignOutButton";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main className="min-h-screen bg-white text-black">
      <NavBar session={session} />
      <div className="max-w-7xl mx-auto p-8">
        <div className="text-center py-12">
          <h1 className="text-5xl font-bold mb-4">Welcome to MALAKIA COMPANY</h1>
          
        </div>
      </div>
    </main>
  );
}