/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('transactions', (table) => {
    table.increments('id').primary();
    table.string('type').notNullable();
    table.integer('amount').notNullable();
    table.string('currency').notNullable();
    table.string('account_number').notNullable();
    table.string('bank_code').notNullable();
    table.string('token').notNullable();
    table.string('reference').notNullable();
    table.string('status').notNullable().defaultTo('pending');
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('id').inTable('users');
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('transactions');
};
