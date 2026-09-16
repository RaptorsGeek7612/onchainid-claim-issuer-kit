## ONCHAINID Claim Issuer Kit — Frontend

Next.js + wagmi/viem pour interagir avec le contrat `ClaimIssuer` (voir `../backend`).

### Configuration

Copie `.env.local.example` en `.env.local` et renseigne `NEXT_PUBLIC_CLAIM_ISSUER_ADDRESS` avec l'adresse du contrat déployé (peut aussi être saisie directement dans l'interface).

### Développement

```shell
pnpm install
pnpm dev
```

### Fonctionnalités

- Connexion wallet (MetaMask / injected)
- Émission d'une claim : le wallet connecté (clé de management ou de claim signer sur le `ClaimIssuer`) signe `keccak256(abi.encode(identity, topic, data))` selon le schéma ONCHAINID. La signature produite doit être transmise au titulaire de l'identité pour qu'il l'ajoute via `addClaim` sur son propre contrat `Identity`.
- Vérification de la validité d'une claim (`isClaimValid`) et de son statut de révocation (`isClaimRevoked`).
- Révocation d'une claim (`revokeClaimBySignature`), réservée à la clé de management.

### Chaînes supportées

`hardhat` (local, 31337), `sepolia`, `mainnet` — voir `src/lib/wagmi.ts`.
