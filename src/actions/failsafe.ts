import { handleUpdatedBids } from './collection';
import { getCollectionBids } from '../os/collectionBid';
import { Store } from '../store';
import { logDebug, logError } from '../utils/log';

const failsafeReasons = {
  wsDown: false,
  blurApiDown: false,
};

export const failSafeState = {
  isRunning: false,
};

export const turnOnFailsafe = (
  store: Store,
  reason: keyof typeof failsafeReasons,
  msg = '',
): void => {
  if (!failsafeReasons[reason]) {
    logError(`Failsafe started: ${reason}; ${msg}`);
  }

  failsafeReasons[reason] = true;
  if (failSafeState.isRunning) return;

  failSafeState.isRunning = true;
  void failsafe(store);
};

export const turnOffFailsafe = (reason: keyof typeof failsafeReasons): void => {
  if (!failsafeReasons[reason]) return;

  logError(`Failsafe stopped: ${reason}`);
  failsafeReasons[reason] = false;

  if (!failsafeReasons.wsDown && !failsafeReasons.blurApiDown) {
    failSafeState.isRunning = false;
  }
};

const failsafe = async (store: Store): Promise<void> => {
  if (!failSafeState.isRunning) return;
  logDebug(`Failsafe: Handle updated bids (from failsafe)`);
  const promises: Promise<unknown>[] = [];

  const collections = Object.keys(store.collections);

  collections.forEach((contractAddress) => {
    promises.push(
      getCollectionBids(contractAddress, store.wallets[0], 5)
        .then(async (bids) => {
          await handleUpdatedBids(store, contractAddress, bids);
        })
        .catch((err) => {
          logError(
            `Contract: ${store.collections[contractAddress].slug}: Failed to fetch bids from API.`,
          );

          if (err instanceof Error) {
            logError(err.message);
          }
        }),
    );
  });

  await Promise.all(promises);
  if (!failSafeState.isRunning) return;

  setTimeout(() => {
    failsafe(store);
  }, 1000);
};
