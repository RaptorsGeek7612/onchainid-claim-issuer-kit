# Kit d'émetteur de claims ONCHAINID

Kit pour émettre, vérifier et révoquer des claims d'identité conformes au standard [ONCHAINID](https://onchainid.com/) (ERC-734/ERC-735).

- [`backend/`](backend) — contrats Solidity (Foundry), `ClaimIssuer` porté en solc 0.8.35.
- [`frontend/`](frontend) — interface Next.js + wagmi/viem/RainbowKit pour signer, vérifier, révoquer et parcourir des claims depuis un wallet connecté (la consultation ne nécessite pas de wallet).

Voir le README de chaque dossier pour les instructions de build/dev, et [`GUIDE.md`](GUIDE.md) pour un guide d'utilisation en 4 étapes (avec exemple concret).

## Déploiement de test

- **Contrat `ClaimIssuer`** sur Sepolia : [`0x53C91c18D5Ad6f5521dE8434094EF7ed482C304a`](https://sepolia.etherscan.io/address/0x53C91c18D5Ad6f5521dE8434094EF7ed482C304a) — code source vérifié sur [Sourcify](https://repo.sourcify.dev/contracts/full_match/11155111/0x53C91c18D5Ad6f5521dE8434094EF7ed482C304a/) (correspondance exacte)
- **Frontend** sur Vercel : https://onchainid-claim-issuer-kit.vercel.app (préconfiguré avec l'adresse ci-dessus)

Le frontend n'utilise que le `localStorage` du navigateur (état de connexion wallet). Aucun cookie tiers ni traqueur.

## CI

`.github/workflows/ci.yml` — build/lint/test du backend (Foundry) et du frontend (Next.js) sur chaque push/PR.

## Licence

[GPL-3.0](LICENSE), conforme aux en-têtes SPDX des contrats (portés depuis `@onchain-id/solidity`, également GPL-3.0).
