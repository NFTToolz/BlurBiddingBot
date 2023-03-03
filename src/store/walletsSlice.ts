import { LoggedInWallet, login } from '../os/login';
import { saveWallets } from '../storage/wallets';
import { log, LOG_LEVEL } from '../utils/log';
import { getSigners } from '../utils/provider';

export const walletsSlice = async (): Promise<LoggedInWallet[]> => {
  const wallets = await getSigners();
  const loginPromises: Promise<unknown>[] = [];

  const loggedInWallets: LoggedInWallet[] = [];

  wallets.forEach(([address, signer]) => {
    loginPromises.push(
      login(address, signer)
        .then((loggedInWallet) => {
          loggedInWallets.push(loggedInWallet);
          log(LOG_LEVEL.INFO, `Wallet ${loggedInWallet.address} logged in.`);
          log(LOG_LEVEL.DEBUG, `Wallet ${loggedInWallet.address}`, {
            address: loggedInWallet.address,
            balance: loggedInWallet.balance,
          });
          return loggedInWallet;
        })
        .catch(() => {
          log(LOG_LEVEL.ERROR, `Wallet ${address} failed to log in`);
        }),
    );
  });

  await Promise.all(loginPromises);

  saveWallets(loggedInWallets);

  return loggedInWallets;
};
