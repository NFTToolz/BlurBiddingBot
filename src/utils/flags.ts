if (!process.env.WS_SERVER) {
  throw new Error('WS_SERVER env is required');
}

if (!process.env.INFURA_KEY) {
  throw new Error('INFURA_KEY env is required');
}

if (!process.env.RAPID_API_KEY) {
  throw new Error('RAPID_API_KEY env is required');
}

if (!process.env.WS_API_KEY) {
  throw new Error('WS_API_KEY env is required');
}

if (!process.env.TMP_DIR) {
  throw new Error('TMP_DIR env is required');
}

if (!process.env.CONFIG_DIR) {
  throw new Error('CONFIG_DIR env is required');
}

export const dryRunEnv = process.env.DRY_RUN === '1';
export const useMaxQuantityEnv = process.env.USE_MAX_QUANTITY === '1';
export const bidToPool1Env = process.env.BID_TO_POOL_1 === '1';
export const poolSizeLimitBidEnv = Number(process.env.POOL_SIZE_LIMIT_BID) || 500;
export const poolSizeLimitCancelEnv = Number(process.env.POOL_SIZE_LIMIT_CANCEL) || 450;
export const samePoolSizeLimitBidEnv = Number(process.env.SAME_POOL_SIZE_LIMIT_BID) || 500;
export const samePoolSizeLimitCancelEnv = Number(process.env.SAME_POOL_SIZE_LIMIT_CANCEL) || 450;
export const bidToSamePoolEnv = process.env.BID_TO_SAME_POOL === '1';
export const infuraKeyEnv = process.env.INFURA_KEY;
export const rapidApiKeyEnv = process.env.RAPID_API_KEY;
export const wsServerEnv = process.env.WS_SERVER;
export const wsApiKeyEnv = process.env.WS_API_KEY;
export const tmpDirEnv = process.env.TMP_DIR;
export const configDirEnv = process.env.CONFIG_DIR;
export const discordHookEnv = process.env.DISCORD_HOOK || false;
export const logLevelEnv = Number(process.env.LOG_LEVEL) || 1;
export const discordLogLevelEnv = Number(process.env.DISCORD_LOG_LEVEL) || 1;
export const privateKeysEnv = process.env.PRIVATE_KEYS || '';
export const collectionsEnv = process.env.COLLECTIONS || '';
export const maxPoolToBidEnv = Number(process.env.MAX_POOL_TO_BID) || 3;
export const openBlurHealthCheckIntervalEnv =
  Number(process.env.OPENBLUR_HEALTH_CHECK_INTERVAL) || 10;
export const maxQuantityEnv = Number(process.env.MAX_QUANTITY) || 0;
export const bidExpirationEnv = Number(process.env.BID_EXPIRATION) || 30;

if (maxPoolToBidEnv < 2 || maxPoolToBidEnv > 5) {
  throw new Error('MAX_POOL_TO_BID env has to be in range <2,5>');
}

if (poolSizeLimitCancelEnv > poolSizeLimitBidEnv) {
  throw new Error('POOL_SIZE_LIMIT_CANCEL env has to be lower or equal to POOL_SIZE_LIMIT_BID env');
}

if (samePoolSizeLimitCancelEnv > samePoolSizeLimitBidEnv) {
  throw new Error(
    'SAME_POOL_SIZE_LIMIT_CANCEL env has to be lower or equal to SAME_POOL_SIZE_LIMIT_BID env',
  );
}

if (bidExpirationEnv < 15) {
  throw new Error('BID_EXPIRATION env has to be greater or equal to 15');
}
