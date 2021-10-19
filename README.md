# Decentralized Raffle

# Quickstart
 ## Requirements

- [nodejs](https://nodejs.org/en/)
- [NPM](https://www.npmjs.com/) or [YARN](https://yarnpkg.com/)

## Installation

```sh
git clone 
cd decentralized-raffle
yarn
```
### Deploy contracts

```sh
npx hardhat deploy
```

### Deploy and start a local node

```sh
npx hardhat node
```

### Deploy to Kovan

To deploy to a testnet or a live network, you need the following environment variables:

1. KOVAN_RPC_URL=https://eth-ropsten.alchemyapi.io/v2/<YOUR ALCHEMY KEY>
2. PRIVATE_KEY=0xabc123abc123abc123abc123abc123abc123abc123abc123abc123abc123abc1

Your `KOVAN_RPC_URL` is the URL of your blockchain node, for example, from [alchemy](https://www.alchemy.com/).

Your `PRIVATE_KEY` is the private key of your metamask or cryptowallet. Make sure it starts with `0x`. You might have to add `0x` if you're pulling the key from something like metamask. 

You can set them in a file named `.env`. You can follow the example of `.env.example` of what the contents of that file will look like. 

You'll also need testnet ETH and testnet LINK. You can [find both here.](https://faucets.chain.link/)

Once you do so, you can run:

```
npx hardhat deploy --network kovan
```
Fund your contract with LINK.
```
npx hardhat fund-link --contract insert-contract-address-here --network kovan
```
And enter your raffle
``` 
npx hardhat run scripts/enter.ts --network kovan
```


### Add keepers

Once you deploy to Kovan, you can register your contract with the kovan keepers registry. Please [follow the documentation](https://docs.chain.link/docs/chainlink-keepers/compatible-contracts/) for more information. 

```sh
npx hardhat deploy --network kovan
```

And you can verify once you have an [`ETHERSCAN_API_KEY`](https://etherscan.io/apis)

```sh
npx hardhat verify --network mainnet DEPLOYED_CONTRACT_ADDRESS args...
```

## Tests

```sh
npx hardhat test
```

