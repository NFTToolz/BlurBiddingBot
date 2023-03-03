import { io } from 'socket.io-client';

import { handleUpdatedBids, setupCollection } from '../actions/collection';
import { failSafeState, turnOffFailsafe, turnOnFailsafe } from '../actions/failsafe';
import { portfolioCheck } from '../actions/portfolioCheck';
import { recoverState } from '../actions/recoverState';
import { healthCheck } from '../blur/healthCheck';
import { createStore } from '../store';
import { UpdatedBids } from '../store/collectionsSlice';
import { openBlurHealthCheckIntervalEnv, wsApiKeyEnv, wsServerEnv } from '../utils/flags';
import { logDebug, logError, logInfo } from '../utils/log';

export const run = async (): Promise<void> => {
  const socket = io(wsServerEnv, {
    autoConnect: false,
    extraHeaders: {
      'api-key': wsApiKeyEnv,
    },
  });

  const store = await createStore();
  if (store.wallets.length === 0) {
    logError('Not a single signed in wallet. Exiting.');
    return;
  }

  await recoverState(store);

  void portfolioCheck(store);

  logInfo('SETTING UP COLLECTIONS');
  const collectionPromises: Promise<unknown>[] = [];
  Object.keys(store.collections).forEach((contractAddress) => {
    collectionPromises.push(
      setupCollection(store, contractAddress).catch(() => {
        logError(`Failed to set up contract ${contractAddress}`);
      }),
    );
  });

  await Promise.all(collectionPromises);

  socket.on('connect', () => {
    logInfo('Connected to WS server');

    turnOffFailsafe('wsDown');
  });

  socket.on('connect_error', (msg) => {
    turnOnFailsafe(store, 'wsDown', `WS connect error: ${msg}`);
  });

  socket.on('disconnect', (msg) => {
    turnOnFailsafe(store, 'wsDown', `WS disconnected: ${msg}`);
  });

  socket.on('XXX_SUBSCRIPTION_REQUIRED_XXX', (msg) => {
    if (failSafeState.isRunning) return;

    const data = JSON.parse(msg) as UpdatedBids[];
    if (!Array.isArray(data) || data.length === 0) return;

    const contractAddress = data[0].contractAddress.toLowerCase();
    if (!store.collections[contractAddress]) return;

    if (!store.collections[contractAddress].updaterRunning) {
      logDebug(`Contract [${contractAddress}]: Handle updated bids (from ws)`);
      void handleUpdatedBids(store, contractAddress, data);
      return;
    }

    store.collections[contractAddress].queuedUpdate = data;
    logDebug(`Contract [${contractAddress}]: Queuing data.`);
  });

  socket.connect();

  setInterval(() => {
    void healthCheck(store);
  }, openBlurHealthCheckIntervalEnv * 1000);
};
