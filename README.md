# Compound API

A simple CLI to interact with compound

## Get token balances

```
curl https://localhost:{PORT}/cTokenBalance/{TOKEN_ADDRESS}/{WALLET_ADDRESS}
```

## Mint cDai

```
curl https://localhost:{PORT}/mint/{TOKEN_TO_MINT}/{AMOUNT_TO_MINT}
```

## Redeem dai
```
curl https://localhost:{PORT}/redeem/{TOKEN_TO_REDEEM}/{AMOUNT_TO_REDEEM}
```