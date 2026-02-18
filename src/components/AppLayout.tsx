import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Activity, BarChart3, BookOpen, LineChart, User, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { WalletButton } from "@/components/WalletButton";
import { MarketTicker } from "@/components/dashboard/MarketTicker";

const navItems = [
  { to: "/", label: "Dashboard", icon: BarChart3 },
  { to: "/journal", label: "Journal", icon: BookOpen },
  { to: "/analytics", label: "Analytics", icon: LineChart },
  { to: "/profile", label: "Profile", icon: User },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Market Ticker Bar */}
      <div className="border-b border-border bg-card/30 px-4 sm:px-6 py-1.5">
        <div className="max-w-[1600px] mx-auto">
          <MarketTicker />
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center glow-primary">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold text-foreground tracking-tight">Deriverse Analytics</h1>
              <p className="text-[10px] text-muted-foreground">Trading Journal & Portfolio Analysis</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <RouterNavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`
                }
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </RouterNavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <WalletButton />
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-profit/10 text-profit">
              <span className="h-1.5 w-1.5 rounded-full bg-profit animate-pulse-glow" />
              Mainnet
            </span>
            <span className="text-xs text-muted-foreground hidden lg:inline truncate max-w-[150px]">{user?.email}</span>
            <button onClick={signOut} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground">
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border px-4 py-2 space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <RouterNavLink
                key={to}
                to={to}
                end={to === "/"}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </RouterNavLink>
            ))}
          </div>
        )}
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
    </div>
  );
}
