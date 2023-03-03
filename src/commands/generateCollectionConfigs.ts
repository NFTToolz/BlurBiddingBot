import { getCollection } from '../blur/collections';
import { readCollections } from '../storage/collections';
import { readCollectionConfigs, saveCollectionConfigs } from '../storage/collectionsConfig';
import { CollectionConfig } from '../store/collectionsSlice';
import {
  bidExpirationEnv,
  bidToPool1Env,
  bidToSamePoolEnv,
  collectionsEnv,
  maxPoolToBidEnv,
  maxQuantityEnv,
  poolSizeLimitBidEnv,
  poolSizeLimitCancelEnv,
  samePoolSizeLimitBidEnv,
  samePoolSizeLimitCancelEnv,
  useMaxQuantityEnv,
} from '../utils/flags';
import { logError } from '../utils/log';

const generateConfig = async (
  contractAddress: string,
  savedCollections: ReturnType<typeof readCollections>,
): Promise<CollectionConfig> => {
  const details = savedCollections[contractAddress]
    ? savedCollections[contractAddress]
    : await getCollection(contractAddress);

  return {
    slug: details.slug,
    maxPoolToBid: maxPoolToBidEnv,
    poolSizeLimitBid: poolSizeLimitBidEnv,
    poolSizeLimitCancel: poolSizeLimitCancelEnv,
    bidToPool1: bidToPool1Env,
    bidToSamePool: bidToSamePoolEnv,
    samePoolSizeLimitBid: samePoolSizeLimitBidEnv,
    samePoolSizeLimitCancel: samePoolSizeLimitCancelEnv,
    useMaxQuantity: useMaxQuantityEnv,
    maxQuantity: maxQuantityEnv,
    bidExpiration: bidExpirationEnv,
  };
};

export const generateCollectionConfigs = async (): Promise<void> => {
  const configs: ReturnType<typeof readCollectionConfigs> = {};

  const addresses = collectionsEnv.split(',');
  const savedCollections = readCollections();

  const promises: Promise<unknown>[] = [];

  addresses.forEach((contractAddress) => {
    promises.push(
      generateConfig(contractAddress.toLowerCase(), savedCollections)
        .then((config) => {
          configs[contractAddress.toLowerCase()] = config;
        })
        .catch(() => {
          logError(`Failed generate collection config ${contractAddress}`);
        }),
    );
  });

  await Promise.all(promises);

  saveCollectionConfigs(configs);
};
