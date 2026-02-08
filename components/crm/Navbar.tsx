"use client";

import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="text-lg font-semibold">
        Lead Management System
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
