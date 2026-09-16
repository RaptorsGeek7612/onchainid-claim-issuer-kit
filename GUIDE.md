# Guide d'utilisation

Ce guide explique comment utiliser le [Kit d'émetteur de claims ONCHAINID](README.md) en trois étapes, avec un exemple concret. Le même contenu est disponible dans l'onglet **Guide** de l'application.

## 1. Configurer le contrat ClaimIssuer

Renseigne l'adresse du contrat `ClaimIssuer` déjà déployé, sur le **même réseau** que ton wallet connecté. L'application vérifie automatiquement qu'un contrat existe bien à cette adresse ; si le badge affiche *« Introuvable sur ce réseau »*, ton wallet n'est probablement pas sur le bon réseau.

## 2. Émettre une claim

Connecte un wallet qui détient la clé de management ou de claim signer du `ClaimIssuer`, puis remplis le formulaire. Exemple concret :

| Champ | Valeur |
|---|---|
| Adresse de l'identité (sujet) | l'adresse concernée par la claim, ex. `0x6B3D16C808E8084bBC679292b3914385ef032Ceb` |
| Topic | identifiant numérique du type de claim, ex. `1` (convention courante pour « KYC » dans l'écosystème ONCHAINID) |
| Scheme | `1` (signature ECDSA, le seul type que ce contrat sait vérifier) |
| Données de la claim | texte libre, ex. `KYC vérifié` |
| URI | optionnel, un lien vers une preuve hors-chaîne |

Clique **« Signer la claim »** : ton wallet te demande une signature (gratuite, pas de transaction on-chain). L'application affiche ensuite un JSON contenant la signature et les valeurs saisies. Conserve-le, il te sert à l'étape suivante.

## 3. Vérifier / révoquer

Remets **exactement** les mêmes valeurs qu'à l'étape 2, puis clique **« Vérifier »**.

> **Piège le plus fréquent :** le champ « Données de la claim » attend le **texte brut original** (ex. `KYC vérifié`). Jamais le JSON entier produit à l'étape 2, ni son champ `data` (déjà encodé en hexadécimal). Un seul caractère différent, y compris la casse, et la vérification échoue.

| Champ (étape 3) | Valeur à utiliser |
|---|---|
| Adresse de l'identité | le champ `identity` du JSON |
| Topic | le champ `topic` du JSON |
| Données de la claim | le texte brut original (pas le JSON, pas le champ hex) |
| Signature | le champ `signature` du JSON |

Pour **révoquer**, connecte le wallet qui détient la clé de management, colle la Signature, et clique **« Révoquer »**. Cette fois, c'est une vraie transaction on-chain (gas requis).
