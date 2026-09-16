## ONCHAINID Claim Issuer Kit — Frontend

Next.js + wagmi/viem + RainbowKit + Tailwind CSS pour interagir avec le contrat `ClaimIssuer` (voir `../backend`).

### Configuration

Copie `.env.local.example` en `.env.local` :
- `NEXT_PUBLIC_CLAIM_ISSUER_ADDRESS` — adresse du contrat déployé (peut aussi être saisie directement dans l'interface).
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` — requis par RainbowKit pour WalletConnect, à créer sur [cloud.reown.com](https://cloud.reown.com). Sans lui, MetaMask/Coinbase/injected fonctionnent quand même, mais WalletConnect affichera une erreur 403.

### Développement

```shell
pnpm install
pnpm dev
```

### Fonctionnalités

- Connexion wallet via RainbowKit (MetaMask, Rainbow, Coinbase Wallet, WalletConnect, ou tout wallet injecté). Le connecteur "Base Account" (smart wallet) est volontairement exclu — voir la note dans `next.config.ts`.
- Émission d'une claim : le wallet connecté (clé de management ou de claim signer sur le `ClaimIssuer`) signe `keccak256(abi.encode(identity, topic, data))` selon le schéma ONCHAINID. La signature produite doit être transmise au titulaire de l'identité pour qu'il l'ajoute via `addClaim` sur son propre contrat `Identity`.
- Vérification de la validité d'une claim (`isClaimValid`) et de son statut de révocation (`isClaimRevoked`).
- Détection de réseau incorrect : si l'adresse saisie est valide mais qu'aucun bytecode n'est trouvé sur la chaîne du wallet connecté, un avertissement s'affiche.
- Révocation d'une claim (`revokeClaimBySignature`), réservée à la clé de management.
- Consultation des claims d'une identité (`getClaimIdsByTopic` + `getClaim` sur son contrat `Identity`) : lecture seule, aucun wallet requis, avec sélection explicite du réseau à interroger (`BrowseClaims.tsx`).
- Bandeau d'information sur le stockage local (`CookieNotice.tsx`) : le site n'utilise que le `localStorage` du navigateur (état de connexion wagmi/RainbowKit), aucun cookie tiers ni traqueur.

### Chaînes prises en charge

`hardhat` (local, 31337), `sepolia`, `mainnet` — voir `src/lib/wagmi.ts`.
