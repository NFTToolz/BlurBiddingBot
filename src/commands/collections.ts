import { getCollections } from '../blur/collections';
import { LoggedInWallet } from '../os/login';
import { saveSuitableCollections } from '../storage/suitableCollections';
import { walletsSlice } from '../store/walletsSlice';
import { collectionsEnv } from '../utils/flags';

const findSuitableCollections = async (wallets: LoggedInWallet[]): Promise<void> => {
  const collections = await getCollections(300);
  const alreadyRunningCollections = new Set<string>();
  collectionsEnv.split(',').forEach((address) => {
    alreadyRunningCollections.add(address.toLowerCase());
  });

  const data = ['wallet;contract;name;slug;volume1d;volume1w;floor;bestbid;running'];
  collections.forEach((collection) => {
    wallets.forEach((wallet) => {
      data.push(
        `${wallet.address};${collection.contractAddress};${collection.name};${collection.slug};${
          collection.volumeOneDay?.amount || ''
        };${collection.volumeOneWeek?.amount || ''};${collection.floorPrice?.amount || ''};${
          collection.bestCollectionBid?.amount || ''
        };${alreadyRunningCollections.has(collection.contractAddress.toLowerCase()) ? '1' : '0'}`,
      );
    });
  });

  saveSuitableCollections(data);
};

export const collections = async (): Promise<void> => {
  const wallets = await walletsSlice();
  await findSuitableCollections(wallets);
};
