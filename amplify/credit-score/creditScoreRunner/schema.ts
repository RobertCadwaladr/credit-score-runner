import { bigint, boolean, index, numeric, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

/*********************************************************
 * Drizzle schema definition to integrate with this db.
 * Note: All constraints are not enforced below.
*********************************************************/
export const user_usermodel = pgTable('user_usermodel', {
	id: bigint('id', { mode: 'bigint' }),
	password: varchar('password', { length: 128 }).notNull(),
	last_login: timestamp('last_login', { withTimezone: true }),
	is_superuser: boolean('is_superuser').notNull(),
	first_name: varchar('first_name', { length: 150 }),
	last_name: varchar('last_name', { length: 150 }),
	is_staff: boolean('is_staff').notNull(),
	is_active: boolean('is_staff').notNull(),
	date_joined: timestamp('date_joined', { withTimezone: true }),
	created_at: timestamp('created_at', { withTimezone: true }),
	updated_at: timestamp('updated_at', { withTimezone: true }),
	deleted: boolean('deleted').notNull(),
	email: varchar('email', { length: 254 }).unique().notNull(),
	full_name: varchar('full_name', { length: 255 }),
	external_id: uuid('external_id').notNull()
})

export const user_plaid_details = pgTable('integration_plaiditem', {
	id: bigint('id', { mode: 'bigint' }),
	created_at: timestamp('created_at', { withTimezone: true }),
	updated_at: timestamp('updated_at', { withTimezone: true }),
	deleted: boolean('deleted'),
	item_id: varchar('item_it', { length: 255 }),
	access_token: varchar('access_token', { length: 255 }),
	transactions_cursor: varchar('transactions_cursor', { length: 255 }),
	user_id: bigint('user_id', { mode: 'bigint' }).references(() => user_usermodel.id)
});


export const credit_score = pgTable('credit_score', {
	id: bigint('id', { mode: 'bigint' }),
	user_external_id: uuid('user_external_id').notNull(),
	credit_score: numeric('balances__available', { precision: 19, scale: 4 }),
});