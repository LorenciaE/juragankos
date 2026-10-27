
const db = require('../config/database');

// GET: Mengambil semua data kamar
const getAllRooms = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM defaultdb.kamar ORDER BY kamar_id DESC'
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error getAllRooms:', error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan pada server',
            error: error.message
        });
    }
};

// GET: Mengambil satu kamar berdasarkan ID
const getRoomById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            'SELECT * FROM defaultdb.kamar WHERE kamar_id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Kamar tidak ditemukan'
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error getRoomById:', error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan pada server',
            error: error.message
        });
    }
};

// POST: Menambahkan kamar baru

 // POST: Menambahkan kamar baru
const createRoom = async (req, res) => {
    try {
        const {
            No_Kamar,
            Harga,
            Lantai,
            Status_Ketersediaan,
            Tipe_Kamar,
            user_id
        } = req.body;

        if (
            !No_Kamar ||
            Harga === undefined ||
            Harga === null ||
            Lantai === undefined ||
            Lantai === null ||
            !Status_Ketersediaan ||
            !Tipe_Kamar
        ) {
            return res.status(400).json({
                message: 'Mohon lengkapi data'
            });
        }

        await db.query(
            `INSERT INTO defaultdb.kamar
            (no_kamar, harga, lantai, status_ketersediaan, tipe_kamar, user_id)
            VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                No_Kamar,
                Harga,
                Lantai,
                Status_Ketersediaan,
                Tipe_Kamar,
                user_id ?? null
            ]
        );

        res.status(201).json({
            message: 'Data Berhasil Ditambahkan'
        });
    } catch (error) {
        console.error('Error createRoom:', error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan pada server',
            error: error.message
        });
    }
};


// PUT: Mengedit kamar

const updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            No_Kamar,
            Harga,
            Lantai,
            Status_Ketersediaan,
            Tipe_Kamar
        } = req.body;

        // Validasi ID kamar
        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                message: 'ID kamar tidak valid'
            });
        }

        // Validasi data kamar
        if (
            !No_Kamar ||
            !String(No_Kamar).trim() ||
            Harga === undefined ||
            Harga === null ||
            Harga === '' ||
            !Number.isFinite(Number(Harga)) ||
            Lantai === undefined ||
            Lantai === null ||
            Lantai === '' ||
            !Number.isFinite(Number(Lantai)) ||
            !Status_Ketersediaan ||
            !Tipe_Kamar
        ) {
            return res.status(400).json({
                message: 'Mohon lengkapi data'
            });
        }

        const result = await db.query(
            `UPDATE defaultdb.kamar
            SET no_kamar = $1,
                harga = $2,
                lantai = $3,
                status_ketersediaan = $4,
                tipe_kamar = $5
            WHERE kamar_id = $6`,
            [
                String(No_Kamar).trim(),
                Number(Harga),
                Number(Lantai),
                Status_Ketersediaan,
                Tipe_Kamar,
                id
            ]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: 'Kamar tidak ditemukan'
            });
        }

        return res.status(200).json({
            message: 'Data Berhasil Diedit'
        });

    } catch (error) {
        console.error('Error updateRoom:', error.message);

        return res.status(500).json({
            message: 'Terjadi kesalahan pada server',
            error: error.message
        });
    }
};


// DELETE: Menghapus kamar
const deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            'DELETE FROM defaultdb.kamar WHERE kamar_id = $1',
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: 'Kamar tidak ditemukan'
            });
        }

        res.json({
            message: 'Data Berhasil Dihapus'
        });
    } catch (error) {
        console.error('Error deleteRoom:', error.message);

        if (error.code === '23503') {
            return res.status(400).json({
                message: 'Kamar Tidak Dapat Dihapus Karena Masih Memiliki Data Terkait.'
            });
        }

        res.status(500).json({
            message: 'Terjadi kesalahan pada server',
            error: error.message
        });
    }
};

module.exports = {
    getAllRooms,
    getRoomById,
    createRoom,
    updateRoom,
    deleteRoom
};
