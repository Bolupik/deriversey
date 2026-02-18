import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Activity, BarChart3, BookOpen, LineChart, User, LogOut, Menu, X, Briefcase } from "lucide-react";
import { useState } from "react";
import { WalletButton } from "@/components/WalletButton";
import { MarketTicker } from "@/components/dashboard/MarketTicker";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { to: "/", label: "Dashboard", icon: BarChart3 },
  { to: "/journal", label: "Journal", icon: BookOpen },
  { to: "/analytics", label: "Analytics", icon: LineChart },
  { to: "/portfolio", label: "Portfolio", icon: Briefcase },
  { to: "/profile", label: "Profile", icon: User },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Market Ticker Bar */}
      <div className="border-b border-border bg-card/20 overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <MarketTicker />
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-border glass sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center glow-primary">
              <Activity className="h-4.5 w-4.5 text-primary" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold text-foreground tracking-tight leading-none">
                Deriverse
              </h1>
              <p className="text-[10px] text-muted-foreground mt-0.5">Solana Analytics</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5 bg-muted/30 rounded-lg p-1">
            {navItems.map(({ to, label, icon: Icon }) => {
              const isActive = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
              return (
                <RouterNavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 bg-primary rounded-md"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </span>
                </RouterNavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <WalletButton />
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-profit/10 text-profit border border-profit/20">
              <span className="h-1.5 w-1.5 rounded-full bg-profit animate-pulse-glow" />
              Mainnet
            </span>
            <span className="text-xs text-muted-foreground hidden lg:inline truncate max-w-[120px]">{user?.email}</span>
            <button onClick={signOut} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground">
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-border overflow-hidden"
            >
              <div className="px-4 py-2 space-y-1">
                {navItems.map(({ to, label, icon: Icon }) => (
                  <RouterNavLink
                    key={to}
                    to={to}
                    end={to === "/"}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2.5 rounded-md text-sm transition-colors ${
                        isActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </RouterNavLink>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
