
const db = require('../config/database');

// GET: Mengambil semua data penyewa beserta informasi sewa dan kamar
const getAllTenants = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                p.penyewa_id,
                p.nama_lengkap,
                p.no_hp,
                s.sewa_id,
                s.status_sewa,
                s.tgl_masuk,
                s.tgl_keluar,
                k.no_kamar,
                p.kamar_id
            FROM defaultdb.penyewa p
            JOIN defaultdb.sewa s
                ON p.penyewa_id = s.penyewa_id
            JOIN defaultdb.kamar k
                ON p.kamar_id = k.kamar_id
            ORDER BY p.penyewa_id DESC
        `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error getAllTenants:', error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan pada server',
            error: error.message
        });
    }
};

// GET: Mengambil satu penyewa berdasarkan ID
const getTenantById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            `SELECT
                p.penyewa_id,
                p.nama_lengkap,
                p.no_hp,
                p.kamar_id,
                s.sewa_id,
                s.status_sewa,
                s.tgl_masuk,
                s.tgl_keluar
             FROM defaultdb.penyewa p
             JOIN defaultdb.sewa s
                ON p.penyewa_id = s.penyewa_id
             WHERE p.penyewa_id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Data penyewa tidak ditemukan'
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error getTenantById:', error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan pada server',
            error: error.message
        });
    }
};

