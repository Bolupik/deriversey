import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast({
          title: "Check your email",
          description: "We sent you a verification link. Please verify your email to sign in.",
        });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-transparent border-b border-border/50 py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors font-mono";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 grain relative">
      {/* Editorial layout */}
      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <Activity className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold tracking-tight">Deriverse</span>
          </div>

          {/* Massive headline */}
          <h1 className="text-massive mb-3">
            {isLogin ? "Welcome back" : "Start trading"}
          </h1>
          <p className="text-sm text-muted-foreground mb-10 max-w-xs">
            {isLogin ? "Sign in to access your trading journal and analytics." : "Create your account to begin tracking performance."}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-0">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="relative"
              >
                <User className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={inputClass}
                  style={{ paddingLeft: "2rem" }}
                  required
                />
              </motion.div>
            )}
            <div className="relative">
              <Mail className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                style={{ paddingLeft: "2rem" }}
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                style={{ paddingLeft: "2rem" }}
                required
                minLength={6}
              />
            </div>

            <div className="pt-8">
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 text-foreground text-sm font-medium group disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </motion.button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-border/20">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up →" : "Already have an account? Sign in →"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
