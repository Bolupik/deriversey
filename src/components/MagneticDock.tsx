import { useRef, useState, useCallback } from "react";
import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { BarChart3, BookOpen, LineChart, Briefcase, User } from "lucide-react";
import { motion, useSpring, useMotionValue } from "framer-motion";

const navItems = [
  { to: "/", label: "Dashboard", icon: BarChart3 },
  { to: "/journal", label: "Journal", icon: BookOpen },
  { to: "/analytics", label: "Analytics", icon: LineChart },
  { to: "/portfolio", label: "Portfolio", icon: Briefcase },
  { to: "/profile", label: "Profile", icon: User },
];

function MagneticItem({ to, label, icon: Icon, isActive }: {
  to: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 300, damping: 20, mass: 0.5 });
  const scale = useSpring(1, { stiffness: 400, damping: 25 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distX = (e.clientX - centerX) * 0.3;
    const distY = (e.clientY - centerY) * 0.3;
    x.set(distX);
    y.set(distY);
    scale.set(1.15);
  }, [x, y, scale]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
    scale.set(1);
    setHovered(false);
  }, [x, y, scale]);

  return (
    <motion.div
      style={{ x: springX, y: springY, scale }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative"
    >
      <RouterNavLink
        ref={ref}
        to={to}
        end={to === "/"}
        className={`relative flex items-center justify-center w-11 h-11 rounded-2xl transition-colors duration-200 ${
          isActive
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2.5 : 1.8} />
        {isActive && (
          <motion.div
            layoutId="dock-indicator"
            className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-primary"
            transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
          />
        )}
      </RouterNavLink>

      {/* Tooltip */}
      {hovered && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6 }}
          className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md bg-foreground text-background text-[10px] font-medium whitespace-nowrap pointer-events-none"
        >
          {label}
        </motion.div>
      )}
    </motion.div>
  );
}

export function MagneticDock() {
  const location = useLocation();

  return (
    <motion.nav
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 25 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-card/90 backdrop-blur-md border border-border/50 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)]">
        {navItems.map(({ to, label, icon }) => {
          const isActive = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
          return (
            <MagneticItem
              key={to}
              to={to}
              label={label}
              icon={icon}
              isActive={isActive}
            />
          );
        })}
      </div>
    </motion.nav>
  );
}
