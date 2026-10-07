const db = require('../config/database');

// GET: Mengambil semua data kamar
const getAllRooms = async (req, res) => {
    try {
        // Mengurutkan descending berdasarkan Kamar_ID agar data terbaru di atas
        const [rows] = await db.query('SELECT * FROM `KAMAR` ORDER BY Kamar_ID DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// GET: Mengambil satu kamar berdasarkan ID
const getRoomById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM `KAMAR` WHERE Kamar_ID = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Kamar tidak ditemukan' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// POST: Menambahkan kamar baru
const createRoom = async (req, res) => {
    try {
        const { No_Kamar, Harga, Lantai, Status_Ketersediaan, Tipe_Kamar } = req.body;
        
        // Validasi input dari sisi backend
        if (!No_Kamar || Harga === undefined || Lantai === undefined || !Status_Ketersediaan || !Tipe_Kamar) {
            return res.status(400).json({ message: 'Mohon Lengkapi Data' });
        }

        const [result] = await db.query(
            'INSERT INTO `KAMAR` (No_Kamar, Harga, Lantai, Status_Ketersediaan, Tipe_Kamar) VALUES (?, ?, ?, ?, ?)',
            [No_Kamar, Harga, Lantai, Status_Ketersediaan, Tipe_Kamar]
        );
        
        res.status(201).json({ message: 'Data Berhasil Ditambahkan / Diedit' });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// PUT: Mengedit kamar
const updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const { No_Kamar, Harga, Lantai, Status_Ketersediaan, Tipe_Kamar } = req.body;

        if (!No_Kamar || Harga === undefined || Lantai === undefined || !Status_Ketersediaan || !Tipe_Kamar) {
            return res.status(400).json({ message: 'Mohon Lengkapi Data' });
        }

        const [result] = await db.query(
            'UPDATE `KAMAR` SET No_Kamar = ?, Harga = ?, Lantai = ?, Status_Ketersediaan = ?, Tipe_Kamar = ? WHERE Kamar_ID = ?',
            [No_Kamar, Harga, Lantai, Status_Ketersediaan, Tipe_Kamar, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Kamar tidak ditemukan' });
        }

        res.json({ message: 'Data Berhasil Ditambahkan / Diedit' });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// DELETE: Menghapus kamar
const deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query('DELETE FROM `KAMAR` WHERE Kamar_ID = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Kamar tidak ditemukan' });
        }

        res.json({ message: 'Data Berhasil Dihapus' });
    } catch (error) {
        // ER_ROW_IS_REFERENCED_2 adalah kode error MySQL ketika ada constraint Foreign Key yang menghalangi delete
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ message: 'Kamar Tidak Dapat Dihapus Karena Masih Memiliki Data Terkait.' });
        }
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

module.exports = {
    getAllRooms,
    getRoomById,
    createRoom,
    updateRoom,
    deleteRoom
};