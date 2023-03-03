import { turnOffFailsafe, turnOnFailsafe } from '../actions/failsafe';
import { Store } from '../store';
import { blurAxios } from '../utils/axios';
import { blurRateLimit } from '../utils/rateLimit';

export const healthCheck = async (store: Store): Promise<void> => {
  await blurRateLimit();

  try {
    await blurAxios.get('/bids', {
      params: {
        take: 1,
        from: 0,
      },
    });

    turnOffFailsafe('blurApiDown');
  } catch (err) {
    turnOnFailsafe(store, 'blurApiDown', err instanceof Error ? err.message : 'Unknown error');
  }
};
