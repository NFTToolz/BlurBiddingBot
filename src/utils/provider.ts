import { Contract, ethers, Wallet } from 'ethers';

import { infuraKeyEnv, privateKeysEnv } from './flags';

export const provider = new ethers.providers.InfuraProvider('homestead', infuraKeyEnv);

export const getSigners = async (): Promise<[string, Wallet][]> => {
  const privateKeys = privateKeysEnv.split(',');

  const signers: [string, Wallet][] = [];
  const promises: Promise<unknown>[] = [];

  privateKeys.forEach((key) => {
    const signer = new ethers.Wallet(key, provider);
    const promise = signer.getAddress().then((address) => {
      signers.push([address.toLowerCase(), signer]);
    });

    promises.push(promise);
  });

  await Promise.all(promises);

  return signers;
};

export const blurContract = new Contract(
  '0x0000000000A39bb272e79075ade125fd351887Ac',
  [
    {
      inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ],
  provider,
);
