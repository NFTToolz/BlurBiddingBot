import axios from 'axios';

import { discordHookEnv } from './flags';

export const sendMessage = async (message: string): Promise<void> => {
  if (!discordHookEnv) return;
  await axios.post(discordHookEnv, {
    content: message,
  });
};

export const sendFormattedMessage = async (
  topic: string,
  message: string,
  mention = true,
): Promise<void> => {
  await sendMessage(`${mention ? '@here ' : ''}[${topic}]: ${message}`);
};
