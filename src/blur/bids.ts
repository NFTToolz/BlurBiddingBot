import { turnOffFailsafe, turnOnFailsafe } from '../actions/failsafe';
import { getCollectionBids as osGetCollectionBids } from '../os/collectionBid';
import { LoggedInWallet } from '../os/login';
import { Store } from '../store';
import { blurAxios } from '../utils/axios';
import { blurRateLimit } from '../utils/rateLimit';

export type SimplifiedCollectionBid = {
  price: number;
  bidderAddressesSample: string[];
  numberBidders: number;
  executableSize: number;
  contractAddress: string;
};

type CollectionBid = {
  id: number;
  slug: string;
  contractAddress: string;
  price: number;
  bidderAddressesSample: string[];
  numberBidders: number;
  executableSize: number;
  updatedAt: string;
  createdAt: string;
};

type CollectionBids = {
  total: number;
  bids: CollectionBid[];
};

export const getCollectionBids = async (
  store: Store,
  contractAddress: string,
  wallet: LoggedInWallet,
  take = 50,
  from = 0,
): Promise<SimplifiedCollectionBid[]> => {
  await blurRateLimit();

  try {
    const response = await blurAxios.get<CollectionBids>('/bids', {
      params: {
        contractAddress,
        take,
        from,
      },
    });

    turnOffFailsafe('blurApiDown');
    return response.data.bids;
  } catch (err) {
    turnOnFailsafe(store, 'blurApiDown', err instanceof Error ? err.message : 'Unknown error');
    return osGetCollectionBids(contractAddress, wallet, take);
  }
};
