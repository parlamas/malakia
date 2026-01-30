// app/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import NavBar from "../components/NavBar";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main className="min-h-screen bg-white text-black">
      <NavBar session={session} />
      <div className="max-w-7xl mx-auto p-8">
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold mb-4">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
              <div className="text-center">
                <div className="text-2xl">Καλώς ήλθατε</div>
                <div className="text-xl mt-2">ΣΤΟΝ ΚΟΣΜΟ ΤΗΣ ΜΑΛΑΚΙΑΣ</div>
              </div>
              <div className="hidden md:block text-gray-400 text-3xl">|</div>
              <div className="text-center">
                <div className="text-2xl">Welcome to</div>
                <div className="text-xl mt-2">THE WORLD OF CALLOUSNESS</div>
              </div>
            </div>
          </h1>
        </div>
      </div>
    </main>
  );
}