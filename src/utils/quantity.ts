const quantityLimit = 70;

export const getQuantity = (
  balance: number,
  price: number,
  useMaxQuantity: boolean,
  maxQuantity: number,
): number[] => {
  if (!useMaxQuantity) return [1];

  const quantity = Math.floor(balance / price);

  const cappedQuantity = maxQuantity > 0 ? Math.min(quantity, maxQuantity) : quantity;

  const fullSize = Math.floor(cappedQuantity / quantityLimit);

  const alLQuantity = Array(fullSize).fill(quantityLimit);

  const remaining = cappedQuantity - fullSize * quantityLimit;
  if (remaining > 0) {
    alLQuantity.push(remaining);
  }

  return alLQuantity;
};
