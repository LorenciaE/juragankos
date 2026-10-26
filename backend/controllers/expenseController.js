
const db = require('../config/database');

// GET: Mengambil semua pengeluaran beserta nomor kamar
const getAllExpenses = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT p.*, k.no_kamar
            FROM defaultdb.pengeluaran p
            LEFT JOIN defaultdb.kamar k
                ON p.kamar_id = k.kamar_id
            ORDER BY p.pengeluaran_id DESC
        `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error getAllExpenses:', error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan pada server',
            error: error.message
        });
    }
};

// GET: Mengambil satu pengeluaran berdasarkan ID
const getExpenseById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            `SELECT *
             FROM defaultdb.pengeluaran
             WHERE pengeluaran_id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Data pengeluaran tidak ditemukan'
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error getExpenseById:', error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan pada server',
            error: error.message
        });
    }
};

// POST: Menambahkan pengeluaran baru
const createExpense = async (req, res) => {
    try {
        const {
            Tgl_Pengeluaran,
            Kategori,
            Nominal,
            Deskripsi,
            Kamar_ID
        } = req.body;

        if (
            !Tgl_Pengeluaran ||
            !Kategori ||
            Nominal === undefined ||
            Nominal === null
        ) {
            return res.status(400).json({
                message: 'Mohon Lengkapi Data Wajib'
            });
        }

        const valDeskripsi = Deskripsi || null;
        const valKamarId =
            Kamar_ID === undefined || Kamar_ID === ''
                ? null
                : Kamar_ID;

        await db.query(
            `INSERT INTO defaultdb.pengeluaran
                (kategori, deskripsi, tgl_pengeluaran, nominal, kamar_id)
             VALUES ($1, $2, $3, $4, $5)`,
            [
                Kategori,
                valDeskripsi,
                Tgl_Pengeluaran,
                Nominal,
                valKamarId
            ]
        );

        res.status(201).json({
            message: 'Data Berhasil Ditambahkan'
        });
    } catch (error) {
        console.error('Error createExpense:', error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan pada server',
            error: error.message
        });
    }
};

// PUT: Mengedit pengeluaran
const updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            Tgl_Pengeluaran,
            Kategori,
            Nominal,
            Deskripsi,
            Kamar_ID
        } = req.body;

        if (
            !Tgl_Pengeluaran ||
            !Kategori ||
            Nominal === undefined ||
            Nominal === null
        ) {
            return res.status(400).json({
                message: 'Mohon Lengkapi Data Wajib'
            });
        }

        const valDeskripsi = Deskripsi || null;
        const valKamarId =
            Kamar_ID === undefined || Kamar_ID === ''
                ? null
                : Kamar_ID;

        const result = await db.query(
            `UPDATE defaultdb.pengeluaran
             SET kategori = $1,
                 deskripsi = $2,
                 tgl_pengeluaran = $3,
                 nominal = $4,
                 kamar_id = $5
             WHERE pengeluaran_id = $6`,
            [
                Kategori,
                valDeskripsi,
                Tgl_Pengeluaran,
                Nominal,
                valKamarId,
                id
            ]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: 'Data pengeluaran tidak ditemukan'
            });
        }

        res.json({
            message: 'Data Berhasil Diedit'
        });
    } catch (error) {
        console.error('Error updateExpense:', error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan pada server',
            error: error.message
        });
    }
};

// DELETE: Menghapus pengeluaran
const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            `DELETE FROM defaultdb.pengeluaran
             WHERE pengeluaran_id = $1`,
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: 'Data pengeluaran tidak ditemukan'
            });
        }

        res.json({
            message: 'Data Berhasil Dihapus'
        });
    } catch (error) {
        console.error('Error deleteExpense:', error.message);

        if (error.code === '23503') {
            return res.status(400).json({
                message: 'Data pengeluaran tidak dapat dihapus karena masih memiliki data terkait.'
            });
        }

        res.status(500).json({
            message: 'Terjadi kesalahan pada server',
            error: error.message
        });
    }
};

module.exports = {
    getAllExpenses,
    getExpenseById,
    createExpense,
    updateExpense,
    deleteExpense
};
