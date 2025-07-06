import { bigint, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

// Define the organization schema based on migration file
export const organization = pgTable('organization', {
  id: text('id').primaryKey().notNull(),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  stripeSubscriptionPriceId: text('stripe_subscription_price_id'),
  stripeSubscriptionStatus: text('stripe_subscription_status'),
  stripeSubscriptionCurrentPeriodEnd: bigint('stripe_subscription_current_period_end', { mode: 'number' }),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    stripeCustomerIdIdx: uniqueIndex('stripe_customer_id_idx').on(table.stripeCustomerId),
  };
});
