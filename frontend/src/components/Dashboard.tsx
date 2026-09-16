"use client";

import { useState } from "react";
import { isAddress, type Hex } from "viem";
import { useAccount, useBytecode } from "wagmi";
import { BrandMark } from "@/components/BrandMark";
import { ConnectWallet } from "@/components/ConnectWallet";
import { DocumentIcon } from "@/components/icons";
import { IssueClaimForm } from "@/components/IssueClaimForm";
import { NetworkGraphic } from "@/components/NetworkGraphic";
import { StatusPill } from "@/components/StatusPill";
import { VerifyRevokeClaim } from "@/components/VerifyRevokeClaim";

export function Dashboard() {
  const [claimIssuerAddress, setClaimIssuerAddress] = useState(
    process.env.NEXT_PUBLIC_CLAIM_ISSUER_ADDRESS ?? "",
  );

  const validAddress = isAddress(claimIssuerAddress) ? (claimIssuerAddress as Hex) : undefined;
  const { isConnected, chain } = useAccount();

  const bytecodeQuery = useBytecode({
    address: validAddress,
    query: { enabled: Boolean(validAddress && isConnected) },
  });
  const hasNoCodeOnCurrentChain =
    Boolean(validAddress) && isConnected && !bytecodeQuery.isLoading && !bytecodeQuery.data;

  const statusLabel = !validAddress
    ? "En attente"
    : !isConnected
      ? "Adresse valide"
      : bytecodeQuery.isLoading
        ? "Vérification…"
        : hasNoCodeOnCurrentChain
          ? "Introuvable sur ce réseau"
          : "Contrat détecté";

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <BrandMark />
          <div className="brand-text">
            <span className="brand-title">Claim Issuer Kit</span>
            <span className="brand-subtitle">ONCHAINID · Identité numérique institutionnelle</span>
          </div>
        </div>
        <ConnectWallet />
      </header>

      <section className="hero">
        <span className="hero-blob hero-blob-1" aria-hidden="true" />
        <span className="hero-blob hero-blob-2" aria-hidden="true" />
        <span className="hero-blob hero-blob-3" aria-hidden="true" />
        <NetworkGraphic />
        <div className="hero-inner">
          <span className="hero-eyebrow">
            <span className="hero-eyebrow-dot" />
            Standard ERC-734 / ERC-735
          </span>
          <h1>
            Émettre, vérifier, révoquer : l&apos;identité <span className="text-gradient">on-chain</span> à
            l&apos;échelle des institutions mondiales
          </h1>
          <p>
            Un registre de claims d&apos;identité conforme au standard ONCHAINID, gouverné par vos propres clés, sans
            intermédiaire ni backend de confiance.
          </p>
          <div className="hero-tags">
            <span className="hero-tag">Non custodial</span>
            <span className="hero-tag">Signatures EIP-191</span>
            <span className="hero-tag">Révocation on-chain</span>
          </div>
        </div>
      </section>

      <main className="content">
        <section className="panel">
          <div className="panel-head">
            <span className="panel-step">01</span>
            <span className="panel-icon panel-icon-blue">
              <DocumentIcon />
            </span>
            <h2>Contrat ClaimIssuer</h2>
            <StatusPill active={Boolean(validAddress) && !hasNoCodeOnCurrentChain} label={statusLabel} />
          </div>
          <p className="panel-hint">
            Renseigne l&apos;adresse du contrat déployé sur le réseau de ton wallet connecté. Elle alimente les
            vérifications et signatures ci-dessous.
          </p>
          <div className="form-grid">
            <label>
              Adresse déployée
              <input
                value={claimIssuerAddress}
                onChange={(e) => setClaimIssuerAddress(e.target.value)}
                placeholder="0x…"
              />
            </label>
          </div>
          {claimIssuerAddress && !validAddress && <p className="error-text">Adresse invalide.</p>}
          {hasNoCodeOnCurrentChain && (
            <p className="error-text">
              Aucun contrat trouvé à cette adresse sur {chain?.name ?? "le réseau connecté"}. Vérifie que ton wallet
              est bien sur le réseau où le ClaimIssuer a été déployé.
            </p>
          )}
        </section>

        <IssueClaimForm />
        <VerifyRevokeClaim claimIssuerAddress={validAddress} />
      </main>

      <footer className="footer">
        <span className="footer-brand">
          <BrandMark size={20} />
          Claim Issuer Kit
        </span>
        <span>Kit d&apos;émetteur de claims ONCHAINID · Conforme ERC-734/ERC-735</span>
      </footer>
    </div>
  );
}
