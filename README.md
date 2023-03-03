# Blur Collection Bidding Bot
Bidding on top collections currently is gaining between 5-50 $BLUR/day per ETH in Blur Pool Balance.

Season 2 rewards being 300 Million $Blur, get started with you bidding bot today.

![image](https://user-images.githubusercontent.com/125624349/222613546-65801fdb-676f-4b1b-b7cc-629e34d9268f.png)

## Setup & run
- Create `.env` file based on the `.sample.env` and adjust all the variables on your preferences
- Fetch dependencies: `yarn install` (or `npm install`)
- Build the tool: `yarn build` (or `npm run build`)
- Start bidding: `yarn start` (or `npm run start`)
- Run action: `yarn start action-name` (or `npm run start action-name`)

## Available actions

## run
The default action which will start the bidding

- Run with: `yarn start` (or `npm run start`)
- Run with explicitly setting the action: `yarn start run` (or `npm run start run`)

## cancel
Cancels all bids on blur

- Run with: `yarn start cancel` (or `npm run start cancel`)

### collections
Generates a CSV file of top 300 collections based on 1 day volume. The generated CSV will be located in the `TMP_DIR`.

- Run with: `yarn start collections` (or `npm run start collections`)

### collection:configs
Generates a collections config file, where you can override settings per collection. I'd advise to remove all unnecessary lines from the generated file.

- Run with: `yarn start collection:generate` (or `npm run start collection:generate`)

## How the bidding works
- If `BID_TO_POOL_1` is set to `1` bids will send to pool 1 as well, if set to `0`, pool 1 will be always skipped
- Bid will send only to pools >= `1` and <= `MAX_POOL_TO_BID`
- Bid will send if one of 2 conditions is met:
  - Sum of all executable pool sizes above the target pool needs to be >= `POOL_SIZE_LIMIT_BID`
  - `BID_TO_SAME_POOL` is set to `1` and sum of all executable pool sizes above the target pool + the target pool size is >= `SAME_POOL_SIZE_LIMIT_BID`
- The size of teh bid is determined by two options: `USE_MAX_QUANTITY` and `MAX_QUANTITY`
  - If `USE_MAX_QUANTITY` is set to `0`, bid size will always be `1`
  - If `USE_MAX_QUANTITY` is set to `1`, bid size will calculate based on the wallet balance to max it out. If `MAX_QUANTITY` is not set to `0`, the size will be capped by the setting.
- Bids are only cancelled when the pools are disappearing, when getting under `POOL_SIZE_LIMIT_CANCEL` or `SAME_POOL_SIZE_LIMIT_CANCEL` (followin the same rules as when creating bids)
- Bids will auto expire after 30 minutes


### Raise a ticket https://discord.gg/Yezs2VDhBV
