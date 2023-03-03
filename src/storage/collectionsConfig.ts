import { readFileSync, existsSync, writeFileSync } from 'fs';

import { CollectionConfig } from '../store/collectionsSlice';
import { configDirEnv } from '../utils/flags';

type SavedCollectionConfigs = Record<string, Partial<CollectionConfig> | undefined>;

const FILE = `${configDirEnv}/collections.json`;

export const saveCollectionConfigs = (configs: SavedCollectionConfigs): void => {
  writeFileSync(FILE, JSON.stringify(configs, null, 2));
};

export const readCollectionConfigs = (): SavedCollectionConfigs => {
  if (!existsSync(FILE)) return {};

  const savedConfigs = JSON.parse(String(readFileSync(FILE))) as SavedCollectionConfigs;
  const sanitisedConfigs: SavedCollectionConfigs = {};

  Object.entries(savedConfigs).forEach(([contractAddress, config]) => {
    sanitisedConfigs[contractAddress.toLowerCase()] = config;
  });

  return sanitisedConfigs;
};
