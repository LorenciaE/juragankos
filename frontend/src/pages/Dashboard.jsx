import React, { useEffect, useState } from 'react';
import { getRooms, getTenants, getPayments } from '../services/api';

const Dashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Pagination State
  const [currentPageKamarKosong, setCurrentPageKamarKosong] = useState(1);
  const [currentPageBelumBayar, setCurrentPageBelumBayar] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const roomsData = await getRooms();
        const tenantsData = await getTenants();
        const paymentsData = await getPayments();
        setRooms(roomsData);
        setTenants(tenantsData);
        setPayments(paymentsData);
        setLoading(false);
      } catch (err) {
        console.error("Gagal memuat data", err);
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  // Reset pagination ke halaman 1 ketika sorting berubah
  useEffect(() => {
    setCurrentPageKamarKosong(1);
    setCurrentPageBelumBayar(1);
  }, [sortConfig]);

  if (loading) return <p style={{ padding: '20px' }}>Memuat data...</p>;

  const totalKamar = rooms.length;
  const kamarTerisi = rooms.filter(r => r.Status_Ketersediaan === 'TERISI').length;
  const kamarKosong = rooms.filter(r => r.Status_Ketersediaan === 'KOSONG').length;

  const totalPenyewaAktif = tenants.filter(t => t.Status_Sewa === 'AKTIF').length;
  const totalPendapatanBulanIni = payments.filter(p => p.Status_Pembayaran === 'LUNAS').reduce((sum, p) => sum + p.Nominal, 0);
  const kamarBelumLunas = payments.filter(p => p.Status_Pembayaran === 'BELUM LUNAS').length;
  const kamarSudahLunas = payments.filter(p => p.Status_Pembayaran === 'LUNAS').length;

  const daftarKamarKosong = rooms.filter(r => r.Status_Ketersediaan === 'KOSONG');
  const daftarBelumBayar = payments.filter(p => p.Status_Pembayaran === 'BELUM LUNAS');

  const sortedDaftarKamarKosong = [...daftarKamarKosong].sort((a, b) => {
    if (sortConfig.key === null) return 0;
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const sortedDaftarBelumBayar = [...daftarBelumBayar].sort((a, b) => {
    if (sortConfig.key === null) return 0;
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // =========================
  // PAGINATION CALCULATIONS
  // =========================

  // 1. Kamar Kosong
  const totalPagesKamarKosong = Math.ceil(sortedDaftarKamarKosong.length / itemsPerPage);
  const startIndexKamarKosong = (currentPageKamarKosong - 1) * itemsPerPage;
  const endIndexKamarKosong = startIndexKamarKosong + itemsPerPage;
  const currentKamarKosong = sortedDaftarKamarKosong.slice(startIndexKamarKosong, endIndexKamarKosong);

  // 2. Belum Bayar
  const totalPagesBelumBayar = Math.ceil(sortedDaftarBelumBayar.length / itemsPerPage);
  const startIndexBelumBayar = (currentPageBelumBayar - 1) * itemsPerPage;
  const endIndexBelumBayar = startIndexBelumBayar + itemsPerPage;
  const currentBelumBayar = sortedDaftarBelumBayar.slice(startIndexBelumBayar, endIndexBelumBayar);

  // Styling Variables
  const cardStyle = { backgroundColor: '#fff', borderRadius: '4px', padding: '20px', marginBottom: '20px', width: '1200px' };
  const cardHeaderStyle = { fontSize: '18px', fontWeight: '400', color: '#222', marginBottom: '20px', borderBottom: '1px solid #f0f0f0' };
  const rowFlexStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', color: '#4f575e' };
  const thStyle = { padding: '0px 24px', borderBottom: '1px solid #e0e0e0', fontWeight: '600', color: '#4f575e', fontSize: '14px', height: '48px' };
  const tdStyle = { padding: '8px 24px', borderBottom: '1px solid #eee', fontSize: '14px', color: '#272b30', height: '56px' };

  return (
    <div>
      <h2 style={{ fontSize: '32px', margin: '-2px 0px 33px', color: '#111', fontWeight: '600', height: '40px'}}>Dashboard</h2>

      {/* Card Kamar */}
      <div style={{...cardStyle, height:'101px'}}>
        <h3 style={{...cardHeaderStyle, borderBottom:'none', fontWeight:'600', fontSize:20, marginBottom:10, height:'30px', width:'1160px', marginTop: '2px'}}>Kamar</h3>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'60px', marginTop: '-1.5px'}}>
          <div style={{...rowFlexStyle, height:'21px'}}><span style={{fontSize:14, fontWeight:'600', width:'196px', color: '#272b30'}}>Jumlah Kamar</span><span style={{fontSize:14, fontWeight:'600', width:'196px', color: '#272b30'}}>{totalKamar}</span></div>
          <div style={{...rowFlexStyle, height:'21px', marginLeft:'-60px'}}><span style={{fontSize:14, fontWeight:'600', width:'196px', color: '#272b30'}}>Jumlah Kamar Terisi</span><span style={{fontSize:14, fontWeight:'600', width:'196px', color: '#272b30'}}>{kamarTerisi}</span></div>
          <div style={{...rowFlexStyle, height:'21px', marginLeft:'-60px'}}><span style={{fontSize:14, fontWeight:'600', width:'196px', color: '#272b30'}}>Jumlah Kamar Kosong</span><span style={{fontSize:14, fontWeight:'600', width:'196px', color: '#272b30'}}>{kamarKosong}</span></div>
        </div>
      </div>

      {/* Card Pembayaran Bulan Ini */}
      <div style={{...cardStyle, height:'180px', marginTop: '16px'}}>
        <h3 style={{...cardHeaderStyle, borderBottom:'none', fontWeight:'600', fontSize:18, marginBottom:8, marginTop: '1px'}}>Pembayaran Bulan Ini</h3>
        <hr style={{border:'none', borderTop:'1px solid #d9dfe3', marginBottom:'26px'}} />
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', marginLeft:'2px'}}>
          <div>
            <div style={{...rowFlexStyle, width:'588px', padding:'0px 8px'}}><span style={{fontSize:15, fontWeight:'600', width:'328.99px', height:'42.5px', color: '#272b30'}}>Jumlah Kamar yang Belum Lunas</span><span style={{fontSize:15, fontWeight:'600', width:'134.59px', marginRight:'110px', marginTop:'-20px', color: '#272b30'}}>{kamarBelumLunas}</span></div>
            <div style={{...rowFlexStyle, width:'588px', padding:'0px 8px'}}><span style={{fontSize:15, fontWeight:'600', width:'328.99px', height:'42.5px', color: '#272b30'}}>Jumlah Kamar yang Sudah Lunas</span><span style={{fontSize:15, fontWeight:'600', width:'134.59px', marginRight:'110px', marginTop:'-20px', color: '#272b30'}}>{kamarSudahLunas}</span></div>
          </div>
          <div>
            <div style={{...rowFlexStyle, width:'588px', padding:'0px 8px'}}><span style={{fontSize:15, fontWeight:'600', width:'328.99px', height:'42.5px', color: '#272b30'}}>Pendapatan Bulan Ini</span><span style={{fontSize:15, fontWeight:'600', width:'134.59px', marginRight:'110px', marginTop:'-20px', color: '#272b30'}}>Rp {totalPendapatanBulanIni.toLocaleString('id-ID')}</span></div>
            <div style={{...rowFlexStyle, width:'588px', padding:'0px 8px'}}><span style={{fontSize:15, fontWeight:'600', width:'328.99px', height:'42.5px', color: '#272b30'}}>Total Penyewa Aktif</span><span style={{fontSize:15, fontWeight:'600', width:'134.59px', marginRight:'110px', marginTop:'-20px', color: '#272b30'}}>{totalPenyewaAktif}</span></div>
          </div>
        </div>
      </div>

      {/* Card Tabel 2 Kolom */}
      <div style={{...cardStyle, display:'grid', gridTemplateColumns:'6fr 4fr', gap:'16px'}}>
        
        {/* Kolom 1: Tabel Daftar Kamar Kosong */}
        <div>
          <h3 style={{...cardHeaderStyle, borderBottom:'none', fontWeight:'600', fontSize:18, marginBottom:10}}>Daftar Kamar Kosong</h3>
          <div style={{backgroundColor:'#fff', border:'1px solid #e6e6e6', borderRadius:'4px'}}>
            <table style={{width:'760.45px', borderCollapse:'collapse', textAlign:'left'}}>
              <thead>
                <tr>
                  <th className="sortable-header" style={{...thStyle, width:'170.07px', color:sortConfig.key==='No_Kamar'?'#083487':'#4f575e', cursor:'pointer'}} onClick={()=>requestSort('No_Kamar')}><span style={{display:'inline-flex', alignItems:'center', gap:'6px'}}>Nomor Kamar<img src="/sort.png" style={{width:'12px', height:'12px'}} alt="Sort" /></span></th>
                  <th className="sortable-header" style={{...thStyle, width:'112.53px', color:sortConfig.key==='Harga'?'#083487':'#4f575e', cursor:'pointer'}} onClick={()=>requestSort('Harga')}><span style={{display:'inline-flex', alignItems:'center', gap:'6px'}}>Harga<img src="/sort.png" style={{width:'12px', height:'12px'}} alt="Sort" /></span></th>
                  <th className="sortable-header" style={{...thStyle, width:'150.79px', color:sortConfig.key==='Tipe_Kamar'?'#083487':'#4f575e', cursor:'pointer'}} onClick={()=>requestSort('Tipe_Kamar')}><span style={{display:'inline-flex', alignItems:'center', gap:'6px'}}>Tipe Kamar<img src="/sort.png" style={{width:'12px', height:'12px'}} alt="Sort" /></span></th>
                  <th className="sortable-header" style={{...thStyle, width:'114.23px', color:sortConfig.key==='Lantai'?'#083487':'#4f575e', cursor:'pointer'}} onClick={()=>requestSort('Lantai')}><span style={{display:'inline-flex', alignItems:'center', gap:'6px'}}>Lantai<img src="/sort.png" style={{width:'12px', height:'12px'}} alt="Sort" /></span></th>
                  <th className="sortable-header" style={{...thStyle, width:'212.83px', color:sortConfig.key==='Status_Ketersediaan'?'#083487':'#4f575e', cursor:'pointer'}} onClick={()=>requestSort('Status_Ketersediaan')}><span style={{display:'inline-flex', alignItems:'center', gap:'6px'}}>Status Ketersediaan<img src="/sort.png" style={{width:'12px', height:'12px'}} alt="Sort" /></span></th>
                </tr>
              </thead>
              {currentKamarKosong.length > 0 && (
                <tbody>
                  {currentKamarKosong.map(r => (
                    <tr key={r.Kamar_ID}>
                      <td style={{...tdStyle, width:'170.07px'}}>{r.No_Kamar}</td>
                      <td style={{...tdStyle, width:'112.53px'}}>Rp {r.Harga?.toLocaleString('id-ID')}</td>
                      <td style={{...tdStyle, width:'150.79px'}}>{r.Tipe_Kamar}</td>
                      <td style={{...tdStyle, width:'114.23px'}}>{r.Lantai}</td>
                      <td style={{...tdStyle, width:'212.83px'}}>{r.Status_Ketersediaan}</td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>

          {/* Pesan jika tidak ada data */}
          {sortedDaftarKamarKosong.length === 0 && (
            <div style={{ marginTop: '0px', fontSize: '14px', color: '#111' }}>
              Tidak ada data yang ditampilkan
            </div>
          )}

          {/* Footer Info & Pagination Kamar Kosong */}
          {sortedDaftarKamarKosong.length > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                marginTop: '22px'
              }}
            >
              <div style={{ fontSize: '14px', color: '#6a7178' }}>
                {`${startIndexKamarKosong + 1} to ${Math.min(endIndexKamarKosong, sortedDaftarKamarKosong.length)} of ${sortedDaftarKamarKosong.length} items`}
              </div>

              {totalPagesKamarKosong > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => setCurrentPageKamarKosong(prev => Math.max(prev - 1, 1))}
                    disabled={currentPageKamarKosong === 1}
                    style={{
                      width: '32px',
                      height: '32px',
                      border: '1px solid #e0e4e8',
                      borderRadius: '4px',
                      backgroundColor: '#fff',
                      color: currentPageKamarKosong === 1 ? '#c5cbd1' : '#4f575e',
                      cursor: currentPageKamarKosong === 1 ? 'not-allowed' : 'pointer',
                      fontSize: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <span style={{ transform: 'translateY(-3px)' }}>‹</span>
                  </button>

                  {Array.from({ length: totalPagesKamarKosong }, (_, index) => index + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPageKamarKosong(page)}
                      style={{
                        width: '32px',
                        height: '32px',
                        border: currentPageKamarKosong === page ? '1px solid #083487' : '1px solid #e0e4e8',
                        borderRadius: '4px',
                        backgroundColor: '#fff',
                        color: currentPageKamarKosong === page ? '#083487' : '#4f575e',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: currentPageKamarKosong === page ? '600' : '400',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPageKamarKosong(prev => Math.min(prev + 1, totalPagesKamarKosong))}
                    disabled={currentPageKamarKosong === totalPagesKamarKosong}
                    style={{
                      width: '32px',
                      height: '32px',
                      border: '1px solid #e0e4e8',
                      borderRadius: '4px',
                      backgroundColor: '#fff',
                      color: currentPageKamarKosong === totalPagesKamarKosong ? '#c5cbd1' : '#4f575e',
                      cursor: currentPageKamarKosong === totalPagesKamarKosong ? 'not-allowed' : 'pointer',
                      fontSize: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <span style={{ transform: 'translateY(-3px)' }}>›</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Kolom 2: Tabel Daftar Kamar Belum Bayar */}
        <div>
          <h3 style={{...cardHeaderStyle, borderBottom:'none', fontWeight:'600', fontSize:18, marginBottom:10}}>Daftar Kamar yang Belum Bayar</h3>
          
          <div style={{backgroundColor:'#fff', border:'1px solid #e6e6e6', borderRadius:'4px', width:'379.74px'}}>
            <table style={{width:'100%', borderCollapse:'collapse', textAlign:'left'}}>
              <thead>
                <tr>
                  <th style={{...thStyle, color:sortConfig.key==='No_Kamar'?'#083487':'#4f575e', cursor:'pointer'}} onClick={()=>requestSort('No_Kamar')}>
                    <span style={{display:'inline-flex', alignItems:'center', gap:'6px'}}>
                      No Kamar
                      <img src="/sort.png" style={{width:'12px', height:'12px'}} alt="Sort" />
                    </span>
                  </th>
                </tr>
              </thead>

              {currentBelumBayar.length > 0 && (
                <tbody>
                  {currentBelumBayar.map(p => (
                    <tr key={p.Pembayaran_ID}>
                      <td style={tdStyle}>{p.No_Kamar}</td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>

          {/* Pesan jika tidak ada data */}
          {sortedDaftarBelumBayar.length === 0 && (
            <div style={{ marginTop: '0px', fontSize: '14px', color: '#111' }}>
              Tidak ada data yang ditampilkan
            </div>
          )}

          {/* Footer Info & Pagination Kamar Belum Bayar */}
          {sortedDaftarBelumBayar.length > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '379.74px',
                marginTop: '22px'
              }}
            >
              <div style={{ fontSize: '14px', color: '#6a7178' }}>
                {`${startIndexBelumBayar + 1} to ${Math.min(endIndexBelumBayar, sortedDaftarBelumBayar.length)} of ${sortedDaftarBelumBayar.length} items`}
              </div>

              {totalPagesBelumBayar > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => setCurrentPageBelumBayar(prev => Math.max(prev - 1, 1))}
                    disabled={currentPageBelumBayar === 1}
                    style={{
                      width: '32px',
                      height: '32px',
                      border: '1px solid #e0e4e8',
                      borderRadius: '4px',
                      backgroundColor: '#fff',
                      color: currentPageBelumBayar === 1 ? '#c5cbd1' : '#4f575e',
                      cursor: currentPageBelumBayar === 1 ? 'not-allowed' : 'pointer',
                      fontSize: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <span style={{ transform: 'translateY(-3px)' }}>‹</span>
                  </button>

                  {Array.from({ length: totalPagesBelumBayar }, (_, index) => index + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPageBelumBayar(page)}
                      style={{
                        width: '32px',
                        height: '32px',
                        border: currentPageBelumBayar === page ? '1px solid #083487' : '1px solid #e0e4e8',
                        borderRadius: '4px',
                        backgroundColor: '#fff',
                        color: currentPageBelumBayar === page ? '#083487' : '#4f575e',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: currentPageBelumBayar === page ? '600' : '400',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPageBelumBayar(prev => Math.min(prev + 1, totalPagesBelumBayar))}
                    disabled={currentPageBelumBayar === totalPagesBelumBayar}
                    style={{
                      width: '32px',
                      height: '32px',
                      border: '1px solid #e0e4e8',
                      borderRadius: '4px',
                      backgroundColor: '#fff',
                      color: currentPageBelumBayar === totalPagesBelumBayar ? '#c5cbd1' : '#4f575e',
                      cursor: currentPageBelumBayar === totalPagesBelumBayar ? 'not-allowed' : 'pointer',
                      fontSize: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <span style={{ transform: 'translateY(-3px)' }}>›</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;