const getAllTenants = async (req, res) => {
    try {
        const query = `
            SELECT p.Penyewa_ID, p.Nama_Lengkap, p.No_Hp, 
                   s.Sewa_ID, s.Status_Sewa, s.Tgl_Masuk, s.Tgl_Keluar, 
                   k.No_Kamar, p.Kamar_ID
            FROM \`penyewa\` p
            JOIN \`sewa\` s ON p.Penyewa_ID = s.Penyewa_ID
            JOIN \`kamar\` k ON p.Kamar_ID = k.Kamar_ID
            ORDER BY p.Penyewa_ID DESC
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// GET: Mengambil satu penyewa berdasarkan ID
const getTenantById = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT p.Penyewa_ID, p.Nama_Lengkap, p.No_Hp, p.Kamar_ID,
                   s.Sewa_ID, s.Status_Sewa, s.Tgl_Masuk, s.Tgl_Keluar
            FROM \`penyewa\` p
            JOIN \`sewa\` s ON p.Penyewa_ID = s.Penyewa_ID
            WHERE p.Penyewa_ID = ?
        `;
        const [rows] = await db.query(query, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Data penyewa tidak ditemukan' });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// POST: Menambahkan penyewa baru
const createTenant = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { Nama_Lengkap, No_Hp, Tgl_Masuk, Tgl_Keluar, Kamar_ID, Status_Sewa } = req.body;
        
        if (!Nama_Lengkap || !No_Hp || !Tgl_Masuk || !Tgl_Keluar || !Kamar_ID || !Status_Sewa) {
            return res.status(400).json({ message: 'Mohon Lengkapi Data' });
        }

        await connection.beginTransaction();

        const [penyewaResult] = await connection.query(
            'INSERT INTO \`penyewa\` (Nama_Lengkap, No_Hp, Kamar_ID) VALUES (?, ?, ?)',
            [Nama_Lengkap, No_Hp, Kamar_ID]
        );
        const newPenyewaId = penyewaResult.insertId;

        await connection.query(
            'INSERT INTO \`sewa\` (Status_Sewa, Tgl_Masuk, Tgl_Keluar, Penyewa_ID, Kamar_ID) VALUES (?, ?, ?, ?, ?)',
            [Status_Sewa, Tgl_Masuk, Tgl_Keluar, newPenyewaId, Kamar_ID]
        );

        if (Status_Sewa === 'AKTIF') {
            await connection.query(
                'UPDATE \`kamar\` SET Status_Ketersediaan = "TERISI" WHERE Kamar_ID = ?',
                [Kamar_ID]
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'Data Berhasil Ditambahkan / Diedit' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
    } finally {
        connection.release();
    }
};

// PUT: Mengedit penyewa
const updateTenant = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { id } = req.params;
        const { Nama_Lengkap, No_Hp, Tgl_Masuk, Tgl_Keluar, Kamar_ID, Status_Sewa } = req.body;

        if (!Nama_Lengkap || !No_Hp || !Tgl_Masuk || !Tgl_Keluar || !Kamar_ID || !Status_Sewa) {
            return res.status(400).json({ message: 'Mohon Lengkapi Data' });
        }

        await connection.beginTransaction();

        await connection.query(
            'UPDATE \`penyewa\` SET Nama_Lengkap = ?, No_Hp = ?, Kamar_ID = ? WHERE Penyewa_ID = ?',
            [Nama_Lengkap, No_Hp, Kamar_ID, id]
        );

        await connection.query(
            'UPDATE \`sewa\` SET Status_Sewa = ?, Tgl_Masuk = ?, Tgl_Keluar = ?, Kamar_ID = ? WHERE Penyewa_ID = ?',
            [Status_Sewa, Tgl_Masuk, Tgl_Keluar, Kamar_ID, id]
        );

        if (Status_Sewa === 'AKTIF') {
            await connection.query(
                'UPDATE \`kamar\` SET Status_Ketersediaan = "TERISI" WHERE Kamar_ID = ?',
                [Kamar_ID]
            );
        }

        await connection.commit();
        res.json({ message: 'Data Berhasil Ditambahkan / Diedit' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
    } finally {
        connection.release();
    }
};

// DELETE: Menghapus penyewa
const deleteTenant = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { id } = req.params;
        
        await connection.beginTransaction();
        
        await connection.query('DELETE FROM \`sewa\` WHERE Penyewa_ID = ?', [id]);
        const [result] = await connection.query('DELETE FROM \`penyewa\` WHERE Penyewa_ID = ?', [id]);
        
        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Penyewa tidak ditemukan' });
        }

        await connection.commit();
        res.json({ message: 'Data Berhasil Dihapus' });
    } catch (error) {
        await connection.rollback();
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ message: 'Data Tidak Dapat Dihapus Karena Masih Memiliki Data Terkait.' });
        }
        res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
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