import { blurAxios } from '../utils/axios';
import { blurRateLimit } from '../utils/rateLimit';

type Amount = {
  amount: string;
  unit: string;
};

type Collection = {
  contractAddress: string;
  name: string;
  slug: string;
  imageUrl: string;
  totalSupply: number;
  numberOwners: number;
  floorPrice: Amount | null;
  floorPriceOneDay: Amount | null;
  floorPriceOneWeek: Amount | null;
  volumeFifteenMinutes: Amount | null;
  volumeOneDay: Amount | null;
  volumeOneWeek: Amount | null;
  bestCollectionBid: Amount | null;
  totalCollectionBidValue: Amount | null;
};

export const getCollections = async (pageSize = 100, from = 0): Promise<Collection[]> => {
  await blurRateLimit();
  const response = await blurAxios.get<Collection[]>('/collections', {
    params: { sortBy: 'volumeOneDay', orderBy: 'desc', pageSize, from },
  });

  return response.data;
};

export const getCollection = async (contractAddress: string): Promise<Collection> => {
  await blurRateLimit();
  const response = await blurAxios.get<Collection[]>('/collections', {
    params: { sortBy: 'volumeOneDay', orderBy: 'desc', pageSize: 1, from: 0, contractAddress },
  });

  if (!response.data[0]) {
    throw Error(`collection ${contractAddress} not found`);
  }

  return response.data[0];
};
