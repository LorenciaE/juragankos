import React, { useEffect, useState, useMemo } from 'react';
import { getRooms, deleteRoom } from '../services/api';
import { Link } from 'react-router-dom';

const Kamar = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // State Banner Notifikasi
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // State untuk Filter, Search, dan Sort
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLantai, setFilterLantai] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTipe, setFilterTipe] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // State Modal Konfirmasi Hapus
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Helper menampilkan banner
  const showNotification = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await getRooms();
      setRooms(data);
      setLoading(false);
    } catch (err) {
      showNotification('Gagal memuat data kamar.', 'error');
      setLoading(false);
    }
  };

  const openDeleteModal = (id) => {
    setSelectedRoomId(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedRoomId(null);
  };

  // Eksekusi Hapus dengan penanganan pesan khusus
  const handleConfirmDelete = async () => {
    if (!selectedRoomId) return;
    try {
      await deleteRoom(selectedRoomId);
      closeDeleteModal();
      showNotification('Kamar berhasil dihapus', 'success');
      fetchRooms();
    } catch (err) {
      closeDeleteModal();
      const status = err.response?.status;
      const serverMsg = err.response?.data?.message || '';

      // Jika ada relasi data pembayaran (status HTTP 400 / 409 / constraint foreign key)
      if (status === 400 || status === 409 || serverMsg.toLowerCase().includes('pembayaran') || serverMsg.toLowerCase().includes('terkait')) {
        showNotification('Kamar Tidak Dapat Dihapus Karena Masih Memiliki Data Terkait.', 'info');
      } else {
        showNotification(serverMsg || 'Terjadi kesalahan saat menghapus.', 'error');
      }
    }
  };

  // Logika Filter dan Sort dinamis di frontend
  const processedRooms = useMemo(() => {
    let sortableRooms = [...rooms];

    if (searchTerm) {
      sortableRooms = sortableRooms.filter(r => 
        r.No_Kamar.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterLantai) sortableRooms = sortableRooms.filter(r => r.Lantai.toString() === filterLantai);
    if (filterStatus) sortableRooms = sortableRooms.filter(r => r.Status_Ketersediaan === filterStatus);
    if (filterTipe) sortableRooms = sortableRooms.filter(r => r.Tipe_Kamar === filterTipe);

    if (sortConfig.key !== null) {
      sortableRooms.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableRooms;
  }, [rooms, searchTerm, filterLantai, filterStatus, filterTipe, sortConfig]);

  // PAGINATION
  const totalPages = Math.ceil(processedRooms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRooms = processedRooms.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterLantai, filterStatus, filterTipe, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const uniqueLantai = [...new Set(rooms.map(item => item.Lantai))];

  // Styling Variables
  const tableHeaderStyle = { borderBottom: '1px solid #e0e0e0', fontWeight: '600', color: '#4f575e', fontSize: '14px', cursor: 'pointer', userSelect: 'none', height: '48px'};
  const tableDataStyle = { padding: '8px 20px', borderBottom: '1px solid #e0e0e0', fontSize: '14px', color: '#272b30', height: '56.8px' };
  const btnStyle = { display: 'inline-flex', alignItems: 'center', color: 'white', border: 'none', padding: '0px 14px', borderRadius: '4px', cursor: 'pointer', textDecoration: 'none', fontSize: '14px', fontWeight: '600' };
  const filterInputStyle = { padding: '0px 16px 0px 40px', height: '40px', borderRadius: '4px', border: '1px solid #d9d9d9', fontSize: '14px', width: '100%', outline: 'none', color: '#272b30', backgroundColor: '#fff' };

  // Pemilihan warna dan ikon banner berdasarkan tipe pesan
  const getToastConfig = () => {
    if (toast.type === 'success') {
      return { bg: '#29823B', icon: '✓' };
    }
    if (toast.type === 'info') {
      return { bg: '#0275d8', icon: 'i' };
    }
    return { bg: '#dc2020', icon: '✕' };
  };

  if (loading) return <p style={{ padding: '20px' }}>Memuat data...</p>;

  return (
    <div style={{ position: 'relative' }}>
      
      {/* BANNER NOTIFIKASI */}
      {toast.show && (
        <div
          role="alert"
          className={`feedback-message feedback-message-${toast.type} feedback-message-autoclose`}
          style={{
            position: 'fixed',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            height: '59px',
            padding: '16px',
            backgroundColor: getToastConfig().bg,
            color: '#ffffff',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxSizing: 'border-box',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 10000,
            fontSize: '16px',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            // Jika tipe 'success', ukuran fix 600px disamakan dengan Tambah/Edit.
            // Jika tipe lain (misal 'info'), lebarnya otomatis menyesuaikan panjang teks.
            width: toast.type === 'success' ? '600px' : 'auto',
            maxWidth: '90vw'
          }}
        >
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              flexShrink: 0
            }}
          >
            {getToastConfig().icon}
          </div>
          <span style={{ whiteSpace: 'nowrap' }}>{toast.message}</span>
        </div>
      )}

      {/* Baris 1: Judul, Search, dan Tombol Tambah */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', height: '40px', marginRight: '-50px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '600', color: '#111', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#111', fontSize: '32px' }}><img src="/back.png" style={{transform: 'translateY(-3px)', width:'14px', height:'18px'}} alt="Kembali" /></Link> Kamar
        </h2>
        
        <div style={{display:'flex', alignItems:'center', height:'40px', width:'600px', gap:'12px'}}>
          <div style={{position:'relative', height:'40px'}}>
            <img src="/search.png" alt="Cari" style={{position:'absolute', left:'18px', top:'50%', transform:'translateY(-50%)', width:'14px', height:'14px', objectFit:'contain'}}/>
            <input type="text" placeholder="Cari Nomor Kamar" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{...filterInputStyle, width:'294.11px', height:'40px', boxSizing:'border-box', padding:'0px 12px 0px 41px', fontSize:'14px', fontWeight:'600', color:'#4f575e', border:'1px solid #d9d9d9', borderRadius:'4px', outline:'none'}}/>
          </div>
          <Link to="/kamar/tambah" style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'12px', backgroundColor:'#fe6f01', width:'243.13px', height:'40px', color:'#fff', textDecoration:'none', padding:'0px', borderRadius:'4px', fontWeight:'600', fontSize:'14px', boxSizing:'border-box'}}>Tambah Kamar<img src="/plus.png" alt="Tambah" style={{width:'13px', height:'13px', objectFit:'contain'}}/></Link>
        </div>
      </div>

      {/* Baris 2: Dropdown Filters */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', height: '40px' }}>

        {/* Filter Lantai */}
        <div style={{ position: 'relative', flex: 1 }}>
          <select className="filter-select" style={{ ...filterInputStyle, width: '100%', fontWeight: '600', padding: '0px 16px', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none' }} value={filterLantai} onChange={(e) => setFilterLantai(e.target.value)}>
            <option value="">Pilih Lantai</option>
            {uniqueLantai.map((l) => (<option key={l} value={l}>{l}</option>))}
          </select>

          <img src="/down.png" alt="" style={{ position: 'absolute', right: '14px', top: '55%', transform: 'translateY(-50%)', width: '11px', height: '11px', pointerEvents: 'none' }} />
        </div>

        {/* Filter Status */}
        <div style={{ position: 'relative', flex: 1 }}>
          <select className="filter-select" style={{ ...filterInputStyle, width: '100%', fontWeight: '600', padding: '0px 16px', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none' }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Pilih Status Ketersediaan</option>
            <option value="TERISI">TERISI</option>
            <option value="KOSONG">KOSONG</option>
          </select>

          <img src="/down.png" alt="" style={{ position: 'absolute', right: '14px', top: '55%', transform: 'translateY(-50%)', width: '11px', height: '11px', pointerEvents: 'none' }} />
        </div>

        {/* Filter Tipe Kamar */}
        <div style={{ position: 'relative', flex: 1 }}>
          <select className="filter-select" style={{ ...filterInputStyle, width: '100%', fontWeight: '600', padding: '0px 16px', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none' }} value={filterTipe} onChange={(e) => setFilterTipe(e.target.value)}>
            <option value="">Pilih Tipe Kamar</option>
            <option value="AC">AC</option>
            <option value="NON AC">NON AC</option>
          </select>

          <img src="/down.png" alt="" style={{ position: 'absolute', right: '14px', top: '55%', transform: 'translateY(-50%)', width: '11px', height: '11px', pointerEvents: 'none' }}/>
        </div>

      </div>

      {/* Baris 3: Tabel */}
      <div style={{ backgroundColor: '#fff', border: '1px solid #e6e6e6', borderRadius: '4px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr>
              <th className="sortable-header" style={{...tableHeaderStyle, padding:'0px 24px', color:sortConfig.key==='No_Kamar'?'#083487':'#555'}} onClick={()=>requestSort('No_Kamar')}>Nomor Kamar<img src="/sort.png" style={{width:'12px', height:'12px', marginLeft:'6px'}} alt="Sort" /></th>
              <th className="sortable-header" style={{...tableHeaderStyle, padding:'0px 24px', width:'136.19px', color:sortConfig.key==='Harga'?'#083487':'#555'}} onClick={()=>requestSort('Harga')}>Harga<img src="/sort.png" style={{width:'12px', height:'12px', marginLeft:'6px'}} alt="Sort" /></th>
              <th className="sortable-header" style={{...tableHeaderStyle, padding:'0px 20px', width:'115.98px', color:sortConfig.key==='Lantai'?'#083487':'#555'}} onClick={()=>requestSort('Lantai')}>Lantai<img src="/sort.png" style={{width:'12px', height:'12px', marginLeft:'6px'}} alt="Sort" /></th>
              <th className="sortable-header" style={{...tableHeaderStyle, padding:'0px 20px', width:'193.53px', color:sortConfig.key==='Status_Ketersediaan'?'#083487':'#555'}} onClick={()=>requestSort('Status_Ketersediaan')}>Status Ketersediaan<img src="/sort.png" style={{width:'12px', height:'12px', marginLeft:'6px'}} alt="Sort" /></th>
              <th className="sortable-header" style={{...tableHeaderStyle, padding:'0px 20px', width:'134.82px', color:sortConfig.key==='Tipe_Kamar'?'#083487':'#555'}} onClick={()=>requestSort('Tipe_Kamar')}>Tipe Kamar<img src="/sort.png" style={{width:'12px', height:'12px', marginLeft:'6px'}} alt="Sort" /></th>
              <th style={{...tableHeaderStyle, padding:'0px 20px', width:'456.21px', cursor:'default', textAlign:'center'}}>Action</th>
            </tr>
          </thead>

          {currentRooms.length > 0 && (
            <tbody>
              {currentRooms.map(room => (
                <tr key={room.Kamar_ID}>
                  <td style={tableDataStyle}>{room.No_Kamar}</td>
                  <td style={tableDataStyle}>Rp {room.Harga.toLocaleString('id-ID')}</td>
                  <td style={tableDataStyle}>{room.Lantai}</td>
                  <td style={tableDataStyle}>{room.Status_Ketersediaan}</td>
                  <td style={tableDataStyle}>{room.Tipe_Kamar}</td>

                  <td style={tableDataStyle}>
                    <Link
                      to={`/kamar/detail/${room.Kamar_ID}`}
                      style={{
                        ...btnStyle,
                        backgroundColor: '#3d91fe',
                        height: '40px',
                        width: '87.4px',
                        gap: '6px'
                      }}
                    >
                      Detail
                      <img src="/view.png" style={{width:'18px', height:'14px'}} alt="Detail" />
                    </Link>

                    <Link
                      to={`/kamar/edit/${room.Kamar_ID}`}
                      style={{
                        ...btnStyle,
                        backgroundColor: '#feb941',
                        height: '40px',
                        width: '71.58px',
                        margin: '0px 0px 0px 10px',
                        gap: '3px'
                      }}
                    >
                      Edit
                      <img src="/pen.png" style={{width:'14px', height:'12px'}} alt="Edit" />
                    </Link>

                    <Link
                      to={`/kamar/${room.Kamar_ID}/pembayaran`}
                      style={{
                        ...btnStyle,
                        backgroundColor: '#479f45',
                        height: '40px',
                        width:'137.15px',
                        margin: '0px 0px 0px 10px',
                        gap: '10px'
                      }}
                    >
                      Pembayaran
                      <img src="/card.png" style={{width:'22px', height:'18px'}} alt="Pembayaran" />
                    </Link>

                    <button
                      onClick={() => openDeleteModal(room.Kamar_ID)}
                      style={{
                        ...btnStyle,
                        backgroundColor: '#f00',
                        height: '40px',
                        width:'90.09px',
                        margin: '0px 0px 0px 10px',
                        gap: '5px'
                      }}
                    >
                      Hapus
                      <img src="/trash.png" style={{width:'14px', height:'14px'}} alt="Hapus" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {/* Pesan jika tidak ada data */}
      {processedRooms.length === 0 && (
        <div
          style={{
            marginTop: '0px',
            fontSize: '14px',
            color: '#111'
          }}
        >
          Tidak ada data yang ditampilkan
        </div>
      )}

      {/* Footer Info & Pagination */}
      {processedRooms.length > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            marginTop: '22px'
          }}
        >
          <div
            style={{
              fontSize: '14px',
              color: '#6a7178'
            }}
          >
            {`${startIndex + 1} to ${Math.min(endIndex, processedRooms.length)} of ${processedRooms.length} items`}
          </div>

          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              {/* Previous */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  width: '32px',
                  height: '32px',
                  border: '1px solid #e0e4e8',
                  borderRadius: '4px',
                  backgroundColor: '#fff',
                  color: currentPage === 1 ? '#c5cbd1' : '#4f575e',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span style={{ transform: 'translateY(-3px)' }}>‹</span>
              </button>

              {/* Nomor halaman */}
              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              ).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={{
                    width: '32px',
                    height: '32px',
                    border: currentPage === page
                      ? '1px solid #083487'
                      : '1px solid #e0e4e8',
                    borderRadius: '4px',
                    backgroundColor: '#fff',
                    color: currentPage === page
                      ? '#083487'
                      : '#4f575e',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: currentPage === page ? '600' : '400',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {page}
                </button>
              ))}

              {/* Next */}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  width: '32px',
                  height: '32px',
                  border: '1px solid #e0e4e8',
                  borderRadius: '4px',
                  backgroundColor: '#fff',
                  color: currentPage === totalPages ? '#c5cbd1' : '#4f575e',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
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

      {/* POP-UP MODAL KONFIRMASI HAPUS */}
      {showDeleteModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#00000040',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <div
            className="popup-dialog"
            style={{
              backgroundColor: '#FFFFFF',
              width: '500px',
              height: '132px',
              padding: '24px',
              margin: '24px',
              borderRadius: '4px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              textAlign: 'center'
            }}
          >
            <p
              style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#272b30',
                margin: 0
              }}
            >
              Apakah yakin ingin menghapus data ini?
            </p>

            <div
              style={{
                display: 'flex',
                gap: '16px',
                justifyContent: 'center'
              }}
            >
              <button
                onClick={closeDeleteModal}
                style={{
                  flex: 1,
                  height: '40px',
                  backgroundColor: '#fff',
                  color: '#f00',
                  border: '1px solid #f00',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Batal
              </button>

              <button
                onClick={handleConfirmDelete}
                style={{
                  flex: 1,
                  height: '40px',
                  backgroundColor: '#f00',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Kamar;