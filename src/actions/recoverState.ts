import { LoggedInWallet } from '../os/login';
import { getUsersCollectionBids } from '../os/user';
import { readMyBids } from '../storage/myBids';
import { Store } from '../store';
import { logDebug } from '../utils/log';

export const recoverState = async (store: Store): Promise<void> => {
  const savedBids = readMyBids();
  const promises: Promise<unknown>[] = [];
  store.wallets.forEach((wallet) => {
    promises.push(recoverUserBids(store, wallet, savedBids));
  });

  await Promise.all(promises);

  logDebug('Recovered State', store.collections);
};

const recoverUserBids = async (
  store: Store,
  wallet: LoggedInWallet,
  savedBids: ReturnType<typeof readMyBids>,
): Promise<void> => {
  const rawBids = await getUsersCollectionBids(wallet);
  const myBids = new Set<string>();

  rawBids.forEach((bid) => {
    myBids.add(`${bid.contractAddress}:${bid.price}`);
  });

  logDebug('my bids', Array.from(myBids));

  for (const [contractAddress, walletsBids] of Object.entries(savedBids)) {
    if (!walletsBids[wallet.address]) continue;
    if (!store.collections[contractAddress]) continue;

    if (!store.collections[contractAddress].myBids[wallet.address]) {
      store.collections[contractAddress].myBids[wallet.address] = { bids: {} };
    }

    Object.entries(walletsBids[wallet.address]).forEach(([bidPrice, expiration]) => {
      if (myBids.has(`${contractAddress}:${bidPrice}`)) {
        store.collections[contractAddress].myBids[wallet.address].bids[bidPrice] = expiration;
      }
    });
  }
};
