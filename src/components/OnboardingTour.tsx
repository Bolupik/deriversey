import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, BarChart3, BookOpen, LineChart, Briefcase, Sparkles } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface TourStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  targetSelector?: string;
  route?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome to Deriverse",
    description: "Your all-in-one Solana trading analytics terminal. Let's walk through the key features.",
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    title: "Dashboard",
    description: "See your P&L charts, win rates, fee breakdowns, and live candlestick price data — all at a glance.",
    icon: <BarChart3 className="h-5 w-5" />,
    route: "/",
  },
  {
    title: "Trade Journal",
    description: "Log trades manually, import on-chain swaps from your wallet, or auto-import Drift/Zeta perp positions.",
    icon: <BookOpen className="h-5 w-5" />,
    route: "/journal",
  },
  {
    title: "Analytics",
    description: "Deep-dive into performance by hour, day, symbol, session, and order type to find your edge.",
    icon: <LineChart className="h-5 w-5" />,
    route: "/analytics",
  },
  {
    title: "Portfolio",
    description: "Connect your Solana wallet to see token holdings, USD values, and interactive price charts.",
    icon: <Briefcase className="h-5 w-5" />,
    route: "/portfolio",
  },
  {
    title: "You're all set!",
    description: "Start by adding your first trade or connecting your wallet. Happy trading!",
    icon: <Sparkles className="h-5 w-5" />,
    route: "/",
  },
];

const STORAGE_KEY = "deriverse_tour_completed";

export function OnboardingTour() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      // Small delay so the page renders first
      const t = setTimeout(() => setActive(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const close = useCallback(() => {
    setActive(false);
    localStorage.setItem(STORAGE_KEY, "true");
  }, []);

  const goTo = useCallback(
    (nextStep: number) => {
      if (nextStep >= TOUR_STEPS.length) {
        close();
        return;
      }
      setStep(nextStep);
      const targetRoute = TOUR_STEPS[nextStep].route;
      if (targetRoute && location.pathname !== targetRoute) {
        navigate(targetRoute);
      }
    },
    [close, location.pathname, navigate]
  );

  if (!active) return null;

  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;

  return (
    <AnimatePresence>
      {active && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/60 backdrop-blur-sm"
            onClick={close}
          />

          {/* Tour Card */}
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
            className="fixed z-[101] bottom-6 left-1/2 -translate-x-1/2 w-[90vw] max-w-md"
          >
            <div className="rounded-2xl border border-border bg-card shadow-2xl shadow-primary/5 overflow-hidden">
              {/* Progress bar */}
              <div className="h-1 bg-muted">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${((step + 1) / TOUR_STEPS.length) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      {current.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{current.title}</h3>
                      <p className="text-[10px] text-muted-foreground">
                        Step {step + 1} of {TOUR_STEPS.length}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={close}
                    className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {current.description}
                </p>

                <div className="flex items-center justify-between">
                  <button
                    onClick={close}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Skip tour
                  </button>
                  <div className="flex items-center gap-2">
                    {step > 0 && (
                      <button
                        onClick={() => goTo(step - 1)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted/50 transition-colors"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                        Back
                      </button>
                    )}
                    <button
                      onClick={() => goTo(step + 1)}
                      className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
                    >
                      {isLast ? "Get Started" : "Next"}
                      {!isLast && <ChevronRight className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/** Call this to reset the tour (e.g. from profile/settings) */
export function resetOnboardingTour() {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
}
