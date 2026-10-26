
const db = require('../config/database');

// GET: Mengambil daftar pembayaran beserta informasi kamar
const getAllPayments = async (req, res) => {
    try {
        const query = `
            SELECT
                p.*,
                k.no_kamar,
                k.harga
            FROM defaultdb.pembayaran p
            JOIN defaultdb.kamar k
                ON p.kamar_id = k.kamar_id
            ORDER BY p.pembayaran_id DESC
        `;

        const result = await db.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error getAllPayments:', error);
        res.status(500).json({
            message: 'Terjadi kesalahan pada server',
            error: error.message
        });
    }
};

// GET: Mengambil satu pembayaran berdasarkan ID
const getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            `SELECT *
             FROM defaultdb.pembayaran
             WHERE pembayaran_id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Data pembayaran tidak ditemukan'
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error getPaymentById:', error);
        res.status(500).json({
            message: 'Terjadi kesalahan pada server',
            error: error.message
        });
    }
};

// POST: Menambahkan data pembayaran baru
const createPayment = async (req, res) => {
    try {
        const {
            Bulan_Pembayaran,
            Tgl_Pembayaran,
            Status_Pembayaran,
            Metode_Pembayaran,
            Nominal,
            Sewa_ID,
            Kamar_ID
        } = req.body;

        if (
            !Bulan_Pembayaran ||
            !Tgl_Pembayaran ||
            !Status_Pembayaran ||
            !Metode_Pembayaran ||
            Nominal === undefined ||
            Nominal === null ||
            !Sewa_ID ||
            !Kamar_ID
        ) {
            return res.status(400).json({
                message: 'Mohon Lengkapi Data'
            });
        }

        const result = await db.query(
            `INSERT INTO defaultdb.pembayaran (
                bulan_pembayaran,
                tgl_pembayaran,
                status_pembayaran,
                metode_pembayaran,
                nominal,
                sewa_id,
                kamar_id
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING pembayaran_id`,
            [
                Bulan_Pembayaran,
                Tgl_Pembayaran,
                Status_Pembayaran,
                Metode_Pembayaran,
                Nominal,
                Sewa_ID,
                Kamar_ID
            ]
        );

        res.status(201).json({
            message: 'Data Berhasil Ditambahkan',
            pembayaran_id: result.rows[0].pembayaran_id
        });
    } catch (error) {
        console.error('Error createPayment:', error);

        if (error.code === '23503') {
            return res.status(400).json({
                message: 'Data sewa atau kamar tidak ditemukan'
            });
        }

        res.status(500).json({
            message: 'Terjadi kesalahan pada server',
            error: error.message
        });
    }
};

// PUT: Mengedit data pembayaran
const updatePayment = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            Bulan_Pembayaran,
            Tgl_Pembayaran,
            Status_Pembayaran,
            Metode_Pembayaran,
            Nominal,
            Sewa_ID,
            Kamar_ID
        } = req.body;

        if (
            !Bulan_Pembayaran ||
            !Tgl_Pembayaran ||
            !Status_Pembayaran ||
            !Metode_Pembayaran ||
            Nominal === undefined ||
            Nominal === null ||
            !Sewa_ID ||
            !Kamar_ID
        ) {
            return res.status(400).json({
                message: 'Mohon Lengkapi Data'
            });
        }

        const result = await db.query(
            `UPDATE defaultdb.pembayaran
             SET bulan_pembayaran = $1,
                 tgl_pembayaran = $2,
                 status_pembayaran = $3,
                 metode_pembayaran = $4,
                 nominal = $5,
                 sewa_id = $6,
                 kamar_id = $7
             WHERE pembayaran_id = $8`,
            [
                Bulan_Pembayaran,
                Tgl_Pembayaran,
                Status_Pembayaran,
                Metode_Pembayaran,
                Nominal,
                Sewa_ID,
                Kamar_ID,
                id
            ]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: 'Data pembayaran tidak ditemukan'
            });
        }

        res.json({
            message: 'Data Berhasil Diedit'
        });
    } catch (error) {
        console.error('Error updatePayment:', error);

        if (error.code === '23503') {
            return res.status(400).json({
                message: 'Data sewa atau kamar tidak ditemukan'
            });
        }

        res.status(500).json({
            message: 'Terjadi kesalahan pada server',
            error: error.message
        });
    }
};

// DELETE: Menghapus data pembayaran
const deletePayment = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            `DELETE FROM defaultdb.pembayaran
             WHERE pembayaran_id = $1`,
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: 'Data pembayaran tidak ditemukan'
            });
        }

        res.json({
            message: 'Data Berhasil Dihapus'
        });
    } catch (error) {
        console.error('Error deletePayment:', error);

        if (error.code === '23503') {
            return res.status(400).json({
                message: 'Pembayaran tidak dapat dihapus karena masih digunakan oleh data lain'
            });
        }

        res.status(500).json({
            message: 'Terjadi kesalahan pada server',
            error: error.message
        });
    }
};

module.exports = {
    getAllPayments,
    getPaymentById,
    createPayment,
    updatePayment,
    deletePayment
};
