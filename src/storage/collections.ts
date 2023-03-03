import { writeFileSync, readFileSync, existsSync } from 'fs';

import { Collection } from '../store/collectionsSlice';
import { tmpDirEnv } from '../utils/flags';

type SavedCollection = Record<string, { contractAddress: string; name: string; slug: string }>;

const FILE = `${tmpDirEnv}/collections.json`;

export const saveCollections = (collections: Collection[]): void => {
  const savedCollections = readCollections();
  collections.forEach((collection) => {
    savedCollections[collection.contractAddress] = {
      contractAddress: collection.contractAddress,
      name: collection.name,
      slug: collection.slug,
    };
  });

  writeFileSync(FILE, JSON.stringify(savedCollections));
};

export const readCollections = (): SavedCollection => {
  if (!existsSync(FILE)) return {};

  return JSON.parse(String(readFileSync(FILE))) as SavedCollection;
};
