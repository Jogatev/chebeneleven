"use strict";
exports.__esModule = true;
exports.db = exports.DB_CONNECTION_STRING = void 0;
var postgres_js_1 = require("drizzle-orm/postgres-js");
var postgres_1 = require("postgres");
// Use the connection string directly here
exports.DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING || 'postgresql://neondb_owner:npg_eFrPutD1n9dE@ep-aged-darkness-a1bh7bgl-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
// Create a PostgreSQL client
var queryClient = postgres_1["default"](exports.DB_CONNECTION_STRING, {
    ssl: 'require',
    max: 10,
    idle_timeout: 20,
    connect_timeout: 30
});
// Create a Drizzle client using the PostgreSQL client
exports.db = postgres_js_1.drizzle(queryClient);
