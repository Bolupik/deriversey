import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Wallet, LogOut } from "lucide-react";

export function WalletButton() {
  const { publicKey, disconnect, connected } = useWallet();
  const { setVisible } = useWalletModal();

  if (connected && publicKey) {
    const address = publicKey.toString();
    const short = address.slice(0, 4) + "..." + address.slice(-4);
    return (
      <div className="flex items-center gap-1.5">
        <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-medium bg-primary/10 text-primary border border-primary/20">
          <Wallet className="h-3 w-3" />
          {short}
        </span>
        <button
          onClick={() => disconnect()}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          title="Disconnect wallet"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setVisible(true)}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-colors"
    >
      <Wallet className="h-3.5 w-3.5" />
      Connect
    </button>
  );
}
