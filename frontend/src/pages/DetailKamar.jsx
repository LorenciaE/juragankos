import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRoomById, getTenants, getExpenses } from '../services/api';

const DetailKamar = () => {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // State untuk Sorting Tabel
  const [sortTenant, setSortTenant] = useState({ key: null, direction: 'asc' });
  const [sortActivity, setSortActivity] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    const fetchDetailData = async () => {
      try {
        setLoading(true);
        // 1. Ambil data kamar
        const roomData = await getRoomById(id);
        setRoom(roomData);

        // 2. Ambil data penyewa, filter khusus kamar ini
        const allTenants = await getTenants();
        const roomTenants = allTenants.filter(t => t.Kamar_ID === parseInt(id));
        setTenants(roomTenants);

        // 3. Ambil data pengeluaran (sebagai Aktivitas Kamar), filter khusus kamar ini
        const allExpenses = await getExpenses();
        const roomExpenses = allExpenses.filter(e => e.Kamar_ID === parseInt(id));
        setActivities(roomExpenses);

        setLoading(false);
      } catch (err) {
        console.error("Gagal memuat detail kamar", err);
        setLoading(false);
      }
    };
    fetchDetailData();
  }, [id]);

  // Format Tanggal
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Masking Nomor HP
  const maskPhoneNumber = (phone) => {
    if (!phone) return '-';
    const phoneStr = phone.toString();
    if (phoneStr.length >= 8) {
      return phoneStr.slice(0, 4) + '****' + phoneStr.slice(-4);
    }
    return phoneStr;
  };

  // Sorting Logika: Riwayat Penyewa
  const processedTenants = useMemo(() => {
    let sortable = [...tenants];
    if (sortTenant.key !== null) {
      sortable.sort((a, b) => {
        if (a[sortTenant.key] < b[sortTenant.key]) return sortTenant.direction === 'asc' ? -1 : 1;
        if (a[sortTenant.key] > b[sortTenant.key]) return sortTenant.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [tenants, sortTenant]);

  const requestSortTenant = (key) => {
    let direction = 'asc';
    if (sortTenant.key === key && sortTenant.direction === 'asc') direction = 'desc';
    setSortTenant({ key, direction });
  };

  // Sorting Logika: Aktivitas Kamar
  const processedActivities = useMemo(() => {
    let sortable = [...activities];
    if (sortActivity.key !== null) {
      sortable.sort((a, b) => {
        if (a[sortActivity.key] < b[sortActivity.key]) return sortActivity.direction === 'asc' ? -1 : 1;
        if (a[sortActivity.key] > b[sortActivity.key]) return sortActivity.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [activities, sortActivity]);

  const requestSortActivity = (key) => {
    let direction = 'asc';
    if (sortActivity.key === key && sortActivity.direction === 'asc') direction = 'desc';
    setSortActivity({ key, direction });
  };

  // Styling Variables
  const cardStyle = { backgroundColor: '#fff', borderRadius: '4px', padding: '20px', marginBottom: '24px' };
  const labelStyle = { display: 'block', fontSize: '14px', color: '#4f575e', marginBottom: '8px', fontWeight: 'bold'};
  const readOnlyInputStyle = { width: '100%', height:'40px', padding: '0px 16px', backgroundColor: '#f9f9f9', border: '1px solid #e0e0e0', borderRadius: '4px', color: '#888', fontSize: '14px', outline: 'none', marginBottom: '10px' };
  const thStyle = { padding: '0px 24px', borderBottom: '1px solid #e0e0e0', fontWeight: 'bold', color: '#4f575e', fontSize: '14px', cursor: 'pointer', userSelect: 'none', textAlign: 'left', height: '48px' };
  const tdStyle = { padding: '8px 24px', borderBottom: '1px solid #e0e0e0', fontSize: '14px', color: '#272b30', height: '56px' };
  const cardTitleStyle = { fontSize: '18px', fontWeight: 'bold', color: '#222', marginBottom: '20px' };

  if (loading) return <p style={{ padding: '20px' }}>Memuat profil kamar...</p>;
  if (!room) return <p style={{ padding: '20px' }}>Data kamar tidak ditemukan.</p>;

  return (
    <div>
      
      {/* Header */}
      <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#111', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <Link to="/kamar" style={{ textDecoration: 'none', color: '#111', fontSize: '24px' }}><img src="/back.png" style={{width:'14px', height:'18px'}} /></Link> Profil Kamar
      </h2>

      {/* Bagian 1: Informasi Kamar */}
      <div style={cardStyle}>
        <h3 style={{...cardTitleStyle, margin: '0px 0px 10px'}}>Informasi Kamar</h3>
        
        <label style={labelStyle}>Nomor Kamar</label>
        <input type="text" value={room.No_Kamar} readOnly style={{...readOnlyInputStyle, backgroundColor:'#f1f3f5', color: '#adb5bd'}}  />

        <label style={labelStyle}>Lantai</label>
        <input type="text" value={room.Lantai} readOnly  style={{...readOnlyInputStyle, backgroundColor:'#f1f3f5', color: '#adb5bd'}}  />

        <label style={labelStyle}>Status Ketersediaan Kamar</label>
        <input type="text" value={room.Status_Ketersediaan} readOnly  style={{...readOnlyInputStyle, backgroundColor:'#f1f3f5', color: '#adb5bd'}}  />
      </div>

      {/* Bagian 2: Riwayat Penyewa */}
      <div style={cardStyle}>
        <h3 style={{...cardTitleStyle, marginBottom: '10px'}}>Riwayat Penyewa</h3>
        <div style={{ border: '1px solid #e6e6e6', borderRadius: '4px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th className="sortable-header" style={thStyle} onClick={() => requestSortTenant('Nama_Lengkap')}>Nama<img src="/sort.png" style={{width:'12px', height:'12px', marginLeft:'6px'}} /></th>
                <th className="sortable-header"style={thStyle} onClick={() => requestSortTenant('No_Hp')}>No Telepon<img src="/sort.png" style={{width:'12px', height:'12px', marginLeft:'6px'}} /></th>
                <th className="sortable-header" style={thStyle} onClick={() => requestSortTenant('Tgl_Masuk')}>Tanggal Masuk<img src="/sort.png" style={{width:'12px', height:'12px', marginLeft:'6px'}} /></th>
                <th className="sortable-header" style={thStyle} onClick={() => requestSortTenant('Tgl_Keluar')}>Tanggal Keluar<img src="/sort.png" style={{width:'12px', height:'12px', marginLeft:'6px'}} /></th>
                <th className="sortable-header" style={thStyle} onClick={() => requestSortTenant('Status_Sewa')}>Status Sewa<img src="/sort.png" style={{width:'12px', height:'12px', marginLeft:'6px'}} /></th>
              </tr>
            </thead>
            <tbody>
              {processedTenants.length === 0 ? (
                <tr><td colSpan="5" style={{ ...tdStyle, textAlign: 'center', color: '#777' }}>Tidak ada riwayat penyewa</td></tr>
              ) : (
                processedTenants.map(t => (
                  <tr key={t.Penyewa_ID}>
                    <td style={tdStyle}>{t.Nama_Lengkap}</td>
                    <td style={tdStyle}>{maskPhoneNumber(t.No_Hp)}</td>
                    <td style={tdStyle}>{formatDate(t.Tgl_Masuk)}</td>
                    <td style={tdStyle}>{formatDate(t.Tgl_Keluar)}</td>
                    <td style={tdStyle}>{t.Status_Sewa}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div style={{ margin:'24px 0px 0px', fontSize: '14px', color: '#6a7178' }}>
          1 to {processedTenants.length} of {processedTenants.length} items
        </div>
      </div>

      {/* Bagian 3: Aktivitas Kamar */}
      <div style={cardStyle}>
        <h3 style={{...cardTitleStyle, marginBottom: '10px'}}>Aktivitas Kamar</h3>
        <div style={{ border: '1px solid #e6e6e6', borderRadius: '4px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th className="sortable-header" style={thStyle} onClick={() => requestSortActivity('Tgl_Pengeluaran')}>Tanggal<img src="/sort.png" style={{width:'12px', height:'12px', marginLeft:'6px'}} /></th>
                <th className="sortable-header" style={{...thStyle, width: '602.83px'}} onClick={() => requestSortActivity('Deskripsi')}>Deskripsi<img src="/sort.png" style={{width:'12px', height:'12px', marginLeft:'6px'}} /></th>
              </tr>
            </thead>
            <tbody>
              {processedActivities.length === 0 ? (
                <tr><td colSpan="2" style={{ ...tdStyle, padding: '20px' }}>Tidak ada data yang ditampilkan</td></tr>
              ) : (
                processedActivities.map(a => (
                  <tr key={a.Pengeluaran_ID}>
                    <td style={tdStyle}>{formatDate(a.Tgl_Pengeluaran)}</td>
                    <td style={tdStyle}>{a.Deskripsi}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default DetailKamar;