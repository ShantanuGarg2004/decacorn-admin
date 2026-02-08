"use client";

import { useState } from "react";
import Sidebar from "@/components/crm/Sidebar";
import Navbar from "@/components/crm/Navbar";

export default function CRMLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col">
        <Navbar onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
