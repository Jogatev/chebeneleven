"use strict";
exports.__esModule = true;
exports.DB_CONNECTION_STRING = exports.DB_TYPE = void 0;
exports.DB_TYPE = process.env.DB_TYPE || 'memory'; // 'memory' or 'postgres'
exports.DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING || 'postgresql://postgres:putobonbon@localhost:5432/seven_eleven_careers';
