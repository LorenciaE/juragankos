const db = require('../config/database');

// GET: Mengambil semua data pengeluaran (dengan JOIN ke tabel kamar untuk mengambil No_Kamar)
const getAllExpenses = async (req, res) => {
    try {
        const query = `
            SELECT p.*, k.No_Kamar 
            FROM \`pengeluaran\` p
            LEFT JOIN \`kamar\` k ON p.Kamar_ID = k.Kamar_ID
            ORDER BY p.Pengeluaran_ID DESC
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

// GET: Mengambil satu pengeluaran berdasarkan ID
const getExpenseById = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query(
            'SELECT * FROM `pengeluaran` WHERE Pengeluaran_ID = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: 'Data pengeluaran tidak ditemukan'
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

// POST: Menambahkan pengeluaran baru
const createExpense = async (req, res) => {
    try {
        const { Tgl_Pengeluaran, Kategori, Nominal, Deskripsi, Kamar_ID } = req.body;

        // VALIDASI: Deskripsi dan Kamar_ID dihapus dari pengecekan agar opsional
        if (!Tgl_Pengeluaran || !Kategori || Nominal === undefined) {
            return res.status(400).json({ message: 'Mohon Lengkapi Data Wajib' });
        }

        // Set ke null jika data kosong (mencegah error dari MySQL)
        const valDeskripsi = Deskripsi || null;
        const valKamarId = Kamar_ID || null;

        await db.query(
            'INSERT INTO `pengeluaran` (Kategori, Deskripsi, Tgl_Pengeluaran, Nominal, Kamar_ID) VALUES (?, ?, ?, ?, ?)',
            [Kategori, valDeskripsi, Tgl_Pengeluaran, Nominal, valKamarId]
        );

        res.status(201).json({ message: 'Data Berhasil Ditambahkan' });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// PUT: Mengedit pengeluaran
const updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const { Tgl_Pengeluaran, Kategori, Nominal, Deskripsi, Kamar_ID } = req.body;

        // VALIDASI: Samakan dengan create, jadikan Deskripsi & Kamar_ID opsional
        if (!Tgl_Pengeluaran || !Kategori || Nominal === undefined) {
            return res.status(400).json({ message: 'Mohon Lengkapi Data Wajib' });
        }

        // Set ke null jika data kosong
        const valDeskripsi = Deskripsi || null;
        const valKamarId = Kamar_ID || null;

        const [result] = await db.query(
            'UPDATE `pengeluaran` SET Kategori = ?, Deskripsi = ?, Tgl_Pengeluaran = ?, Nominal = ?, Kamar_ID = ? WHERE Pengeluaran_ID = ?',
            [Kategori, valDeskripsi, Tgl_Pengeluaran, Nominal, valKamarId, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Data pengeluaran tidak ditemukan' });
        }

        res.json({ message: 'Data Berhasil Diedit' });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// DELETE: Menghapus pengeluaran
const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(
            'DELETE FROM `pengeluaran` WHERE Pengeluaran_ID = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: 'Data pengeluaran tidak ditemukan'
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
    getAllExpenses,
    getExpenseById,
    createExpense,
    updateExpense,
    deleteExpense
};