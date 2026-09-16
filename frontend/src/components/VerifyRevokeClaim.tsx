"use client";

import { useEffect, useState } from "react";
import { isAddress, isHex, type Hex } from "viem";
import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { claimIssuerAbi } from "@/lib/claimIssuerAbi";
import { textToClaimData } from "@/lib/claim";
import { ShieldCheckIcon } from "@/components/icons";

export function VerifyRevokeClaim({ claimIssuerAddress }: { claimIssuerAddress?: Hex }) {
  const [identity, setIdentity] = useState("");
  const [topic, setTopic] = useState("1");
  const [dataText, setDataText] = useState("");
  const [signature, setSignature] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [args, setArgs] = useState<readonly [Hex, bigint, Hex, Hex] | null>(null);

  const { writeContract: revoke, data: revokeTxHash, isPending: isRevoking, error: revokeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: revokeTxHash });

  const isValidQuery = useReadContract({
    address: claimIssuerAddress,
    abi: claimIssuerAbi,
    functionName: "isClaimValid",
    args: args ?? undefined,
    query: { enabled: Boolean(claimIssuerAddress && args) },
  });

  const isRevokedQuery = useReadContract({
    address: claimIssuerAddress,
    abi: claimIssuerAbi,
    functionName: "isClaimRevoked",
    args: signature && isHex(signature) ? [signature] : undefined,
    query: { enabled: Boolean(claimIssuerAddress && signature && isHex(signature)) },
  });

  useEffect(() => {
    if (!isConfirmed) return;
    isValidQuery.refetch();
    isRevokedQuery.refetch();
    // isValidQuery/isRevokedQuery are new objects every render (wagmi's
    // useReadContract doesn't return a stable reference), so including
    // them would refetch on every render instead of only after
    // confirmation. Their .refetch identity is stable enough for this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirmed]);

  function prepareArgs(): readonly [Hex, bigint, Hex, Hex] | null {
    setFormError(null);
    if (!isAddress(identity)) {
      setFormError("Adresse d'identité invalide.");
      return null;
    }
    if (!isHex(signature) || signature.length !== 132) {
      setFormError("Signature invalide (65 octets attendus, préfixés par 0x).");
      return null;
    }
    let topicBig: bigint;
    try {
      topicBig = BigInt(topic);
    } catch {
      setFormError("Le topic doit être un entier.");
      return null;
    }
    return [identity, topicBig, signature, textToClaimData(dataText)] as const;
  }

  function handleCheck(event: React.FormEvent) {
    event.preventDefault();
    const nextArgs = prepareArgs();
    if (nextArgs) setArgs(nextArgs);
  }

  function handleRevoke() {
    if (!claimIssuerAddress || !isHex(signature)) {
      setFormError("Renseigne une signature valide avant de révoquer.");
      return;
    }
    revoke({
      address: claimIssuerAddress,
      abi: claimIssuerAbi,
      functionName: "revokeClaimBySignature",
      args: [signature],
    });
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <span className="panel-step">03</span>
        <span className="panel-icon panel-icon-pink">
          <ShieldCheckIcon />
        </span>
        <h2>Vérifier / révoquer une claim</h2>
      </div>
      <p className="panel-hint">La révocation nécessite un wallet connecté détenant la clé de management du ClaimIssuer.</p>
      <form onSubmit={handleCheck} className="form-grid">
        <label>
          Adresse de l&apos;identité (sujet)
          <input value={identity} onChange={(e) => setIdentity(e.target.value)} placeholder="0x…" required />
        </label>
        <label>
          Topic
          <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="1" required />
        </label>
        <label>
          Données de la claim (texte)
          <textarea value={dataText} onChange={(e) => setDataText(e.target.value)} rows={2} />
        </label>
        <label>
          Signature
          <input value={signature} onChange={(e) => setSignature(e.target.value)} placeholder="0x…" required />
        </label>
        <div className="button-row">
          <button type="submit" className="btn btn-primary" disabled={!claimIssuerAddress}>
            Vérifier
          </button>
          <button
            type="button"
            className="btn btn-danger-outline"
            onClick={handleRevoke}
            disabled={!claimIssuerAddress || isRevoking || isConfirming}
          >
            {isRevoking ? "Confirmation dans le wallet…" : isConfirming ? "Révocation en cours…" : "Révoquer"}
          </button>
        </div>
      </form>
      {formError && <p className="error-text">{formError}</p>}
      {revokeError && <p className="error-text">{revokeError.message}</p>}
      {!claimIssuerAddress && <p className="panel-hint">Renseigne l&apos;adresse du contrat ClaimIssuer ci-dessus.</p>}
      {(args || (signature && isHex(signature))) && (
        <ul className="status-list">
          {args && (
            <li className={`badge ${isValidQuery.data === true ? "badge-success" : isValidQuery.data === false ? "badge-danger" : ""}`}>
              Claim valide : {isValidQuery.isLoading ? "…" : isValidQuery.data === true ? "oui" : "non"}
            </li>
          )}
          {signature && isHex(signature) && (
            <li
              className={`badge ${isRevokedQuery.data === true ? "badge-danger" : isRevokedQuery.data === false ? "badge-success" : ""}`}
            >
              Claim révoquée : {isRevokedQuery.isLoading ? "…" : isRevokedQuery.data === true ? "oui" : "non"}
            </li>
          )}
        </ul>
      )}
      {isConfirmed && <p className="success-text">Claim révoquée avec succès.</p>}
    </section>
  );
}
