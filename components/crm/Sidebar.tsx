"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Leads", href: "/leads" },
    { name: "Pipeline", href: "/pipeline" },
    { name: "Forecast", href: "/forecast" },
    { name: "Archived", href: "/archived" },
  ];

  return (
    <aside className="w-60 bg-white border-r border-gray-200 hidden md:flex flex-col shadow-sm">
      
      {/* Logo / Title */}
      <div className="h-16 flex items-center px-6 border-b font-semibold text-lg">
        Decacorn CRM
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-black text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {/* Active Indicator */}
              {isActive && (
                <span className="absolute left-0 top-0 h-full w-1 bg-black rounded-r"></span>
              )}

              <span className="ml-2">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
