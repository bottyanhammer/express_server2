import mysql from 'mysql2/promise';
import 'dotenv/config';

export const pool = mysql.createPool({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3307),
    user: process.env.DB_USER ?? 'appuser',
    password: process.env.DB_PASSWORD ?? '123',
    database: process.env.DB_DATABASE ?? 'userdb',
    waitForConnections: true,
    connectionLimit: 10,
})