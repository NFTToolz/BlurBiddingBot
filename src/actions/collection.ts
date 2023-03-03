import { utils } from 'ethers';

import { getCollectionBids } from '../blur/bids';
import { cancelCollectionBid, createCollectionBid } from '../os/collectionBid';
import { LoggedInWallet } from '../os/login';
import { saveMyBids } from '../storage/myBids';
import { Store } from '../store';
import { UpdatedBids } from '../store/collectionsSlice';
import { logDebug, logEmergency, logError, logInfo } from '../utils/log';
import { blurContract } from '../utils/provider';
import { getQuantity } from '../utils/quantity';

export const setupCollection = async (store: Store, contractAddress: string): Promise<void> => {
  const bids = await getCollectionBids(store, contractAddress, store.wallets[0], 5);
  store.collections[contractAddress].bids = bids.map((bid) => ({
    price: bid.price,
    executableSize: bid.executableSize,
  }));

  const promises: Promise<unknown>[] = [];

  for (const wallet of store.wallets) {
    promises.push(syncMyBids(store, contractAddress, wallet));
  }

  await Promise.all(promises);
};

const sendCollectionBid = async (
  store: Store,
  contractAddress: string,
  price: number,
  quantities: number[],
  wallet: LoggedInWallet,
  retry = false,
): Promise<void> => {
  const collection = store.collections[contractAddress];
  if (!store.collections[contractAddress].myBids[wallet.address]) {
    store.collections[contractAddress].myBids[wallet.address] = { bids: {} };
  }

  try {
    store.collections[contractAddress].myBids[wallet.address].bids[String(price)] =
      await createCollectionBid(collection, price, quantities, wallet);
  } catch (err) {
    logError(
      `Wallet: ${wallet.address} Contract: ${collection.slug}: Failed to create bid for ${price}`,
    );

    if (err instanceof Error) {
      logError(err.message);

      if (!retry && err.message === 'Limit exceeded') {
        const currentBalance = await blurContract.balanceOf(wallet.address);
        wallet.balance = Number(utils.formatEther(currentBalance));

        await cancelCollectionBid(collection, [price], wallet).catch(() => {
          logEmergency(`Failed to cancel bid ${price} for contract ${collection.slug}.`);
        });

        delete store.collections[contractAddress].myBids[wallet.address].bids[price];

        const quantities = getQuantity(
          wallet.balance,
          price,
          collection.config.useMaxQuantity,
          collection.config.maxQuantity,
        );

        return sendCollectionBid(store, contractAddress, price, quantities, wallet, true);
      }
    }
  }
};

