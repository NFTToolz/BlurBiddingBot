import { getCollection } from '../blur/collections';
import { readCollections, saveCollections } from '../storage/collections';
import { readCollectionConfigs } from '../storage/collectionsConfig';
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
import { logDebug, logError, logInfo } from '../utils/log';

export type UpdatedBids = {
  contractAddress: string;
  price: number;
  executableSize: number;
  numberBidders: number;
};

export type WalletAddress = string;

type MyBid = {
  bids: Record<string, number>;
};
type MyBids = Record<WalletAddress, MyBid>;

type Bid = {
  price: number;
  executableSize: number;
};

export type CollectionConfig = {
  slug?: string;
  useMaxQuantity: boolean;
  maxQuantity: number;
  bidToPool1: boolean;
  poolSizeLimitBid: number;
  poolSizeLimitCancel: number;
  samePoolSizeLimitBid: number;
  samePoolSizeLimitCancel: number;
  bidToSamePool: boolean;
  maxPoolToBid: number;
  bidExpiration: number;
};

export type Collection = {
  contractAddress: string;
  bids: Bid[];
  myBids: MyBids;
  updaterRunning: boolean;
  queuedUpdate: UpdatedBids[];
  name: string;
  slug: string;
  config: CollectionConfig;
};
export type Collections = Record<string, Collection>;

const getCollectionDetails = async (
  contractAddress: string,
  savedCollections: ReturnType<typeof readCollections>,
  collectionsConfig: ReturnType<typeof readCollectionConfigs>,
): Promise<Collection> => {
  const details = savedCollections[contractAddress]
    ? savedCollections[contractAddress]
    : await getCollection(contractAddress);

  const savedConfig = collectionsConfig[contractAddress] || {};

  const collectionDetails = {
    name: details.name,
    slug: details.slug,
    contractAddress,
    bids: [],
    myBids: {},
    updaterRunning: false,
    queuedUpdate: [],
    config: {
      maxPoolToBid: savedConfig.maxPoolToBid ?? maxPoolToBidEnv,
      poolSizeLimitBid: savedConfig.poolSizeLimitBid ?? poolSizeLimitBidEnv,
      poolSizeLimitCancel: savedConfig.poolSizeLimitCancel ?? poolSizeLimitCancelEnv,
      bidToPool1: savedConfig.bidToPool1 ?? bidToPool1Env,
      bidToSamePool: savedConfig.bidToSamePool ?? bidToSamePoolEnv,
      samePoolSizeLimitBid: savedConfig.samePoolSizeLimitBid ?? samePoolSizeLimitBidEnv,
      samePoolSizeLimitCancel: savedConfig.samePoolSizeLimitCancel ?? samePoolSizeLimitCancelEnv,
      useMaxQuantity: savedConfig.useMaxQuantity ?? useMaxQuantityEnv,
      maxQuantity: savedConfig.maxQuantity ?? maxQuantityEnv,
      bidExpiration: savedConfig.bidExpiration ?? bidExpirationEnv,
    },
  };

  logDebug(`Contract ${collectionDetails.slug} (${contractAddress}) loaded`, collectionDetails);

  return collectionDetails;
};

export const collectionSlice = async (): Promise<Collections> => {
  const collections: Collections = {};

  const addresses = collectionsEnv.split(',');
  const savedCollections = readCollections();
  const collectionsConfig = readCollectionConfigs();

  const promises: Promise<unknown>[] = [];

  addresses.forEach((contractAddress) => {
    promises.push(
      getCollectionDetails(contractAddress.toLowerCase(), savedCollections, collectionsConfig)
        .then((collection) => {
          collections[collection.contractAddress] = collection;
          logInfo(
            `Contract ${collection.slug} (${collection.contractAddress}) loaded${
              collectionsConfig[contractAddress] ? ' with custom config' : ''
            }.`,
          );
        })
        .catch(() => {
          logError(`Failed loading collection ${contractAddress}`);
        }),
    );
  });

  await Promise.all(promises);

  saveCollections(Object.values(collections));

  return collections;
};
