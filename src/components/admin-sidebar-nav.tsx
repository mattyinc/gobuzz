"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, Waves } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarDays, exact: false },
  { href: "/admin/facilities", label: "Facilities", icon: Waves, exact: false },
];

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin navigation" className="flex gap-1 overflow-x-auto lg:flex-col lg:gap-1.5 lg:overflow-visible">
      {links.map(({ href, label, icon: Icon, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex h-10 shrink-0 items-center gap-2.5 rounded-lg px-3 text-[13px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d7b95d]",
              isActive
                ? "bg-[#d2b45a] text-[#17150f]"
                : "text-[#b9b09d] hover:bg-white/7 hover:text-[#fffaf0]"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
