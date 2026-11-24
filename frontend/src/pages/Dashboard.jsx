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
        const [roomsData, tenantsData, paymentsData] = await Promise.all([getRooms(), getTenants(), getPayments()]);
        setRooms(Array.isArray(roomsData) ? roomsData : []);
        setTenants(Array.isArray(tenantsData) ? tenantsData : []);
        setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      } catch (err) {
        console.error('Gagal memuat data Dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const requestSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  // Reset pagination ke halaman 1 ketika sorting berubah
  useEffect(() => {
    setCurrentPageKamarKosong(1);
    setCurrentPageBelumBayar(1);
  }, [sortConfig]);

  if (loading) return <p style={{ padding: '20px' }}>Memuat data...</p>;

// =========================
  // PERHITUNGAN DASHBOARD
  // =========================
  const totalKamar = rooms.length;
  const daftarKamarTerisi = rooms.filter(r => r.status_ketersediaan === 'TERISI');
  const daftarKamarKosong = rooms.filter(r => r.status_ketersediaan === 'KOSONG');
  const kamarTerisi = daftarKamarTerisi.length;
  const kamarKosong = daftarKamarKosong.length;

  const penyewaAktif = tenants.filter(t => t.status_sewa === 'AKTIF');
  const totalPenyewaAktif = penyewaAktif.length;

  const now = new Date();
  const bulanIni = now.getMonth(); // 0 - 11
  const tahunIni = now.getFullYear();

  // Helper parsing tanggal aman (mendukung YYYY-MM-DD maupun DD/MM/YYYY)
  const parseTanggal = (value) => {
    if (!value) return null;
    const str = String(value).trim();
    const dmy = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (dmy) return new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]));
    const ymd = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if (ymd) return new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]));
    const parsed = new Date(str);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  // Cek apakah pembayaran termasuk periode bulan & tahun ini
  const isPeriodeBulanIni = (p) => {
    if (p.bulan_pembayaran) {
      const bm = String(p.bulan_pembayaran).trim();
      const mmYyyy = `${String(bulanIni + 1).padStart(2, '0')}/${tahunIni}`;
      const yyyyMm = `${tahunIni}-${String(bulanIni + 1).padStart(2, '0')}`;
      if (bm === mmYyyy || bm === yyyyMm) return true;
    }
    const tanggal = parseTanggal(p.tgl_pembayaran);
    return tanggal !== null && tanggal.getMonth() === bulanIni && tanggal.getFullYear() === tahunIni;
  };

  // Helper mencocokkan record payment ke kamar (via kamar_id, sewa_id, atau no_kamar)
  const isPaymentMilikKamar = (p, room) => {
    if (p.kamar_id != null && room.kamar_id != null) {
      return p.kamar_id === room.kamar_id;
    }
    if (p.sewa_id != null) {
      const sewaIdsKamar = penyewaAktif
        .filter(t => t.kamar_id === room.kamar_id)
        .map(t => t.sewa_id ?? t.id);
      if (sewaIdsKamar.includes(p.sewa_id)) return true;
    }
    if (p.no_kamar && room.no_kamar) {
      return String(p.no_kamar).trim() === String(room.no_kamar).trim();
    }
    return false;
  };

  // 1. Pendapatan Bulan Ini (semua transaksi LUNAS pada bulan berjalan)
  const pembayaranLunasBulanIni = payments.filter(
    p => p.status_pembayaran === 'LUNAS' && isPeriodeBulanIni(p)
  );
  const totalPendapatanBulanIni = pembayaranLunasBulanIni.reduce(
    (sum, p) => sum + Number(p.nominal ?? 0),
    0
  );

  // 2. Kamar Terisi yang Sudah Lunas Bulan Ini (dihitung 1 per kamar)
  const daftarKamarSudahLunas = daftarKamarTerisi.filter(room => {
    const jumlahPenyewaKamar = penyewaAktif.filter(t => t.kamar_id === room.kamar_id).length || 1;
    const jumlahLunasKamar = pembayaranLunasBulanIni.filter(p => isPaymentMilikKamar(p, room)).length;
    return jumlahLunasKamar >= jumlahPenyewaKamar;
  });

  // 3. Kamar Terisi yang Belum Bayar / Belum Lunas Bulan Ini (dihitung 1 per kamar)
  // Mencakup kamar terisi yang statusnya 'BELUM LUNAS' maupun yang belum ada record pembayaran bulan ini
  const daftarBelumBayar = daftarKamarTerisi.filter(
    room => !pembayaranLunasBulanIni.some(p => isPaymentMilikKamar(p, room))
  );

  const kamarSudahLunas = daftarKamarSudahLunas.length;
  const kamarBelumLunas = daftarBelumBayar.length;

  // =========================
  // SORTING
  // =========================
  const sortData = (data) => {
    return [...data].sort((a, b) => {
      if (sortConfig.key === null) return 0;
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      const comparison = (typeof aValue === 'number' || typeof bValue === 'number')
        ? Number(aValue) - Number(bValue)
        : String(aValue).localeCompare(String(bValue), 'id', { numeric: true, sensitivity: 'base' });

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  };

  const sortedDaftarKamarKosong = sortData(daftarKamarKosong);
  const sortedDaftarBelumBayar = sortData(daftarBelumBayar);

  // =========================
  // PAGINATION CALCULATIONS
  // =========================
  const totalPagesKamarKosong = Math.ceil(sortedDaftarKamarKosong.length / itemsPerPage);
  const startIndexKamarKosong = (currentPageKamarKosong - 1) * itemsPerPage;
  const endIndexKamarKosong = startIndexKamarKosong + itemsPerPage;
  const currentKamarKosong = sortedDaftarKamarKosong.slice(startIndexKamarKosong, endIndexKamarKosong);

  const totalPagesBelumBayar = Math.ceil(sortedDaftarBelumBayar.length / itemsPerPage);
  const startIndexBelumBayar = (currentPageBelumBayar - 1) * itemsPerPage;
  const endIndexBelumBayar = startIndexBelumBayar + itemsPerPage;
  const currentBelumBayar = sortedDaftarBelumBayar.slice(startIndexBelumBayar, endIndexBelumBayar);

  // =========================
  // STYLING
  // =========================
  const cardStyle = { backgroundColor: '#fff', borderRadius: '4px', padding: '20px', marginBottom: '20px', width: '1200px' };
  const cardHeaderStyle = { fontSize: '18px', fontWeight: '400', color: '#222', marginBottom: '20px', borderBottom: '1px solid #f0f0f0' };
  const rowFlexStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', color: '#4f575e' };
  const thStyle = { padding: '0px 24px', borderBottom: '1px solid #e0e0e0', fontWeight: '600', color: '#4f575e', fontSize: '14px', height: '48px' };
  const tdStyle = { padding: '8px 24px', borderBottom: '1px solid #eee', fontSize: '14px', color: '#272b30', height: '56px' };

  // =========================
  // KOMPONEN PAGINATION
  // =========================
  const paginationButtonStyle = (active, disabled = false) => ({
    width: '32px', height: '32px', borderRadius: '4px', backgroundColor: '#fff', fontSize: '14px',
    border: active ? '1px solid #083487' : '1px solid #e0e4e8',
    color: disabled ? '#c5cbd1' : active ? '#083487' : '#4f575e',
    cursor: disabled ? 'not-allowed' : 'pointer', fontWeight: active ? '600' : '400',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  });

  const renderPagination = (currentPage, totalPages, setCurrentPage) => {
    if (totalPages <= 1) return null;

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} style={{ ...paginationButtonStyle(false, currentPage === 1), fontSize: '20px' }}>
          <span style={{ transform: 'translateY(-3px)' }}>‹</span>
        </button>

        {Array.from({ length: totalPages }, (_, index) => index + 1).map(page => (
          <button key={page} onClick={() => setCurrentPage(page)} style={paginationButtonStyle(currentPage === page)}>{page}</button>
        ))}

        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} style={{ ...paginationButtonStyle(false, currentPage === totalPages), fontSize: '20px' }}>
          <span style={{ transform: 'translateY(-3px)' }}>›</span>
        </button>
      </div>
    );
  };

  // =========================
  // RENDER DASHBOARD
  // =========================
  return (
    <div>
      <h2 style={{ fontSize: '32px', margin: '-2px 0px 33px', color: '#111', fontWeight: '600', height: '40px' }}>Dashboard</h2>

      {/* Card Kamar */}
      <div style={{ ...cardStyle, height: '101px' }}>
        <h3 style={{ ...cardHeaderStyle, borderBottom: 'none', fontWeight: '600', fontSize: 20, marginBottom: 10, height: '30px', width: '1160px', marginTop: '2px' }}>
          Kamar
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '60px', marginTop: '-1.5px' }}>
          <div style={{ ...rowFlexStyle, height: '21px' }}>
            <span style={{ fontSize: 14, fontWeight: '600', width: '196px', color: '#272b30' }}>Jumlah Kamar</span>
            <span style={{ fontSize: 14, fontWeight: '600', width: '196px', color: '#272b30' }}>{totalKamar}</span>
          </div>

          <div style={{ ...rowFlexStyle, height: '21px', marginLeft: '-60px' }}>
            <span style={{ fontSize: 14, fontWeight: '600', width: '196px', color: '#272b30' }}>Jumlah Kamar Terisi</span>
            <span style={{ fontSize: 14, fontWeight: '600', width: '196px', color: '#272b30' }}>{kamarTerisi}</span>
          </div>

          <div style={{ ...rowFlexStyle, height: '21px', marginLeft: '-60px' }}>
            <span style={{ fontSize: 14, fontWeight: '600', width: '196px', color: '#272b30' }}>Jumlah Kamar Kosong</span>
            <span style={{ fontSize: 14, fontWeight: '600', width: '196px', color: '#272b30' }}>{kamarKosong}</span>
          </div>
        </div>
      </div>

      {/* Card Pembayaran Bulan Ini */}
      <div style={{ ...cardStyle, height: '180px', marginTop: '16px' }}>
        <h3 style={{ ...cardHeaderStyle, borderBottom: 'none', fontWeight: '600', fontSize: 18, marginBottom: 8, marginTop: '1px' }}>
          Pembayaran Bulan Ini
        </h3>
        <hr style={{ border: 'none', borderTop: '1px solid #d9dfe3', marginBottom: '26px' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', marginLeft: '2px' }}>
          <div>
            <div style={{ ...rowFlexStyle, width: '588px', padding: '0px 8px' }}>
              <span style={{ fontSize: 15, fontWeight: '600', width: '328.99px', height: '42.5px', color: '#272b30' }}>Jumlah Kamar yang Belum Lunas</span>
              <span style={{ fontSize: 15, fontWeight: '600', width: '134.59px', marginRight: '110px', marginTop: '-20px', color: '#272b30' }}>{kamarBelumLunas}</span>
            </div>

            <div style={{ ...rowFlexStyle, width: '588px', padding: '0px 8px' }}>
              <span style={{ fontSize: 15, fontWeight: '600', width: '328.99px', height: '42.5px', color: '#272b30' }}>Jumlah Kamar yang Sudah Lunas</span>
              <span style={{ fontSize: 15, fontWeight: '600', width: '134.59px', marginRight: '110px', marginTop: '-20px', color: '#272b30' }}>{kamarSudahLunas}</span>
            </div>
          </div>

          <div>
            <div style={{ ...rowFlexStyle, width: '588px', padding: '0px 8px' }}>
              <span style={{ fontSize: 15, fontWeight: '600', width: '328.99px', height: '42.5px', color: '#272b30' }}>Pendapatan Bulan Ini</span>
              <span style={{ fontSize: 15, fontWeight: '600', width: '134.59px', marginRight: '110px', marginTop: '-20px', color: '#272b30' }}>Rp {totalPendapatanBulanIni.toLocaleString('id-ID')}</span>
            </div>

            <div style={{ ...rowFlexStyle, width: '588px', padding: '0px 8px' }}>
              <span style={{ fontSize: 15, fontWeight: '600', width: '328.99px', height: '42.5px', color: '#272b30' }}>Total Penyewa Aktif</span>
              <span style={{ fontSize: 15, fontWeight: '600', width: '134.59px', marginRight: '110px', marginTop: '-20px', color: '#272b30' }}>{totalPenyewaAktif}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Tabel 2 Kolom */}
      <div style={{ ...cardStyle, display: 'grid', gridTemplateColumns: '6fr 4fr', gap: '16px' }}>

        {/* Kolom 1: Daftar Kamar Kosong */}
        <div>
          <h3 style={{ ...cardHeaderStyle, borderBottom: 'none', fontWeight: '600', fontSize: 18, marginBottom: 10 }}>Daftar Kamar Kosong</h3>

          <div style={{ backgroundColor: '#fff', border: '1px solid #e6e6e6', borderRadius: '4px' }}>
            <table style={{ width: '760.45px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th className="sortable-header" style={{ ...thStyle, width: '170.07px', color: sortConfig.key === 'no_kamar' ? '#083487' : '#4f575e', cursor: 'pointer' }} onClick={() => requestSort('no_kamar')}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>Nomor Kamar <img src="/sort.png" style={{ width: '12px', height: '12px' }} alt="Sort" /></span>
                  </th>
                  <th className="sortable-header" style={{ ...thStyle, width: '134.82px', color: sortConfig.key === 'harga' ? '#083487' : '#4f575e', cursor: 'pointer' }} onClick={() => requestSort('harga')}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>Harga <img src="/sort.png" style={{ width: '12px', height: '12px' }} alt="Sort" /></span>
                  </th>
                  <th className="sortable-header" style={{ ...thStyle, width: '150.79px', color: sortConfig.key === 'tipe_kamar' ? '#083487' : '#4f575e', cursor: 'pointer' }} onClick={() => requestSort('tipe_kamar')}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>Tipe Kamar <img src="/sort.png" style={{ width: '12px', height: '12px' }} alt="Sort" /></span>
                  </th>
                  <th className="sortable-header" style={{ ...thStyle, width: '114.23px', color: sortConfig.key === 'lantai' ? '#083487' : '#4f575e', cursor: 'pointer' }} onClick={() => requestSort('lantai')}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>Lantai <img src="/sort.png" style={{ width: '12px', height: '12px' }} alt="Sort" /></span>
                  </th>
                  <th className="sortable-header" style={{ ...thStyle, width: '212.83px', color: sortConfig.key === 'status_ketersediaan' ? '#083487' : '#4f575e', cursor: 'pointer' }} onClick={() => requestSort('status_ketersediaan')}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>Status Ketersediaan <img src="/sort.png" style={{ width: '12px', height: '12px' }} alt="Sort" /></span>
                  </th>
                </tr>
              </thead>

              {currentKamarKosong.length > 0 && (
                <tbody>
                  {currentKamarKosong.map(r => (
                    <tr key={r.kamar_id}>
                      <td style={{ ...tdStyle, width: '170.07px' }}>{r.no_kamar}</td>
                      <td style={{ ...tdStyle, width: '112.53px' }}>Rp {Number(r.harga ?? 0).toLocaleString('id-ID')}</td>
                      <td style={{ ...tdStyle, width: '150.79px' }}>{r.tipe_kamar}</td>
                      <td style={{ ...tdStyle, width: '114.23px' }}>{r.lantai}</td>
                      <td style={{ ...tdStyle, width: '212.83px' }}>{r.status_ketersediaan}</td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>

          {sortedDaftarKamarKosong.length === 0 && (
            <div style={{ marginTop: '0px', fontSize: '14px', color: '#111' }}>Tidak ada data yang ditampilkan</div>
          )}

          {sortedDaftarKamarKosong.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: '22px' }}>
              <div style={{ fontSize: '14px', color: '#6a7178' }}>
                {`${startIndexKamarKosong + 1} to ${Math.min(endIndexKamarKosong, sortedDaftarKamarKosong.length)} of ${sortedDaftarKamarKosong.length} items`}
              </div>
              {renderPagination(currentPageKamarKosong, totalPagesKamarKosong, setCurrentPageKamarKosong)}
            </div>
          )}
        </div>

        {/* Kolom 2: Daftar Kamar yang Belum Bayar */}
        <div>
          <h3 style={{ ...cardHeaderStyle, borderBottom: 'none', fontWeight: '600', fontSize: 18, marginBottom: 10 }}>Daftar Kamar yang Belum Bayar</h3>

          <div style={{ backgroundColor: '#fff', border: '1px solid #e6e6e6', borderRadius: '4px', width: '379.74px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, color: sortConfig.key === 'no_kamar' ? '#083487' : '#4f575e', cursor: 'pointer' }} onClick={() => requestSort('no_kamar')}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>No Kamar <img src="/sort.png" style={{ width: '12px', height: '12px' }} alt="Sort" /></span>
                  </th>
                </tr>
              </thead>

              {currentBelumBayar.length > 0 && (
              <tbody>
                {currentBelumBayar.map(r => (
                  <tr key={r.kamar_id}>
                    <td style={tdStyle}>{r.no_kamar ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            )}
            </table>
          </div>

          {sortedDaftarBelumBayar.length === 0 && (
            <div style={{ marginTop: '0px', fontSize: '14px', color: '#111' }}>Tidak ada data yang ditampilkan</div>
          )}

          {sortedDaftarBelumBayar.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '379.74px', marginTop: '22px' }}>
              <div style={{ fontSize: '14px', color: '#6a7178' }}>
                {`${startIndexBelumBayar + 1} to ${Math.min(endIndexBelumBayar, sortedDaftarBelumBayar.length)} of ${sortedDaftarBelumBayar.length} items`}
              </div>
              {renderPagination(currentPageBelumBayar, totalPagesBelumBayar, setCurrentPageBelumBayar)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;