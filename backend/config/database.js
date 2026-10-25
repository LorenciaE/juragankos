
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    ssl: {
        rejectUnauthorized: false
    },

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test koneksi
pool.getConnection()
    .then((connection) => {
        console.log('Database terhubung dengan sukses!');
        connection.release();
    })
    .catch((err) => {
        console.error('Error saat menghubungkan ke database:', err.message);
    });

module.exports = pool;
