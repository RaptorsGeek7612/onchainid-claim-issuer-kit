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

Pas encore de script de déploiement dans `script/`. Pour déployer manuellement `ClaimIssuer` :

```shell
$ forge create contracts/ClaimIssuer.sol:ClaimIssuer --rpc-url <your_rpc_url> --private-key <your_private_key> --constructor-args <initial_management_key>
```

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
