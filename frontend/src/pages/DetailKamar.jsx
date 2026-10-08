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

  // State untuk Pagination
  const [currentTenantPage, setCurrentTenantPage] = useState(1);
  const [currentActivityPage, setCurrentActivityPage] = useState(1);
  const itemsPerPage = 10;

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
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Logika Menghitung Kosong Sejak (H+1 Tanggal Keluar Terakhir)
  const getKosongSejak = () => {
    if (!room || room.Status_Ketersediaan !== 'KOSONG') {
      return null;
    }

    const tenantsWithExitDate = tenants.filter(tenant => tenant.Tgl_Keluar);

    if (tenantsWithExitDate.length === 0) {
      return null;
    }

    const lastTenant = tenantsWithExitDate.reduce((latest, current) => {
      return new Date(current.Tgl_Keluar) > new Date(latest.Tgl_Keluar) ? current : latest;
    });

    const exitDate = new Date(lastTenant.Tgl_Keluar);
    const kosongSejakDate = new Date(exitDate);
    kosongSejakDate.setDate(kosongSejakDate.getDate() + 1);

    return formatDate(kosongSejakDate);
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

  // --- LOGIKA TANEL RIWAYAT PENYEWA ---
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

  // Pagination Tenant
  const totalTenantPages = Math.ceil(processedTenants.length / itemsPerPage);
  const tenantStartIndex = (currentTenantPage - 1) * itemsPerPage;
  const tenantEndIndex = tenantStartIndex + itemsPerPage;
  const currentTenants = processedTenants.slice(tenantStartIndex, tenantEndIndex);

  useEffect(() => {
    setCurrentTenantPage(1);
  }, [sortTenant]);

  // --- LOGIKA TABEL AKTIVITAS KAMAR ---
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

  // Pagination Activity
  const totalActivityPages = Math.ceil(processedActivities.length / itemsPerPage);
  const activityStartIndex = (currentActivityPage - 1) * itemsPerPage;
  const activityEndIndex = activityStartIndex + itemsPerPage;
  const currentActivities = processedActivities.slice(activityStartIndex, activityEndIndex);

  useEffect(() => {
    setCurrentActivityPage(1);
  }, [sortActivity]);

  // Styling Variables
  const cardStyle = { backgroundColor: '#fff', borderRadius: '4px', padding: '20px', marginBottom: '24px' };
  const labelStyle = { display: 'block', fontSize: '14px', color: '#4f575e', marginBottom: '8px', fontWeight: 'bold' };
  const readOnlyInputStyle = { width: '100%', height:'40px', padding: '0px 16px', backgroundColor: '#f9f9f9', border: '1px solid #e0e0e0', borderRadius: '4px', color: '#888', fontSize: '14px', outline: 'none', marginBottom: '10px' };
  const thStyle = { padding: '0px 24px', borderBottom: '1px solid #e0e0e0', fontWeight: 'bold', color: '#4f575e', fontSize: '14px', cursor: 'pointer', userSelect: 'none', textAlign: 'left', height: '48px' };
  const tdStyle = { padding: '8px 24px', borderBottom: '1px solid #e0e0e0', fontSize: '14px', color: '#272b30', height: '56px' };
  const cardTitleStyle = { fontSize: '18px', fontWeight: '600', color: '#222', marginBottom: '20px' };

  if (loading) return <p style={{ padding: '20px' }}>Memuat profil kamar...</p>;
  if (!room) return <p style={{ padding: '20px' }}>Data kamar tidak ditemukan.</p>;

  const tglKosongSejak = getKosongSejak();

  return (
    <div>
      {/* Header */}
      <h2 style={{ fontSize: '32px', fontWeight: '600', color: '#111', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <Link to="/kamar" style={{ textDecoration: 'none', color: '#111', fontSize: '24px' }}>
          <img src="/back.png" alt="Kembali" style={{ width: '14px', height: '18px' }} />
        </Link> Profil Kamar
      </h2>

      {/* Bagian 1: Informasi Kamar */}
      <div style={cardStyle}>
        <h3 style={{ ...cardTitleStyle, margin: '0px 0px 10px' }}>Informasi Kamar</h3>

        <label style={labelStyle}>Nomor Kamar</label>
        <input type="text" value={room.No_Kamar || ''} readOnly style={{ ...readOnlyInputStyle, backgroundColor: '#f1f3f5', color: '#adb5bd' }} />

        <label style={labelStyle}>Lantai</label>
        <input type="text" value={room.Lantai || ''} readOnly style={{ ...readOnlyInputStyle, backgroundColor: '#f1f3f5', color: '#adb5bd' }} />

        <label style={labelStyle}>Status Ketersediaan Kamar</label>
        <input type="text" value={room.Status_Ketersediaan || ''} readOnly style={{ ...readOnlyInputStyle, backgroundColor: '#f1f3f5', color: '#adb5bd', marginBottom: room.Status_Ketersediaan === 'KOSONG' ? '4px' : '10px' }} />

        {room.Status_Ketersediaan === 'KOSONG' && tglKosongSejak && (
          <p style={{ fontSize: '16px', fontWeight: '600', color: '#000000', marginTop: '0px', marginBottom: '10px' }}>
            Kosong Sejak: {tglKosongSejak} - Sekarang
          </p>
        )}
      </div>

      {/* Bagian 2: Riwayat Penyewa */}
      <div style={cardStyle}>
        <h3 style={{ ...cardTitleStyle, marginBottom: '10px' }}>Riwayat Penyewa</h3>
        <div style={{ border: '1px solid #e6e6e6', borderRadius: '4px', backgroundColor: '#fff' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th className="sortable-header" style={{ ...thStyle, color: sortTenant.key === 'Nama_Lengkap' ? '#083487' : '#4f575e' }} onClick={() => requestSortTenant('Nama_Lengkap')}>Nama<img src="/sort.png" alt="Sort" style={{ width: '12px', height: '12px', marginLeft: '6px' }} /></th>
                <th className="sortable-header" style={{ ...thStyle, color: sortTenant.key === 'No_Hp' ? '#083487' : '#4f575e' }} onClick={() => requestSortTenant('No_Hp')}>No Telepon<img src="/sort.png" alt="Sort" style={{ width: '12px', height: '12px', marginLeft: '6px' }} /></th>
                <th className="sortable-header" style={{ ...thStyle, color: sortTenant.key === 'Tgl_Masuk' ? '#083487' : '#4f575e' }} onClick={() => requestSortTenant('Tgl_Masuk')}>Tanggal Masuk<img src="/sort.png" alt="Sort" style={{ width: '12px', height: '12px', marginLeft: '6px' }} /></th>
                <th className="sortable-header" style={{ ...thStyle, color: sortTenant.key === 'Tgl_Keluar' ? '#083487' : '#4f575e' }} onClick={() => requestSortTenant('Tgl_Keluar')}>Tanggal Keluar<img src="/sort.png" alt="Sort" style={{ width: '12px', height: '12px', marginLeft: '6px' }} /></th>
                <th className="sortable-header" style={{ ...thStyle, color: sortTenant.key === 'Status_Sewa' ? '#083487' : '#4f575e' }} onClick={() => requestSortTenant('Status_Sewa')}>Status Sewa<img src="/sort.png" alt="Sort" style={{ width: '12px', height: '12px', marginLeft: '6px' }} /></th>
              </tr>
            </thead>
            {currentTenants.length > 0 && (
              <tbody>
                {currentTenants.map(t => (
                  <tr key={t.Penyewa_ID}>
                    <td style={tdStyle}>{t.Nama_Lengkap}</td>
                    <td style={tdStyle}>{maskPhoneNumber(t.No_Hp)}</td>
                    <td style={tdStyle}>{formatDate(t.Tgl_Masuk)}</td>
                    <td style={tdStyle}>{formatDate(t.Tgl_Keluar)}</td>
                    <td style={tdStyle}>{t.Status_Sewa}</td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>

        {/* Pesan jika tidak ada data */}
        {processedTenants.length === 0 && (
          <div style={{ marginTop: '0px', fontSize: '14px', color: '#111' }}>
            Tidak ada data yang ditampilkan
          </div>
        )}

        {/* Footer Info & Pagination Riwayat Penyewa */}
        {processedTenants.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: '22px' }}>
            <div style={{ fontSize: '14px', color: '#6a7178' }}>
              {`${tenantStartIndex + 1} to ${Math.min(tenantEndIndex, processedTenants.length)} of ${processedTenants.length} items`}
            </div>

            {totalTenantPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => setCurrentTenantPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentTenantPage === 1}
                  style={{ width: '32px', height: '32px', border: '1px solid #e0e4e8', borderRadius: '4px', backgroundColor: '#fff', color: currentTenantPage === 1 ? '#c5cbd1' : '#4f575e', cursor: currentTenantPage === 1 ? 'not-allowed' : 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <span style={{ transform: 'translateY(-3px)' }}>‹</span>
                </button>

                {Array.from({ length: totalTenantPages }, (_, index) => index + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentTenantPage(page)}
                    style={{ width: '32px', height: '32px', border: currentTenantPage === page ? '1px solid #083487' : '1px solid #e0e4e8', borderRadius: '4px', backgroundColor: '#fff', color: currentTenantPage === page ? '#083487' : '#4f575e', cursor: 'pointer', fontSize: '14px', fontWeight: currentTenantPage === page ? '600' : '400', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentTenantPage(prev => Math.min(prev + 1, totalTenantPages))}
                  disabled={currentTenantPage === totalTenantPages}
                  style={{ width: '32px', height: '32px', border: '1px solid #e0e4e8', borderRadius: '4px', backgroundColor: '#fff', color: currentTenantPage === totalTenantPages ? '#c5cbd1' : '#4f575e', cursor: currentTenantPage === totalTenantPages ? 'not-allowed' : 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <span style={{ transform: 'translateY(-3px)' }}>›</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bagian 3: Aktivitas Kamar */}
      <div style={cardStyle}>
        <h3 style={{ ...cardTitleStyle, marginBottom: '10px' }}>Aktivitas Kamar</h3>
        <div style={{ border: '1px solid #e6e6e6', borderRadius: '4px', backgroundColor: '#fff' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th className="sortable-header" style={{ ...thStyle, color: sortActivity.key === 'Tgl_Pengeluaran' ? '#083487' : '#4f575e' }} onClick={() => requestSortActivity('Tgl_Pengeluaran')}>Tanggal<img src="/sort.png" alt="Sort" style={{ width: '12px', height: '12px', marginLeft: '6px' }} /></th>
                <th className="sortable-header" style={{ ...thStyle, width: '602.83px', color: sortActivity.key === 'Deskripsi' ? '#083487' : '#4f575e' }} onClick={() => requestSortActivity('Deskripsi')}>Deskripsi<img src="/sort.png" alt="Sort" style={{ width: '12px', height: '12px', marginLeft: '6px' }} /></th>
              </tr>
            </thead>
            {currentActivities.length > 0 && (
              <tbody>
                {currentActivities.map(a => (
                  <tr key={a.Pengeluaran_ID}>
                    <td style={tdStyle}>{formatDate(a.Tgl_Pengeluaran)}</td>
                    <td style={tdStyle}>{a.Deskripsi}</td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>

        {/* Pesan jika tidak ada data */}
        {processedActivities.length === 0 && (
          <div style={{ marginTop: '0px', fontSize: '14px', color: '#111' }}>
            Tidak ada data yang ditampilkan
          </div>
        )}

        {/* Footer Info & Pagination Aktivitas Kamar */}
        {processedActivities.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: '22px' }}>
            <div style={{ fontSize: '14px', color: '#6a7178' }}>
              {`${activityStartIndex + 1} to ${Math.min(activityEndIndex, processedActivities.length)} of ${processedActivities.length} items`}
            </div>

            {totalActivityPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => setCurrentActivityPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentActivityPage === 1}
                  style={{ width: '32px', height: '32px', border: '1px solid #e0e4e8', borderRadius: '4px', backgroundColor: '#fff', color: currentActivityPage === 1 ? '#c5cbd1' : '#4f575e', cursor: currentActivityPage === 1 ? 'not-allowed' : 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <span style={{ transform: 'translateY(-3px)' }}>‹</span>
                </button>

                {Array.from({ length: totalActivityPages }, (_, index) => index + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentActivityPage(page)}
                    style={{ width: '32px', height: '32px', border: currentActivityPage === page ? '1px solid #083487' : '1px solid #e0e4e8', borderRadius: '4px', backgroundColor: '#fff', color: currentActivityPage === page ? '#083487' : '#4f575e', cursor: 'pointer', fontSize: '14px', fontWeight: currentActivityPage === page ? '600' : '400', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentActivityPage(prev => Math.min(prev + 1, totalActivityPages))}
                  disabled={currentActivityPage === totalActivityPages}
                  style={{ width: '32px', height: '32px', border: '1px solid #e0e4e8', borderRadius: '4px', backgroundColor: '#fff', color: currentActivityPage === totalActivityPages ? '#c5cbd1' : '#4f575e', cursor: currentActivityPage === totalActivityPages ? 'not-allowed' : 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <span style={{ transform: 'translateY(-3px)' }}>›</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailKamar;