"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-white/5 p-10 rounded-2xl border border-white/10 w-[420px] text-center">
        <h1 className="text-2xl font-semibold mb-3">
          Decacorn Labs Admin
        </h1>

        <p className="text-white/60 text-sm mb-8">
          Internal access portal for incoming lead management.
        </p>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => router.push("/login")}
            className="w-full py-3 rounded-lg bg-white text-black font-medium hover:opacity-90 transition"
          >
            Go to Login
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="w-full py-3 rounded-lg border border-white/20 hover:bg-white/10 transition"
          >
            Open Dashboard
          </button>
        </div>

        <div className="mt-8 text-xs text-white/40">
          admin.decacornlabs.com
        </div>
      </div>
    </div>
  );
}
