
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    options: '-c search_path=defaultdb',

    ssl: {
        rejectUnauthorized: false
    },

    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
});


pool.query('SELECT NOW()')
    .then((result) => {
        console.log('Database Supabase PostgreSQL terhubung!');
        console.log('Waktu database:', result.rows[0].now);
    })
    .catch((err) => {
        console.error('Gagal menghubungkan ke Supabase.');
        console.error('Kode error:', err.code);
        console.error('Pesan:', err.message);
        console.error('Host:', process.env.DB_HOST);
        console.error('Port:', process.env.DB_PORT);
    });


module.exports = pool;
