import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { hardhat, mainnet, sepolia } from "wagmi/chains";

const appName = "ONCHAINID Claim Issuer Kit";
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "00000000000000000000000000000000";

// Curated wallet list: deliberately excludes RainbowKit's "Base Account"
// (smart wallet) connector, whose dependency chain (@base-org/account ->
// @coinbase/cdp-sdk -> @x402/*) is stubbed out in next.config.ts because it
// pulls in Solana/x402 payment modules this EVM-only app never uses.
const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommandé",
      wallets: [metaMaskWallet, rainbowWallet, coinbaseWallet, walletConnectWallet, injectedWallet],
    },
  ],
  { appName, projectId },
);

export const config = createConfig({
  chains: [hardhat, sepolia, mainnet],
  connectors,
  ssr: true,
  transports: {
    [hardhat.id]: http(),
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
