"use client";

import { useState } from "react";
import { isAddress, type Hex } from "viem";
import { useAccount, useSignMessage } from "wagmi";
import { claimDataHash, textToClaimData } from "@/lib/claim";
import { SignatureIcon } from "@/components/icons";

type ClaimPackage = {
  identity: string;
  topic: string;
  scheme: string;
  issuer: string;
  signature: Hex;
  data: Hex;
  uri: string;
};

export function IssueClaimForm() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync, isPending } = useSignMessage();

  const [identity, setIdentity] = useState("");
  const [topic, setTopic] = useState("1");
  const [scheme, setScheme] = useState("1");
  const [dataText, setDataText] = useState("");
  const [uri, setUri] = useState("");
  const [result, setResult] = useState<ClaimPackage | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    setResult(null);

    if (!address) {
      setFormError("Connecte un wallet possédant la clé de management ou de signature du claim issuer.");
      return;
    }
    if (!isAddress(identity)) {
      setFormError("Adresse d'identité invalide.");
      return;
    }

    let topicBig: bigint;
    try {
      topicBig = BigInt(topic);
    } catch {
      setFormError("Le topic doit être un entier.");
      return;
    }

    const dataHex = textToClaimData(dataText);
    const hash = claimDataHash(identity, topicBig, dataHex);

    try {
      const signature = await signMessageAsync({ message: { raw: hash } });
      setResult({
        identity,
        topic,
        scheme,
        issuer: address,
        signature,
        data: dataHex,
        uri,
      });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "La signature a échoué.");
    }
  }

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <span className="panel-step">02</span>
        <span className="panel-icon panel-icon-violet">
          <SignatureIcon />
        </span>
        <h2>Émettre une claim</h2>
      </div>
      <p className="panel-hint">
        Le wallet connecté doit détenir une clé de management ou de claim signer sur le contrat ClaimIssuer. La
        signature produite doit être transmise au titulaire de l&apos;identité pour qu&apos;il l&apos;ajoute via
        <code> addClaim</code> sur son propre contrat Identity.
      </p>
      <form onSubmit={handleSubmit} className="form-grid">
        <label>
          Adresse de l&apos;identité (sujet)
          <input value={identity} onChange={(e) => setIdentity(e.target.value)} placeholder="0x…" required />
        </label>
        <label>
          Topic
          <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="1" required />
        </label>
        <label>
          Scheme
          <input value={scheme} onChange={(e) => setScheme(e.target.value)} placeholder="1" required />
        </label>
        <label>
          Données de la claim (texte)
          <textarea value={dataText} onChange={(e) => setDataText(e.target.value)} rows={3} />
        </label>
        <label>
          URI (optionnel)
          <input value={uri} onChange={(e) => setUri(e.target.value)} placeholder="https://…" />
        </label>
        <button type="submit" className="btn btn-gradient" disabled={!isConnected || isPending}>
          {isPending ? "Signature en cours…" : "Signer la claim"}
        </button>
      </form>
      {formError && <p className="error-text">{formError}</p>}
      {result && (
        <div className="result-box">
          <div className="result-header">
            <span>Claim signée</span>
            <button type="button" className="btn btn-outline" onClick={handleCopy}>
              {copied ? "Copié !" : "Copier le JSON"}
            </button>
          </div>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </section>
  );
}
