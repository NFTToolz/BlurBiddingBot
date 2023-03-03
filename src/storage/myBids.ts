import { writeFileSync, readFileSync, existsSync } from 'fs';

import { WalletAddress } from '../store/collectionsSlice';
import { tmpDirEnv } from '../utils/flags';

/*
    collection: {wallet: {bid: expiration}}
 */
type SavedMyBids = Record<string, Record<WalletAddress, Record<string, number>>>;

const FILE = `${tmpDirEnv}/my_bids.json`;

export const saveMyBids = (
  contractAddress: string,
  wallet: string,
  myBids: Record<string, number>,
): void => {
  const savedBids = readMyBids();

  if (!savedBids[contractAddress]) {
    savedBids[contractAddress] = {};
  }

  if (!savedBids[contractAddress][wallet]) {
    savedBids[contractAddress][wallet] = {};
  }

  savedBids[contractAddress][wallet] = myBids;

  writeFileSync(FILE, JSON.stringify(savedBids));
};

export const readMyBids = (): SavedMyBids => {
  if (!existsSync(FILE)) return {};

  return JSON.parse(String(readFileSync(FILE))) as SavedMyBids;
};
