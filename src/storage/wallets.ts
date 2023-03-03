import { writeFileSync, readFileSync, existsSync } from 'fs';

import { LoggedInWallet } from '../os/login';
import { tmpDirEnv } from '../utils/flags';

type SavedWallets = Record<string, { address: string; authKey: string }>;

const FILE = `${tmpDirEnv}/wallets.json`;

export const saveWallets = (loggedInWallets: LoggedInWallet[]): void => {
  const savedWallets = readWallets();
  loggedInWallets.forEach((wallet) => {
    savedWallets[wallet.address] = { address: wallet.address, authKey: wallet.authKey };
  });

  writeFileSync(FILE, JSON.stringify(savedWallets));
};

export const readWallets = (): SavedWallets => {
  if (!existsSync(FILE)) return {};

  return JSON.parse(String(readFileSync(FILE))) as SavedWallets;
};
