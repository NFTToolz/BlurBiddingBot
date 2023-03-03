import ax from 'axios';
import axiosRetry from 'axios-retry';

import { rapidApiKeyEnv } from './flags';

export const osAxios = ax.create({
  baseURL: 'https://opensea15.p.rapidapi.com',
  // timeout: 10000,
  headers: {
    'X-RapidAPI-Key': rapidApiKeyEnv,
    'X-RapidAPI-Host': 'opensea15.p.rapidapi.com',
  },
});

axiosRetry(osAxios, {
  retries: 2,
  retryCondition: (error): boolean => {
    return (
      !error.response ||
      (error.response.status >= 400 &&
        error.response.status <= 599 &&
        error.response?.data?.message !== 'Limit exceeded')
    );
  },
});

export const blurAxios = ax.create({
  baseURL: 'https://openblur.p.rapidapi.com',
  timeout: 5000,
  headers: {
    'X-RapidAPI-Key': rapidApiKeyEnv,
    'X-RapidAPI-Host': 'openblur.p.rapidapi.com',
  },
});
