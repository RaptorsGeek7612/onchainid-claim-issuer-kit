import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      // @wagmi/connectors' "Base Account" (smart wallet) connector pulls in
      // @base-org/account -> @coinbase/cdp-sdk, which statically imports a
      // chain of @x402/* Solana/EVM payment packages this EVM-only app never
      // installs or needs. We don't offer that wallet in the UI (see
      // ConnectWallet.tsx), so stub the whole subtree out of the bundle.
      "@base-org/account": "./src/stubs/empty.ts",
    },
  },
};

export default nextConfig;
