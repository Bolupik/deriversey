
ALTER TABLE public.profiles
ADD COLUMN watchlist text[] NOT NULL DEFAULT '{SOL,BTC,ETH}'::text[];
