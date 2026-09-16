"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function ConnectWallet() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            className="wallet-panel"
            aria-hidden={!ready}
            style={!ready ? { opacity: 0, pointerEvents: "none" } : undefined}
          >
            {!connected ? (
              <button type="button" className="btn btn-gradient" onClick={openConnectModal}>
                Se connecter
              </button>
            ) : chain.unsupported ? (
              <button type="button" className="btn btn-danger-outline" onClick={openChainModal}>
                Réseau non pris en charge
              </button>
            ) : (
              <>
                <button type="button" className="wallet-chip" onClick={openAccountModal}>
                  <span className="wallet-dot" />
                  <span className="wallet-address">{account.displayName}</span>
                </button>
                <button type="button" className="btn btn-outline" onClick={openChainModal}>
                  {chain.name}
                </button>
              </>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
