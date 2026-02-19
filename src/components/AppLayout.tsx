import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Activity, BarChart3, BookOpen, LineChart, User, LogOut, Menu, X, Briefcase } from "lucide-react";
import { useState } from "react";
import { WalletButton } from "@/components/WalletButton";
import { MarketTicker } from "@/components/dashboard/MarketTicker";
import { motion, AnimatePresence } from "framer-motion";
import { OnboardingTour } from "@/components/OnboardingTour";

const navItems = [
  { to: "/", label: "Dashboard", icon: BarChart3 },
  { to: "/journal", label: "Journal", icon: BookOpen },
  { to: "/analytics", label: "Analytics", icon: LineChart },
  { to: "/portfolio", label: "Portfolio", icon: Briefcase },
  { to: "/profile", label: "Profile", icon: User },
];

const pageVariants = {
  initial: { opacity: 0, x: 24, filter: "blur(4px)" },
  animate: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit: { opacity: 0, x: -24, filter: "blur(4px)" },
};

const pageTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/4 w-[800px] h-[600px] rounded-full bg-primary/[0.03] blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[500px] rounded-full bg-primary/[0.02] blur-[120px]" />
      </div>

      {/* Market Ticker Bar */}
      <div className="relative z-10 border-b border-border/50 bg-card/10 overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <MarketTicker />
        </div>
      </div>

      {/* Header */}
      <header className="relative z-50 border-b border-border/50 glass sticky top-0">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center glow-primary"
            >
              <Activity className="h-4.5 w-4.5 text-primary" />
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold text-foreground tracking-tight leading-none">
                Deriverse
              </h1>
              <p className="text-[10px] text-muted-foreground mt-0.5">Solana Analytics</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5 bg-muted/20 rounded-xl p-1 border border-border/30">
            {navItems.map(({ to, label, icon: Icon }) => {
              const isActive = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
              return (
                <RouterNavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 bg-primary rounded-lg shadow-lg"
                      style={{ boxShadow: "0 0 20px -4px hsl(162 85% 45% / 0.3)" }}
                      transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
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
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-medium bg-profit/10 text-profit border border-profit/20">
              <span className="h-1.5 w-1.5 rounded-full bg-profit animate-pulse-glow" />
              Mainnet
            </span>
            <span className="text-xs text-muted-foreground hidden lg:inline truncate max-w-[120px]">{user?.email}</span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={signOut}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </motion.button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
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
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="md:hidden border-t border-border/50 overflow-hidden glass"
            >
              <div className="px-4 py-3 space-y-1">
                {navItems.map(({ to, label, icon: Icon }, i) => (
                  <motion.div
                    key={to}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <RouterNavLink
                      to={to}
                      end={to === "/"}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          isActive ? "bg-primary/10 text-primary border-glow" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                        }`
                      }
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </RouterNavLink>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <OnboardingTour />
    </div>
  );
}
