import { RateLimit } from 'async-sema';

export const osRateLimit = RateLimit(8, { uniformDistribution: true });
export const blurRateLimit = RateLimit(8, { uniformDistribution: true });
