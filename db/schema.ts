import { createId } from "@paralleldrive/cuid2";
import { integer, sqliteTable, text, } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

export const customersTable = sqliteTable("customers", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull(),
  company: text("company").notNull(),
  villa: text("villa"),
  telephone: text("telephone"),
  subscription: integer("subscription").notNull(),
  subscriptionDate: text("subscription_date").notNull(),
  renewalDate: text("renewal_date").notNull(),
  enabled: integer("enabled").default(1).notNull(),
});

export const CustomerSchema = createSelectSchema(customersTable);
export type Customer = z.infer<typeof CustomerSchema>;

export const companiesTable = sqliteTable("companies", {
  id: text("id")
    .$defaultFn(() => createId())
    .notNull(),
  name: text("company").notNull(),
});

export const CompanySchema = createSelectSchema(companiesTable);
export type Company = z.infer<typeof CompanySchema>;
