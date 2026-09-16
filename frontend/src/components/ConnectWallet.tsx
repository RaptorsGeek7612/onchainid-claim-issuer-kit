"use client";

import { useConnect, useConnection, useConnectors, useDisconnect } from "wagmi";

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function ConnectWallet() {
  const { address, isConnected, chain } = useConnection();
  const connectors = useConnectors();
  const { mutate: connect, isPending, error } = useConnect();
  const { mutate: disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <div className="wallet-panel">
        <div className="wallet-chip">
          <span className="wallet-dot" />
          <span className="wallet-address" title={address}>
            {shortenAddress(address)}
          </span>
          <span className="wallet-chain">{chain?.name ?? "Réseau inconnu"}</span>
        </div>
        <button type="button" className="btn btn-outline" onClick={() => disconnect()}>
          Déconnecter
        </button>
      </div>
    );
  }

  return (
    <div className="wallet-panel">
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          type="button"
          className="btn btn-gradient"
          disabled={isPending}
          onClick={() => connect({ connector })}
        >
          Se connecter avec {connector.name}
        </button>
      ))}
      {error && <p className="error-text">{error.message}</p>}
    </div>
  );
}
