"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LayoutDashboard, MessageSquare, QrCode, Settings, LogOut, Store, CreditCard, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Questions", href: "/dashboard/questions", icon: MessageSquare },
  { name: "Locations", href: "/dashboard/locations", icon: MapPin },
  { name: "QR Code", href: "/dashboard/qr", icon: QrCode },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Billing & Plans", href: "/dashboard/billing", icon: CreditCard },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex h-full w-64 flex-col gap-4 border-r bg-muted/40 p-4 shrink-0 hidden md:flex">
      <div className="flex items-center gap-2 px-2 pb-4 pt-2 group cursor-pointer transition-transform duration-300 hover:scale-[1.02]">
        <div className="p-1.5 bg-blue-600/10 rounded-lg group-hover:bg-blue-600/20 transition-colors">
          <Store className="h-5 w-5 text-blue-600" />
        </div>
        <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Review Assistant</span>
      </div>

      <nav className="flex-1 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-blue-600/10 text-blue-700 font-semibold shadow-sm"
                  : "text-gray-500 hover:bg-gray-100/80 hover:text-gray-900 hover:translate-x-1"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-2">

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 transition-all duration-200 hover:bg-red-50 hover:text-red-600 hover:translate-x-1"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
