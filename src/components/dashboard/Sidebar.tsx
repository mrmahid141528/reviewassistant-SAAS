"use client";

import React from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LayoutDashboard, MessageSquare, QrCode, Settings, LogOut, Store, CreditCard, MapPin, BarChart3, HelpCircle, User, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const mainNavigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Review Questions", href: "/dashboard/questions", icon: MessageSquare },
  { name: "QR & Review Links", href: "/dashboard/qr", icon: QrCode },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Locations", href: "/dashboard/locations", icon: MapPin },
];

const settingsNavigation = [
  {
    name: "Settings",
    icon: Settings,
    subItems: [
      { name: "Business", href: "/dashboard/settings/business" },
      { name: "Review Experience", href: "/dashboard/settings/review-experience" },
      { name: "AI Assistant", href: "/dashboard/settings/ai-assistant" },
      { name: "Notifications", href: "/dashboard/settings/notifications" },
      { name: "Team & Permissions", href: "/dashboard/settings/team" },
    ]
  },
  {
    name: "Billing & Plans",
    icon: CreditCard,
    subItems: [
      { name: "Subscription", href: "/dashboard/billing/subscription" },
      { name: "Usage", href: "/dashboard/billing/usage" },
      { name: "Plans", href: "/dashboard/billing/plans" },
      { name: "Payment Method", href: "/dashboard/billing/payment-method" },
      { name: "Billing Info", href: "/dashboard/billing/billing-info" },
      { name: "History", href: "/dashboard/billing/history" },
    ]
  },
];

const supportNavigation = [
  { name: "Help & Support", href: "/dashboard/support", icon: HelpCircle },
  { name: "Profile", href: "/dashboard/profile", icon: User },
];

export function Sidebar({ role, className, onNavClick, brandSettings }: { role?: string, className?: string, onNavClick?: () => void, brandSettings?: { platformName?: string; logoUrl?: string | null; } }) {
  const pathname = usePathname();
  const router = useRouter();
  const [openMenus, setOpenMenus] = React.useState<Record<string, boolean>>({});

  // Auto-open menus that contain the active matching subpath
  React.useEffect(() => {
    const newOpenMenus = { ...openMenus };
    let changed = false;
    settingsNavigation.forEach(item => {
      if (item.subItems?.some(s => pathname === s.href || pathname.startsWith(`${s.href}/`))) {
        if (!newOpenMenus[item.name]) {
          newOpenMenus[item.name] = true;
          changed = true;
        }
      }
    });
    if (changed) setOpenMenus(newOpenMenus);
  }, [pathname]);

  const NavLinkComponent = ({ item, pathname }: { item: any, pathname: string }) => {
    if (item.subItems) {
      // Accordion mode
      const isOpen = openMenus[item.name] || false;
      const hasActiveChild = item.subItems.some((s: any) => pathname === s.href || pathname.startsWith(`${s.href}/`));

      return (
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setOpenMenus(prev => ({ ...prev, [item.name]: !isOpen }))}
            className={cn(
              "flex items-center justify-between w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              hasActiveChild
                ? "text-slate-900 bg-slate-100/50 shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon className={cn("h-4 w-4", hasActiveChild ? "text-primary" : "")} />
              {item.name}
            </div>
            <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-200", isOpen && "rotate-180")} />
          </button>

          <div className={cn("flex flex-col gap-1 overflow-hidden transition-all duration-300 ml-4 pl-3 border-l border-border", isOpen ? "max-h-[500px] opacity-100 mt-1" : "max-h-0 opacity-0")}>
            {item.subItems.map((sub: any) => {
              const isSubActive = pathname === sub.href;
              // Filter out restricted subItems if needed (no longer nested for Billing)

              return (
                <Link
                  key={sub.name}
                  href={sub.href}
                  onClick={onNavClick}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                    isSubActive
                      ? "bg-slate-900 text-white font-semibold shadow-sm"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 hover:translate-x-1"
                  )}
                >
                  {sub.name}
                </Link>
              );
            })}
          </div>
        </div>
      );
    }

    // Normal link
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

  // If viewer or manager, hide Billing entire panel
  const filteredSettings = settingsNavigation.filter(item => {
    if (item.name === "Billing & Plans" && (role === "manager" || role === "viewer")) return false;
    return true;
  });

  return (
    <div className={cn("flex h-full w-64 flex-col gap-6 border-r border-border bg-card p-4 shrink-0 hidden md:flex overflow-y-auto", className)}>
      <div className="flex items-center gap-2 px-1 pb-4 pt-1 group cursor-pointer transition-transform duration-300 hover:scale-[1.02]">
        {brandSettings?.logoUrl ? (
          <div className="flex items-center h-16 w-full mb-1">
            <img src={brandSettings.logoUrl} alt="Platform Logo" className="h-full object-contain max-h-16 w-auto" />
          </div>
        ) : (
          <div className="p-1.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
            <Store className="h-5 w-5 text-primary" />
          </div>
        )}
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
