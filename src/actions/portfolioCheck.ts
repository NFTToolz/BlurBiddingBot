import { LoggedInWallet } from '../os/login';
import { getUserPortfolio } from '../os/user';
import { Store } from '../store';
import { sendFormattedMessage } from '../utils/discord';
import { logError } from '../utils/log';

const portfolio: Record<string, Set<string>> = {};

const initWalletPortfolio = async (wallet: LoggedInWallet): Promise<void> => {
  if (!portfolio[wallet.address]) {
    portfolio[wallet.address] = new Set<string>();
  }

  const walletPortfolio = await getUserPortfolio(wallet);
  if (walletPortfolio.totalCount === 0) {
    return;
  }

  for (const ownedToken of walletPortfolio.tokens) {
    const key = `${ownedToken.contractAddress}:${ownedToken.tokenId}`;
    portfolio[wallet.address].add(key);
  }
};

const walletPortfolioCheck = async (store: Store, wallet: LoggedInWallet): Promise<void> => {
  if (!portfolio[wallet.address]) {
    portfolio[wallet.address] = new Set<string>();
  }

  const walletPortfolio = await getUserPortfolio(wallet);
  if (walletPortfolio.totalCount === 0) {
    portfolio[wallet.address].clear();
    return;
  }

  const toDelete = new Set(portfolio[wallet.address]);
  for (const ownedToken of walletPortfolio.tokens) {
    const key = `${ownedToken.contractAddress}:${ownedToken.tokenId}`;
    if (portfolio[wallet.address].has(key)) {
      toDelete.delete(key);
      continue;
    }

    portfolio[wallet.address].add(key);
    void sendFormattedMessage(
      'NEW PURCHASE',
      `${
        store.collections[ownedToken.contractAddress.toLowerCase()]
          ? store.collections[ownedToken.contractAddress.toLowerCase()].name
          : ''
      }${ownedToken.contractAddress} tokenId: ${ownedToken.tokenId}`,
    );
  }

  Array.from(toDelete).forEach((key) => {
    portfolio[wallet.address].delete(key);
  });
};

export const portfolioCheck = async (store: Store): Promise<void> => {
  const initPromises: Promise<unknown>[] = [];
  store.wallets.forEach((wallet) => {
    initPromises.push(
      initWalletPortfolio(wallet).catch(() => {
        logError(`Initing wallet ${wallet.address} portfolio failed`);
      }),
    );
  });

  await Promise.all(initPromises);

  setInterval(() => {
    store.wallets.forEach((wallet) => {
      void walletPortfolioCheck(store, wallet).catch(() => {
        logError(`Checking wallet ${wallet.address} portfolio failed`);
      });
    });
  }, 10 * 1000);
};
