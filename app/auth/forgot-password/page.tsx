// app/auth/forgot-password/page.tsx

"use client";

import { useState } from "react";
import NavBar from "../../../components/NavBar";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setMessage(data.message || "If the email exists, a reset link was sent.");
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <NavBar />

      <div className="flex justify-center py-12">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md space-y-6 p-6"
        >
          <h1 className="text-2xl font-bold">Forgot Password</h1>

          {message && (
            <div className="border border-gray-300 p-3 text-sm">
              {message}
            </div>
          )}

          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border p-3"
          />

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-3 rounded"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
      </div>
    </div>
  );
}
