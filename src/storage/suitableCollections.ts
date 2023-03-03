import { writeFileSync } from 'fs';

import { tmpDirEnv } from '../utils/flags';

const FILE = `${tmpDirEnv}/suitable_collections.csv`;

export const saveSuitableCollections = (data: string[]): void => {
  writeFileSync(FILE, data.join('\n'));
};