const syncMyBids = async (
  store: Store,
  contractAddress: string,
  wallet: LoggedInWallet,
): Promise<void> => {
  const collection = store.collections[contractAddress];
  if (!store.collections[contractAddress].myBids[wallet.address]) {
    store.collections[contractAddress].myBids[wallet.address] = { bids: {} };
  }

  logDebug(`Wallet [${wallet.address}] Contract [${collection.slug}]: Syncing bids`);
  const myBids = collection.myBids[wallet.address];

  let myExecutableSizeSum = 0;
  let aboveExecutableSizeSum = 0;
  const promises: Promise<unknown>[] = [];

  for (let i = 0; i < collection.bids.length; i++) {
    const pool = i + 1;
    const bid = collection.bids[i];

    myExecutableSizeSum += bid.executableSize;

    if (pool === 1 && !collection.config.bidToPool1) {
      if (myBids.bids[bid.price]) {
        logInfo(
          `Wallet [${wallet.address}] Contract [${collection.slug}]: Cancelling bid from pool #${pool} ${bid.price}`,
        );
        promises.push(
          cancelCollectionBid(collection, [bid.price], wallet).catch(() => {
            logEmergency(`Failed to cancel bid ${bid.price} for contract ${collection.slug}.`);
          }),
        );

        delete myBids.bids[bid.price];
      }

      aboveExecutableSizeSum += bid.executableSize;
      continue;
    }

    if (myBids.bids[bid.price]) {
      if (
        aboveExecutableSizeSum >= collection.config.poolSizeLimitCancel ||
        (collection.config.bidToSamePool &&
          myExecutableSizeSum >= collection.config.samePoolSizeLimitCancel)
      ) {
        break;
      }

      if (aboveExecutableSizeSum >= collection.config.poolSizeLimitCancel) {
        logInfo(
          `Wallet [${wallet.address}] Contract [${collection.slug}]: Cancelling bid from pool #${pool} ${bid.price}, above executable size ${aboveExecutableSizeSum} < ${collection.config.poolSizeLimitCancel}`,
        );
      } else {
        logInfo(
          `Wallet [${wallet.address}] Contract [${collection.slug}]: Cancelling bid from pool #${pool} ${bid.price}, my executable size ${myExecutableSizeSum} < ${collection.config.samePoolSizeLimitCancel}`,
        );
      }

      promises.push(
        cancelCollectionBid(collection, [bid.price], wallet).catch(() => {
          logEmergency(`Failed to cancel bid ${bid.price} for contract ${collection.slug}.`);
        }),
      );

      delete myBids.bids[bid.price];
      aboveExecutableSizeSum += bid.executableSize;

      continue;
    }

    if (pool > collection.config.maxPoolToBid) {
      logDebug(
        `Wallet [${wallet.address}] Contract [${collection.slug}]: Skipping pool #${pool} as it's > ${collection.config.maxPoolToBid}`,
      );
      continue;
    }

    if (wallet.balance < bid.price) {
      logDebug(
        `Wallet [${wallet.address}] Contract [${collection.slug}]: Not enough balance (${wallet.balance}) to bid ${contractAddress} in pool #${pool} for ${bid.price}`,
      );
      aboveExecutableSizeSum += bid.executableSize;
      continue;
    }

    if (
      aboveExecutableSizeSum >= collection.config.poolSizeLimitBid ||
      (collection.config.bidToSamePool &&
        myExecutableSizeSum >= collection.config.samePoolSizeLimitBid)
    ) {
      const quantities = getQuantity(
        wallet.balance,
        bid.price,
        collection.config.useMaxQuantity,
        collection.config.maxQuantity,
      );
      if (aboveExecutableSizeSum >= collection.config.poolSizeLimitBid) {
        logInfo(
          `Wallet [${wallet.address}] Contract [${
            collection.slug
          }]: Will send bid [${quantities.join(',')}]x${
            bid.price
          } to pool #${pool}, above executable size is ${aboveExecutableSizeSum} >= ${
            collection.config.poolSizeLimitBid
          }.`,
        );
      } else {
        logInfo(
          `Wallet [${wallet.address}] Contract [${
            collection.slug
          }]: Will send bid [${quantities.join(',')}]x${
            bid.price
          } to pool #${pool}, my executable size is ${myExecutableSizeSum} >= ${
            collection.config.samePoolSizeLimitBid
          }`,
        );
      }
      promises.push(sendCollectionBid(store, contractAddress, bid.price, quantities, wallet));
      break;
    }

    if (aboveExecutableSizeSum < collection.config.poolSizeLimitBid) {
      logDebug(
        `Wallet [${wallet.address}] Contract [${collection.slug}]: Skipping pool #${pool} ${bid.price}, above executableSize ${aboveExecutableSizeSum} < ${collection.config.poolSizeLimitBid}`,
      );
    }

    if (
      collection.config.bidToSamePool &&
      myExecutableSizeSum < collection.config.samePoolSizeLimitBid
    ) {
      logDebug(
        `Wallet [${wallet.address}] Contract [${collection.slug}]: Skipping pool #${pool} ${bid.price}, my executableSize ${myExecutableSizeSum} < ${collection.config.samePoolSizeLimitBid}`,
      );
    }

    aboveExecutableSizeSum += bid.executableSize;
  }

  await Promise.all(promises);

  saveMyBids(
    contractAddress,
    wallet.address,
    store.collections[contractAddress].myBids[wallet.address].bids,
  );

  logDebug(`Wallet [${wallet.address}] Contract [${collection.slug}]: Current bids`, myBids);
};

export const handleUpdatedBids = async (
  store: Store,
  contractAddress: string,
  updatedBids: UpdatedBids[],
): Promise<void> => {
  const collection = store.collections[contractAddress];
  collection.updaterRunning = true;
  collection.bids = updatedBids.map((bid) => ({
    price: bid.price,
    executableSize: bid.executableSize,
  }));

  const promises: Promise<unknown>[] = [];

  for (const wallet of store.wallets) {
    if (!collection.myBids[wallet.address]) {
      collection.myBids[wallet.address] = { bids: {} };
    }

    const now = Date.now();
    Object.entries(collection.myBids[wallet.address].bids).forEach(([bid, expires]) => {
      if (now > expires) {
        delete collection.myBids[wallet.address].bids[bid];
      }
    });

    promises.push(
      syncMyBids(store, contractAddress, wallet).catch(() => {
        logError(`Failed syncing bids for ${collection.slug}`);
      }),
    );
  }

  await Promise.all(promises);

  if (store.collections[contractAddress].queuedUpdate.length !== 0) {
    logDebug(`Contract [${collection.slug}]: Handle updated bids (from queue)`);
    const queuedBids = store.collections[contractAddress].queuedUpdate;
    store.collections[contractAddress].queuedUpdate = [];

    void handleUpdatedBids(store, contractAddress, queuedBids);

    return;
  }

  store.collections[contractAddress].updaterRunning = false;
  logDebug(`Contract [${collection.slug}]: Updater finished.`);
};