// POST: Menambahkan penyewa baru beserta data sewanya
const createTenant = async (req, res) => {
    const connection = await db.connect();

    try {
        const {
            Nama_Lengkap,
            No_Hp,
            Tgl_Masuk,
            Tgl_Keluar,
            Kamar_ID,
            Status_Sewa
        } = req.body;

        if (
            !Nama_Lengkap ||
            !No_Hp ||
            !Tgl_Masuk ||
            !Kamar_ID ||
            !Status_Sewa
        ) {
            return res.status(400).json({
                message: 'Mohon Lengkapi Data'
            });
        }

        await connection.query('BEGIN');

        // Pastikan kamar yang dipilih tersedia
        const roomResult = await connection.query(
            `SELECT kamar_id, status_ketersediaan
             FROM defaultdb.kamar
             WHERE kamar_id = $1
             FOR UPDATE`,
            [Kamar_ID]
        );

        const tenantResult = await connection.query(
            `INSERT INTO defaultdb.penyewa
                (nama_lengkap, no_hp, kamar_id)
             VALUES ($1, $2, $3)
             RETURNING penyewa_id`,
            [Nama_Lengkap, No_Hp, Kamar_ID]
        );

        const newTenantId = tenantResult.rows[0].penyewa_id;

        await connection.query(
            `INSERT INTO defaultdb.sewa
                (status_sewa, tgl_masuk, tgl_keluar, penyewa_id, kamar_id)
             VALUES ($1, $2, $3, $4, $5)`,
            [
                Status_Sewa,
                Tgl_Masuk,
                Tgl_Keluar || null,
                newTenantId,
                Kamar_ID
            ]
        );

        if (Status_Sewa === 'AKTIF') {
            await connection.query(
                `UPDATE defaultdb.kamar
                 SET status_ketersediaan = 'TERISI'
                 WHERE kamar_id = $1`,
                [Kamar_ID]
            );
        }

        await connection.query('COMMIT');

        res.status(201).json({
            message: 'Data Berhasil Ditambahkan'
        });
    } catch (error) {
        await connection.query('ROLLBACK');

        console.error('Error createTenant:', error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// PUT: Mengedit data penyewa dan sewanya
const updateTenant = async (req, res) => {
    const connection = await db.connect();

    try {
        const { id } = req.params;

        const {
            Nama_Lengkap,
            No_Hp,
            Tgl_Masuk,
            Tgl_Keluar,
            Kamar_ID,
            Status_Sewa
        } = req.body;

        if (
            !Nama_Lengkap ||
            !No_Hp ||
            !Tgl_Masuk ||
            !Kamar_ID ||
            !Status_Sewa
        ) {
            return res.status(400).json({
                message: 'Mohon Lengkapi Data'
            });
        }

        await connection.query('BEGIN');

        const oldTenantResult = await connection.query(
            `SELECT kamar_id
             FROM defaultdb.penyewa
             WHERE penyewa_id = $1
             FOR UPDATE`,
            [id]
        );

        const oldRoomId = oldTenantResult.rows[0].kamar_id;

        // Pastikan kamar tujuan ada
        const roomResult = await connection.query(
            `SELECT kamar_id, status_ketersediaan
             FROM defaultdb.kamar
             WHERE kamar_id = $1
             FOR UPDATE`,
            [Kamar_ID]
        );

        await connection.query(
            `UPDATE defaultdb.penyewa
             SET nama_lengkap = $1,
                 no_hp = $2,
                 kamar_id = $3
             WHERE penyewa_id = $4`,
            [Nama_Lengkap, No_Hp, Kamar_ID, id]
        );

        const leaseResult = await connection.query(
            `UPDATE defaultdb.sewa
             SET status_sewa = $1,
                 tgl_masuk = $2,
                 tgl_keluar = $3,
                 kamar_id = $4
             WHERE penyewa_id = $5`,
            [
                Status_Sewa,
                Tgl_Masuk,
                Tgl_Keluar || null,
                Kamar_ID,
                id
            ]
        );

        // Perbarui kamar lama jika penyewa pindah kamar
        if (String(oldRoomId) !== String(Kamar_ID)) {
            const oldActiveLease = await connection.query(
                `SELECT 1
                 FROM defaultdb.sewa
                 WHERE kamar_id = $1
                   AND status_sewa = 'AKTIF'
                 LIMIT 1`,
                [oldRoomId]
            );

            await connection.query(
                `UPDATE defaultdb.kamar
                 SET status_ketersediaan = $1
                 WHERE kamar_id = $2`,
                [
                    oldActiveLease.rows.length > 0 ? 'TERISI' : 'KOSONG',
                    oldRoomId
                ]
            );
        }

        // Perbarui kamar tujuan
        if (Status_Sewa === 'AKTIF') {
            await connection.query(
                `UPDATE defaultdb.kamar
                 SET status_ketersediaan = 'TERISI'
                 WHERE kamar_id = $1`,
                [Kamar_ID]
            );
        } else {
            const otherActiveLease = await connection.query(
                `SELECT 1
                 FROM defaultdb.sewa
                 WHERE kamar_id = $1
                   AND status_sewa = 'AKTIF'
                   AND penyewa_id <> $2
                 LIMIT 1`,
                [Kamar_ID, id]
            );

            await connection.query(
                `UPDATE defaultdb.kamar
                 SET status_ketersediaan = $1
                 WHERE kamar_id = $2`,
                [
                    otherActiveLease.rows.length > 0 ? 'TERISI' : 'KOSONG',
                    Kamar_ID
                ]
            );
        }

        await connection.query('COMMIT');

        res.json({
            message: 'Data Berhasil Diedit'
        });
    } catch (error) {
        await connection.query('ROLLBACK');

        console.error('Error updateTenant:', error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// DELETE: Menghapus penyewa dan data sewanya
const deleteTenant = async (req, res) => {
    const connection = await db.connect();

    try {
        const { id } = req.params;

        await connection.query('BEGIN');

        const tenantResult = await connection.query(
            `SELECT kamar_id
             FROM defaultdb.penyewa
             WHERE penyewa_id = $1
             FOR UPDATE`,
            [id]
        );

        const roomId = tenantResult.rows[0].kamar_id;

        // Hapus sewa terlebih dahulu
        await connection.query(
            `DELETE FROM defaultdb.sewa
             WHERE penyewa_id = $1`,
            [id]
        );

        await connection.query(
            `DELETE FROM defaultdb.penyewa
             WHERE penyewa_id = $1`,
            [id]
        );

        // Kamar tetap terisi jika masih memiliki sewa aktif lain
        const activeLeaseResult = await connection.query(
            `SELECT 1
             FROM defaultdb.sewa
             WHERE kamar_id = $1
               AND status_sewa = 'AKTIF'
             LIMIT 1`,
            [roomId]
        );

        await connection.query(
            `UPDATE defaultdb.kamar
             SET status_ketersediaan = $1
             WHERE kamar_id = $2`,
            [
                activeLeaseResult.rows.length > 0 ? 'TERISI' : 'KOSONG',
                roomId
            ]
        );

        await connection.query('COMMIT');

        res.json({
            message: 'Data Berhasil Dihapus'
        });
    } catch (error) {
        await connection.query('ROLLBACK');

        console.error('Error deleteTenant:', error.message);

        if (error.code === '23503') {
            return res.status(400).json({
                message: 'Data tidak dapat dihapus karena masih memiliki data terkait.'
            });
        }

        res.status(500).json({
            message: 'Terjadi kesalahan',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

module.exports = {
    getAllTenants,
    getTenantById,
    createTenant,
    updateTenant,
    deleteTenant
};
