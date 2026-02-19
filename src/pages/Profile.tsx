import { useState } from "react";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";
import { motion } from "framer-motion";

const ALL_SYMBOLS = ["SOL-PERP", "BTC-PERP", "ETH-PERP", "BONK-PERP", "JUP-PERP", "WIF-PERP"];

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState("");
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);

  if (profile && !initialized) {
    setDisplayName(profile.display_name || "");
    setSelectedSymbols(profile.preferred_symbols || []);
    setInitialized(true);
  }

  const handleSave = async () => {
    if (!profile) return;
    try {
      await updateProfile.mutateAsync({
        id: profile.id,
        display_name: displayName,
        preferred_symbols: selectedSymbols,
      });
      toast({ title: "Profile updated" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const toggleSymbol = (s: string) => {
    setSelectedSymbols(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-overline mb-2">Settings</p>
        <h1 className="text-massive">Profile</h1>
      </motion.div>

      <div className="border-b border-border/30" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="kinetic-card rounded-lg p-6 space-y-6"
      >
        <div>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
              <span className="text-lg font-editorial text-foreground">
                {(displayName || "T").charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{displayName || "Trader"}</p>
              <p className="text-xs text-muted-foreground font-mono">{user?.email}</p>
            </div>
          </div>
        </div>

        <div>
          <label className="text-overline block mb-2">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full bg-transparent border-b border-border/50 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors font-mono"
          />
        </div>

        <div>
          <label className="text-overline block mb-3">Preferred Symbols</label>
          <div className="flex flex-wrap gap-2">
            {ALL_SYMBOLS.map(s => (
              <button
                key={s}
                onClick={() => toggleSymbol(s)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
                  selectedSymbols.includes(s)
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "bg-muted/30 text-muted-foreground border border-border/40 hover:text-foreground hover:border-border"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <motion.button
          onClick={handleSave}
          disabled={updateProfile.isPending}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 text-foreground text-sm font-medium group disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {updateProfile.isPending ? "Saving..." : "Save Changes"}
          <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">→</span>
        </motion.button>
      </motion.div>
    </div>
  );
}
