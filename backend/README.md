## ONCHAINID Claim Issuer Kit — Backend

Contrats Solidity (`contracts/`) implémentant un `ClaimIssuer` ONCHAINID (ERC-734/ERC-735), portés en solc 0.8.35 à partir de la référence `@onchain-id/solidity`. Voir `contracts/ClaimIssuer.sol` et `contracts/Identity.sol`.

Géré avec [Foundry](https://book.getfoundry.sh/).

## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

- **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
- **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
- **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
- **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

Via le script `script/DeployClaimIssuer.s.sol` :

```shell
$ PRIVATE_KEY=<your_private_key> forge script script/DeployClaimIssuer.s.sol:DeployClaimIssuer \
    --rpc-url <your_rpc_url> --broadcast
```

`MANAGEMENT_KEY` (optionnel) — adresse à utiliser comme clé de management initiale ; par défaut, l'adresse du déployeur (dérivée de `PRIVATE_KEY`).

### Verify

Pour publier le code source sur un explorateur après déploiement. Via [Sourcify](https://sourcify.dev/) (gratuit, sans clé API) :

```shell
$ forge verify-contract <deployed_address> contracts/ClaimIssuer.sol:ClaimIssuer \
    --verifier sourcify --chain <chain_name_or_id> --guess-constructor-args \
    --rpc-url <your_rpc_url> --watch
```

Ou sur Etherscan (nécessite `ETHERSCAN_API_KEY`) en ajoutant `--verifier etherscan` à la place.

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
