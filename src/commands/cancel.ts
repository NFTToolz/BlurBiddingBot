import { cancelCollectionBid } from '../os/collectionBid';
import { LoggedInWallet } from '../os/login';
import { getUsersCollectionBids } from '../os/user';
import { walletsSlice } from '../store/walletsSlice';
import { logError } from '../utils/log';

const cancelWalletBids = async (wallet: LoggedInWallet): Promise<void> => {
  try {
    const promises: Promise<unknown>[] = [];
    const bids = await getUsersCollectionBids(wallet);

    bids.forEach((bid) => {
      promises.push(
        cancelCollectionBid(
          { slug: '', contractAddress: bid.contractAddress },
          [Number(bid.price)],
          wallet,
        ).catch(() => {
          logError(
            `Failed to cancel bids wallet [${wallet.address}] contract [${bid.contractAddress}] for ${bid.price}`,
          );
        }),
      );
    });

    await Promise.all(promises);
  } catch (err) {
    logError(`Failed to cancel bids for wallet: ${wallet.address}`);
  }
};

export const cancel = async (): Promise<void> => {
  const wallets = await walletsSlice();

  const promises: Promise<unknown>[] = [];

  wallets.forEach((wallet) => {
    promises.push(cancelWalletBids(wallet));
  });

  await Promise.all(promises);
};
