# Audit interne

> **Ceci n'est pas un audit de sécurité externe.** C'est une revue interne du code, faite avant tout audit professionnel. Elle ne remplace pas une revue par un auditeur tiers spécialisé (Trail of Bits, OpenZeppelin, Consensys Diligence, etc.), notamment pour la mise en production avec des fonds réels.

## Périmètre

- `backend/contracts/ClaimIssuer.sol`, `Identity.sol`, `interfaces/*.sol`
- `frontend/` : lecture/écriture de claims via wagmi (signature, vérification, révocation, consultation)

## Méthodologie

- Revue manuelle ligne par ligne des deux contrats et de leurs interfaces
- 24 tests Foundry (gestion des clés, claims, execute/approve, révocation, contrôle d'accès)
- 6 tests Vitest côté frontend (hachage/encodage de claims), avec un vecteur de test croisé (Foundry `cast` vs viem) pour vérifier que le hash de claim est calculé identiquement des deux côtés
- CI (`forge fmt`/`build`/`test` ; `eslint`/`vitest`/`next build`) sur chaque push
- Déploiement réel testé sur Sepolia, pas seulement en local (anvil)

## Constats

### Contrats

1. **Pattern de reentrancy dans `execute` / `approve`** (`Identity.sol`). Le flag `_executions[_id].executed` n'est mis à `true` qu'*après* l'appel externe (`.call`). Un contrat cible malveillant, appelé via une exécution approuvée par une clé MANAGEMENT ou ACTION, pourrait réentrer avant que ce flag soit positionné. C'est le pattern de la référence ERC-734/ONCHAINID (pas introduit par ce fork), mais à vérifier explicitement par un audit externe si ce kit est utilisé pour distribuer des clés ACTION à des signataires moins fiables.
2. **Portée de la révocation** (`ClaimIssuer.sol`). `revokedClaims` est indexé uniquement par la signature (`mapping(bytes => bool)`), pas par `(issuer, identity, topic)`. Une collision entre deux signatures différentes est cryptographiquement négligeable, mais le design mérite d'être confirmé par un audit externe avant usage en production.
3. **`revokeClaim(claimId, identity)` ne vérifie pas que `issuer == address(this)`** avant de révoquer la signature. Un détenteur de la clé de management peut donc marquer comme révoquée une signature qu'un *autre* émetteur a produite (impact limité : ça ne pollue que le registre `revokedClaims` de ce `ClaimIssuer`, pas celui de l'émetteur d'origine). Recommandation : ajouter `require(issuer == address(this))`.
4. **`ecrecover` non normalisé** (`getRecoveredAddress`). Pas de rejet des signatures non-canoniques (high-s) ni de vérification stricte de `v`, contrairement à `ECDSA.recover` d'OpenZeppelin. Sans impact direct ici (la validité d'une claim dépend de l'appartenance de la clé récupérée, pas d'un nonce), mais c'est une bonne pratique cryptographique à corriger.
5. **Un seul claim par `(issuer, topic)`** (`addClaim`, `claimId = keccak256(abi.encode(issuer, topic))`). Un second `addClaim` du même émetteur sur le même topic écrase le premier (émet `ClaimChanged` au lieu de `ClaimAdded`). Comportement hérité de la référence ONCHAINID, à documenter pour les intégrateurs qui s'attendraient à plusieurs claims simultanées par couple émetteur/topic.
6. **Aucune pausabilité ni circuit breaker.** Une clé de management compromise peut ajouter/retirer des clés et révoquer des claims sans délai ni multi-signature imposés par le contrat lui-même. La gouvernance (multisig, timelock) est supposée être portée en externe par l'adresse qui détient la clé de management (ex. un Safe), pas par le contrat.

### Frontend

7. **`NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` partagé** avec un autre projet ("ghost"/AETHYX) sous la même équipe Reown. Accepté sciemment (création d'un projet dédié désormais payante). Impact : allowlist et branding WalletConnect partagés entre les deux apps, aucun impact fonctionnel ou de sécurité sur ce kit.
8. **Lectures on-chain sans wallet connecté** (`BrowseClaims.tsx`) épinglent explicitement `chainId` sur chaque appel `useReadContract`/`useReadContracts`. Un bug réel a été trouvé et corrigé pendant ce projet : sans cette correction, wagmi retombait silencieusement sur la première chaîne configurée (`hardhat`/`localhost:8545`) au lieu du réseau choisi quand aucun wallet n'était connecté.
9. **Pas de RPC dédié.** Les lectures utilisent les endpoints publics par défaut de `wagmi`/`viem` (`http()`), suffisant pour un kit/démo mais à remplacer par un RPC dédié (Alchemy, Infura, etc.) en cas de trafic de production.

## Couverture des tests

- Backend : 24 tests Foundry (16 dans `Identity.t.sol`, 8 dans `ClaimIssuer.t.sol`), couvrant gestion des clés, claims, execute/approve, révocation, contrôle d'accès.
- Frontend : 6 tests Vitest sur le hachage/encodage de claims, avec un vecteur croisé Foundry `cast` / viem.
- Pas de tests fuzz/invariant Foundry, pas de suite d'intégration end-to-end automatisée au-delà des scripts Playwright ponctuels utilisés pendant le développement (screenshots + vérification console, non versionnés dans le repo).

## Priorités pour un audit externe

1. Impact réel du pattern de reentrancy (constat 1) selon le modèle de confiance retenu pour les clés ACTION.
2. Portée de la révocation et absence de vérification `issuer == address(this)` (constats 2-3).
3. Fuzzing/invariants sur la gestion des clés et sur `revokeClaim`.
4. Revue du script de déploiement (`backend/script/DeployClaimIssuer.s.sol`) et de la gestion des clés privées en CI/CD.
5. Normalisation `ecrecover` (constat 4).

## Hors périmètre de cette revue

- Audit professionnel externe (volontairement exclu à ce stade, à la demande du porteur du projet)
- Preuve formelle / vérification mathématique
- Audit de la chaîne d'approvisionnement des dépendances (npm, Foundry)
- Tests de charge réseau

---

*Revue effectuée le 2026-09-16, par relecture manuelle assistée. À mettre à jour si les contrats ou le frontend évoluent.*
