const db = require('../config/database');

// GET: Mengambil daftar pembayaran beserta informasi kamar
const getAllPayments = async (req, res) => {
    try {
        const query = `
            SELECT p.*, k.No_Kamar, k.Harga 
            FROM \`pembayaran\` p
            JOIN \`kamar\` k ON p.Kamar_ID = k.Kamar_ID
            ORDER BY p.Pembayaran_ID DESC
        `;

        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
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

        const [rows] = await db.query(
            'SELECT * FROM `pembayaran` WHERE Pembayaran_ID = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: 'Data pembayaran tidak ditemukan'
            });
        }

        res.json(rows[0]);
    } catch (error) {
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

        // Validasi
        if (
            !Bulan_Pembayaran ||
            !Tgl_Pembayaran ||
            !Status_Pembayaran ||
            !Metode_Pembayaran ||
            Nominal === undefined ||
            !Sewa_ID ||
            !Kamar_ID
        ) {
            return res.status(400).json({
                message: 'Mohon Lengkapi Data'
            });
        }

        await db.query(
            'INSERT INTO `pembayaran` (Bulan_Pembayaran, Tgl_Pembayaran, Status_Pembayaran, Metode_Pembayaran, Nominal, Sewa_ID, Kamar_ID) VALUES (?, ?, ?, ?, ?, ?, ?)',
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
            message: 'Data Berhasil Ditambahkan / Diedit'
        });
    } catch (error) {
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
            !Sewa_ID ||
            !Kamar_ID
        ) {
            return res.status(400).json({
                message: 'Mohon Lengkapi Data'
            });
        }

        const [result] = await db.query(
            'UPDATE `pembayaran` SET Bulan_Pembayaran = ?, Tgl_Pembayaran = ?, Status_Pembayaran = ?, Metode_Pembayaran = ?, Nominal = ?, Sewa_ID = ?, Kamar_ID = ? WHERE Pembayaran_ID = ?',
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

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Data pembayaran tidak ditemukan'
            });
        }

        res.json({
            message: 'Data Berhasil Ditambahkan / Diedit'
        });
    } catch (error) {
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

        const [result] = await db.query(
            'DELETE FROM `pembayaran` WHERE Pembayaran_ID = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Data pembayaran tidak ditemukan'
            });
        }

        res.json({
            message: 'Data Berhasil Dihapus'
        });
    } catch (error) {
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