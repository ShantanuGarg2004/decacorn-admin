"use client";

import { useRouter } from "next/navigation";

interface Props {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: Props) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 shadow-sm">
      
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger */}
        <button
          onClick={onMenuClick}
          className="md:hidden text-xl"
        >
          ☰
        </button>

        <div className="text-base md:text-lg font-semibold">
          Lead Management System
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleLogout}
          className="px-3 md:px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
