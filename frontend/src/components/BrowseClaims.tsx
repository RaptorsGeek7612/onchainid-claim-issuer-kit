"use client";

import { useState } from "react";
import { hexToString, isAddress, type Hex } from "viem";
import { useReadContract, useReadContracts } from "wagmi";
import { hardhat, mainnet, sepolia } from "wagmi/chains";
import { identityAbi } from "@/lib/identityAbi";
import { SearchIcon } from "@/components/icons";

const NETWORKS = [
  { id: sepolia.id, label: "Sepolia" },
  { id: mainnet.id, label: "Mainnet" },
  { id: hardhat.id, label: "Hardhat (local)" },
] as const;

function shortenHex(value: string, size = 6) {
  if (value.length <= size * 2 + 2) return value;
  return `${value.slice(0, size + 2)}…${value.slice(-size)}`;
}

function decodeData(data: Hex) {
  if (data === "0x") return "";
  try {
    const text = hexToString(data);
    if (/[\x00-\x08\x0e-\x1f]/.test(text)) return data;
    return text;
  } catch {
    return data;
  }
}

export function BrowseClaims() {
  const [identity, setIdentity] = useState("");
  const [topic, setTopic] = useState("1");
  const [networkId, setNetworkId] = useState<(typeof NETWORKS)[number]["id"]>(sepolia.id);
  const [formError, setFormError] = useState<string | null>(null);
  const [search, setSearch] = useState<{
    identity: Hex;
    topic: bigint;
    chainId: (typeof NETWORKS)[number]["id"];
  } | null>(null);

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!isAddress(identity)) {
      setFormError("Adresse d'identité invalide.");
      return;
    }
    try {
      setSearch({ identity, topic: BigInt(topic), chainId: networkId });
    } catch {
      setFormError("Le topic doit être un entier.");
    }
  }

  const idsQuery = useReadContract({
    address: search?.identity,
    chainId: search?.chainId,
    abi: identityAbi,
    functionName: "getClaimIdsByTopic",
    args: search ? [search.topic] : undefined,
    query: { enabled: Boolean(search) },
  });

  const claimIds = idsQuery.data ?? [];

  const claimsQuery = useReadContracts({
    contracts: claimIds.map((claimId) => ({
      address: search?.identity,
      chainId: search?.chainId,
      abi: identityAbi,
      functionName: "getClaim",
      args: [claimId],
    })),
    query: { enabled: claimIds.length > 0 },
  });

  return (
    <section className="panel">
      <div className="panel-head">
        <span className="panel-step">04</span>
        <span className="panel-icon panel-icon-teal">
          <SearchIcon />
        </span>
        <h2>Parcourir les claims d&apos;une identité</h2>
      </div>
      <p className="panel-hint">
        Consultation seule, aucun wallet requis. Renseigne l&apos;adresse d&apos;un contrat{" "}
        <code>Identity</code>, le réseau où il est déployé et un topic pour lister les claims
        qu&apos;il détient sur ce sujet.
      </p>
      <form onSubmit={handleSearch} className="form-grid">
        <label>
          Adresse de l&apos;identité
          <input value={identity} onChange={(e) => setIdentity(e.target.value)} placeholder="0x…" required />
        </label>
        <label>
          Réseau
          <select
            value={networkId}
            onChange={(e) => setNetworkId(Number(e.target.value) as (typeof NETWORKS)[number]["id"])}
          >
            {NETWORKS.map((network) => (
              <option key={network.id} value={network.id}>
                {network.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Topic
          <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="1" required />
        </label>
        <button type="submit" className="btn btn-outline">
          Rechercher
        </button>
      </form>
      {formError && <p className="error-text">{formError}</p>}
      {search && idsQuery.isLoading && <p className="panel-hint">Recherche en cours…</p>}
      {search && !idsQuery.isLoading && claimIds.length === 0 && (
        <p className="panel-hint">Aucune claim trouvée pour ce topic sur cette identité.</p>
      )}
      {claimsQuery.data && claimsQuery.data.length > 0 && (
        <ul className="claim-list">
          {claimsQuery.data.map((result, index) => {
            if (result.status !== "success") return null;
            // wagmi can't infer a precise per-call return tuple for a
            // dynamically-built `contracts` array, so `result.result` comes
            // back as `unknown` even though we know its shape from `identityAbi`.
            const [claimTopic, scheme, issuer, signature, data, uri] = result.result as readonly [
              bigint,
              bigint,
              Hex,
              Hex,
              Hex,
              string,
            ];
            return (
              <li key={claimIds[index]} className="claim-list-item">
                <div className="claim-list-row">
                  <span className="badge">Topic {claimTopic.toString()}</span>
                  <span className="badge">Scheme {scheme.toString()}</span>
                </div>
                <div className="claim-list-field">
                  <span>Émetteur</span>
                  <code>{issuer}</code>
                </div>
                <div className="claim-list-field">
                  <span>Données</span>
                  <code>{decodeData(data) || "(vide)"}</code>
                </div>
                {uri && (
                  <div className="claim-list-field">
                    <span>URI</span>
                    <code>{uri}</code>
                  </div>
                )}
                <div className="claim-list-field">
                  <span>Signature</span>
                  <code title={signature}>{shortenHex(signature)}</code>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
