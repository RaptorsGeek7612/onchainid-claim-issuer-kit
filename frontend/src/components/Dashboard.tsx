"use client";

import { useState } from "react";
import { isAddress, type Hex } from "viem";
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
            Émission de claims d&apos;identité <span className="text-gradient">on-chain</span> pour institutions
            mondiales
          </h1>
          <p>
            Signez, vérifiez et révoquez des attestations d&apos;identité conformes au standard ONCHAINID, directement
            depuis un wallet connecté — sans intermédiaire, sans backend de confiance.
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
            <StatusPill active={Boolean(validAddress)} label={validAddress ? "Contrat détecté" : "En attente"} />
          </div>
          <p className="panel-hint">
            Renseigne l&apos;adresse du contrat déployé sur le réseau de ton wallet connecté — elle alimente les
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
