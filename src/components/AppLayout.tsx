import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Activity, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { WalletButton } from "@/components/WalletButton";
import { MarketTicker } from "@/components/dashboard/MarketTicker";
import { MagneticDock } from "@/components/MagneticDock";
import { LenisProvider } from "@/components/LenisProvider";
import { OnboardingTour } from "@/components/OnboardingTour";
import { motion, AnimatePresence } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0, y: 30, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -20, filter: "blur(4px)" },
};

const pageTransition = {
  type: "spring",
  stiffness: 200,
  damping: 30,
  mass: 1,
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <LenisProvider>
      <div className="min-h-screen bg-background grain relative">
        {/* Minimal top bar */}
        <header className="fixed top-0 left-0 right-0 z-40 border-b border-border/30">
          <div className="bg-background/80 backdrop-blur-sm">
            <div className="max-w-[1600px] mx-auto px-6 sm:px-8">
              {/* Ticker */}
              <div className="border-b border-border/20 overflow-hidden">
                <MarketTicker />
              </div>

              {/* Top bar */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold tracking-tight text-foreground">Deriverse</span>
                  <span className="text-overline hidden sm:inline ml-2">Solana Analytics</span>
                </div>

                <div className="flex items-center gap-3">
                  <WalletButton />
                  <span className="text-overline hidden lg:inline truncate max-w-[140px]">{user?.email}</span>
                  <button
                    onClick={signOut}
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile nav overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-background/95 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            >
              <div className="pt-32 px-8 space-y-4">
                {[
                  { to: "/", label: "Dashboard" },
                  { to: "/journal", label: "Journal" },
                  { to: "/analytics", label: "Analytics" },
                  { to: "/portfolio", label: "Portfolio" },
                  { to: "/profile", label: "Profile" },
                ].map(({ to, label }, i) => (
                  <motion.a
                    key={to}
                    href={to}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="block text-3xl font-editorial text-foreground hover:text-primary transition-colors"
                  >
                    {label}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="relative z-10 max-w-[1600px] mx-auto px-6 sm:px-8 pt-28 pb-24">
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

        {/* Floating dock nav — hidden on mobile */}
        <div className="hidden md:block">
          <MagneticDock />
        </div>

        <OnboardingTour />
      </div>
    </LenisProvider>
  );
}
