import 'dotenv/config';
import './utils/flags';

import { cancel } from './commands/cancel';
import { collections } from './commands/collections';
import { generateCollectionConfigs } from './commands/generateCollectionConfigs';
import { run } from './commands/run';
import { logError } from './utils/log';

const main = async (): Promise<void> => {
  const args = process.argv.slice(2);
  const command = args[0] || 'run';

  if (command === 'collections') {
    void collections();
    return;
  }

  if (command === 'collection:configs') {
    void generateCollectionConfigs();
    return;
  }

  if (command === 'cancel') {
    void cancel();
    return;
  }

  if (command === 'run') {
    void run();
    return;
  }

  logError('Invalid command');
};

void main();
