"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  mobileOpen,
  onClose,
}: Props) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Leads", href: "/leads" },
    { name: "Pipeline", href: "/pipeline" },
    { name: "Forecast", href: "/forecast" },
    { name: "Archived", href: "/archived" },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 bg-white border-r border-gray-200 flex-col shadow-sm">
        <SidebarContent navItems={navItems} pathname={pathname} />
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-64 bg-white shadow-lg">
            <SidebarContent
              navItems={navItems}
              pathname={pathname}
              onClose={onClose}
            />
          </div>

          <div
            className="flex-1 bg-black/30"
            onClick={onClose}
          />
        </div>
      )}
    </>
  );
}

function SidebarContent({
  navItems,
  pathname,
  onClose,
}: any) {
  return (
    <div className="h-full flex flex-col">
      <div className="h-16 flex items-center px-6 border-b font-semibold text-lg">
        Decacorn CRM
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item: any) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`block px-4 py-2 rounded-lg text-sm font-medium transition ${
                isActive
                  ? "bg-black text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
