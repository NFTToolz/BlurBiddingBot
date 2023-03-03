import { Collections, collectionSlice } from './collectionsSlice';
import { walletsSlice } from './walletsSlice';
import { LoggedInWallet } from '../os/login';
import { logInfo } from '../utils/log';

export type Store = {
  wallets: LoggedInWallet[];
  collections: Collections;
};

export const createStore = async (): Promise<Store> => {
  logInfo('SETTING UP STORE');
  const wallets = walletsSlice();
  const collections = collectionSlice();

  return {
    wallets: await wallets,
    collections: await collections,
  };
};
