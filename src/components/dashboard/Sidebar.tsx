"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LayoutDashboard, MessageSquare, QrCode, Settings, LogOut, Store, CreditCard, MapPin, BarChart3, HelpCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const mainNavigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Review Questions", href: "/dashboard/questions", icon: MessageSquare },
  { name: "QR & Review Links", href: "/dashboard/qr", icon: QrCode },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Locations", href: "/dashboard/locations", icon: MapPin },
];

const settingsNavigation = [
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Billing & Plans", href: "/dashboard/billing", icon: CreditCard },
];

const supportNavigation = [
  { name: "Help & Support", href: "/dashboard/support", icon: HelpCircle },
  { name: "Profile", href: "/dashboard/profile", icon: User },
];

export function Sidebar({ role, className, onNavClick }: { role?: string, className?: string, onNavClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const NavLinkComponent = ({ item, pathname }: { item: any, pathname: string }) => {
    const isDashboardRoot = item.href === "/dashboard";
    const isActive = isDashboardRoot
      ? pathname === "/dashboard"
      : pathname === item.href || pathname.startsWith(`${item.href}/`);
    return (
      <Link
        href={item.href}
        onClick={onNavClick}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-slate-900 text-white font-semibold shadow-sm"
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 hover:translate-x-1"
        )}
      >
        <item.icon className={cn("h-4 w-4", isActive ? "text-white" : "")} />
        {item.name}
      </Link>
    );
  }

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  // If viewer or manager, hide Billing
  const filteredSettings = settingsNavigation.filter(item => {
    if (item.name === "Billing & Plans" && (role === "manager" || role === "viewer")) return false;
    return true;
  });

  return (
    <div className={cn("flex h-full w-64 flex-col gap-6 border-r border-border bg-card p-4 shrink-0 hidden md:flex overflow-y-auto", className)}>
      <div className="flex items-center gap-2 px-2 pb-2 group cursor-pointer transition-transform duration-300 hover:scale-[1.02]">
        <div className="p-1.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
          <Store className="h-5 w-5 text-primary" />
        </div>
        <span className="font-bold text-lg text-foreground">Review Assistant</span>
      </div>

      <nav className="space-y-1">
        {mainNavigation.map((item) => (
          <NavLinkComponent key={item.name} item={item} pathname={pathname} />
        ))}
      </nav>

      <div className="border-t border-border"></div>

      <nav className="space-y-1">
        {filteredSettings.map((item) => (
          <NavLinkComponent key={item.name} item={item} pathname={pathname} />
        ))}
      </nav>

      <div className="border-t border-border"></div>

      <nav className="space-y-1">
        {supportNavigation.map((item) => (
          <NavLinkComponent key={item.name} item={item} pathname={pathname} />
        ))}
      </nav>

      <div className="mt-auto space-y-2 pt-4">
        <button
          onClick={handleLogout}
          suppressHydrationWarning
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive hover:translate-x-1"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
