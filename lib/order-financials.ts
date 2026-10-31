// Reject incomplete ledger rows instead of treating missing revenue as a discount.
export function orderFinancialIssues(order: {
  grandTotal?: unknown; subtotalProducts?: unknown; originalShipping?: unknown;
  customerShippingFee?: unknown; shippingSubsidy?: unknown;
}) {
  const issues: string[] = [];
  const fields = ['grandTotal', 'subtotalProducts', 'originalShipping', 'customerShippingFee', 'shippingSubsidy'] as const;
  for (const key of fields) {
    const value = order[key];
    if (value === undefined || value === null || value === '' || typeof value === 'boolean' ||
        !Number.isFinite(Number(value)) || Number(value) < 0 || Number(value) > Number.MAX_SAFE_INTEGER) {
      issues.push(key);
    }
  }
  const grand = Number(order.grandTotal), subtotal = Number(order.subtotalProducts);
  const fee = Number(order.customerShippingFee), original = Number(order.originalShipping), subsidy = Number(order.shippingSubsidy);
  if (grand === 0 && subtotal === 0) issues.push('emptyRevenue');
  if (Math.abs(grand - subtotal - fee) > 1) issues.push('totalMismatch');
  if (Math.abs(original - fee - subsidy) > 1) issues.push('shippingMismatch');
  return issues;
}
