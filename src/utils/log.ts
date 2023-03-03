import { sendFormattedMessage } from './discord';
import { discordLogLevelEnv, dryRunEnv, logLevelEnv } from './flags';

export enum LOG_LEVEL {
  EMERGENCY = 1,
  ERROR = 2,
  INFO = 3,
  DEBUG = 4,
}

const LOG_LEVEL_NAME: Record<LOG_LEVEL, string> = {
  [LOG_LEVEL.EMERGENCY]: 'EMERGENCY',
  [LOG_LEVEL.ERROR]: 'ERROR',
  [LOG_LEVEL.INFO]: 'INFO',
  [LOG_LEVEL.DEBUG]: 'DEBUG',
};

const colors = {
  [LOG_LEVEL.DEBUG]: '\x1b[36m',
  [LOG_LEVEL.INFO]: '\x1b[35m',
  [LOG_LEVEL.ERROR]: '\x1b[31m',
  [LOG_LEVEL.EMERGENCY]: '\x1b[41m\x1b[30m',
};

export const log = (
  level: LOG_LEVEL,
  msg: string,
  data?: Record<string | number | symbol, unknown> | unknown[],
): void => {
  if (discordLogLevelEnv >= level) {
    void sendFormattedMessage(LOG_LEVEL_NAME[level], `${msg} ${data ? JSON.stringify(data) : ''}`);
  }

  if (logLevelEnv < level) return;

  const prefix = dryRunEnv ? '[DRY-RUN] ' : '';

  // eslint-disable-next-line no-console
  console.log(`${colors[level]}${prefix}${msg}\x1b[0m`);
  if (data) {
    // eslint-disable-next-line no-console
    console.dir(data, { depth: null, compact: false });
  }
};

export const logDebug = (
  msg: string,
  data?: Record<string | number | symbol, unknown> | unknown[],
): void => log(LOG_LEVEL.DEBUG, msg, data);

export const logInfo = (
  msg: string,
  data?: Record<string | number | symbol, unknown> | unknown[],
): void => log(LOG_LEVEL.INFO, msg, data);

export const logError = (
  msg: string,
  data?: Record<string | number | symbol, unknown> | unknown[],
): void => log(LOG_LEVEL.ERROR, msg, data);
export const logEmergency = (
  msg: string,
  data?: Record<string | number | symbol, unknown> | unknown[],
): void => {
  log(LOG_LEVEL.EMERGENCY, `🚨 EMERGENCY: ${msg}`, data);
};
