import React, { useEffect, useState, useMemo } from 'react';
import { getExpenses, deleteExpense } from '../services/api';
import { Link } from 'react-router-dom';

const Pengeluaran = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // State Banner Notifikasi
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // State Modal Konfirmasi Hapus
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);

  // State untuk Filter, Search, dan Sort
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Helper menampilkan banner notifikasi
  const showNotification = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const data = await getExpenses();
      setExpenses(data);
      setLoading(false);
    } catch (err) {
      showNotification('Gagal memuat data pengeluaran.', 'error');
      setLoading(false);
    }
  };

  // Fungsi Buka Pop-Up Modal Konfirmasi
  const openDeleteModal = (id) => {
    setSelectedExpenseId(id);
    setShowDeleteModal(true);
  };

  // Fungsi Batal Hapus
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedExpenseId(null);
  };

  // Fungsi Eksekusi Hapus saat Konfirmasi di Modal
  const handleConfirmDelete = async () => {
    if (!selectedExpenseId) return;
    try {
      await deleteExpense(selectedExpenseId);
      closeDeleteModal();
      showNotification('Data Berhasil Dihapus', 'success');
      fetchExpenses();
    } catch (err) {
      closeDeleteModal();
      showNotification('Terjadi kesalahan saat menghapus data.', 'error');
    }
  };

  // Fungsi memformat tanggal (ex: "16 Aug 2026")
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Logika Filter, Search Tanggal, dan Sort
  const processedExpenses = useMemo(() => {
    let sortable = [...expenses];

    // 1. Search berdasarkan format tanggal
    if (searchTerm) {
      sortable = sortable.filter(e => {
        const formattedDate = formatDate(e.Tgl_Pengeluaran).toLowerCase();
        return formattedDate.includes(searchTerm.toLowerCase());
      });
    }

    // 2. Filter Kategori
    if (filterKategori) {
      sortable = sortable.filter(e => e.Kategori === filterKategori);
    }

    // 3. Sort Data
    if (sortConfig.key !== null) {
      sortable.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [expenses, searchTerm, filterKategori, sortConfig]);

  // PAGINATION
  const totalPages = Math.ceil(processedExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentExpenses = processedExpenses.slice(startIndex, endIndex);

  // Kembali ke halaman 1 ketika search/filter/sort berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterKategori, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  // Ambil data unik untuk dropdown kategori
  const uniqueKategori = [...new Set(expenses.map(item => item.Kategori))];

  // Styling Variables
  const tableHeaderStyle = { padding: '0px 24px', borderBottom: '1px solid #e0e0e0', fontWeight: '600', color: '#4f575e', fontSize: '14px', cursor: 'pointer', userSelect: 'none', height: '48px' };
  const tableDataStyle = { padding: '8px 24px', borderBottom: '1px solid #e0e0e0', fontSize: '14px', color: '#272b30', height: '56px' };
  const btnStyle = { display: 'inline-flex', alignItems: 'center', color: 'white', border: 'none', padding: '0px 16px', borderRadius: '4px', cursor: 'pointer', textDecoration: 'none', fontSize: '14px', fontWeight: '600', height: '40px' };
  const filterInputStyle = { padding: '10px 15px', borderRadius: '4px', border: '1px solid #d9d9d9', fontSize: '14px', width: '100%', outline: 'none', color: '#4f575e', backgroundColor: '#fff' };

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '1200px', marginBottom: '32px', height: '40px', marginRight: '-50px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '600', color: '#111', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#111', fontSize: '24px' }}><img src="/back.png" style={{width:'14px', height:'18px'}} alt="Kembali" /></Link> Pengeluaran
        </h2>
        
        <div style={{ display: 'flex', alignItems: 'center', width: '600px', margin: '0px 0px 0px 32px' }}>
          <div style={{ position: 'relative', width: '345.09px' }}>
            <img src="/search.png" alt="Cari" style={{position:'absolute', left:'18px', top:'50%', transform:'translateY(-50%)', width:'14px', height:'14px', objectFit:'contain'}}/>
            <input 
              type="text" 
              placeholder="Cari Tanggal" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ ...filterInputStyle, height:'40px', boxSizing:'border-box', padding:'0px 12px 0px 41px', fontSize:'14px', fontWeight:'600', color:'#4f575e', border:'1px solid #d9d9d9', borderRadius:'4px', outline:'none'}} 
            />
          </div>
          <Link to="/pengeluaran/tambah" style={{ justifyContent: 'center', backgroundColor: '#fe6f01', width: '243px', height: '40px', color: 'white', textDecoration: 'none', padding: '0px', borderRadius: '4px', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '12px', margin: '0px 0px 0px 11.7625px'}}>
            Tambah Pengeluaran <span style={{ fontSize: '16px' }}><img src="/plus.png" style={{width:'12.5px', height:'12.5px'}} alt="Tambah" /></span>
          </Link>
        </div>
      </div>

      {/* Baris 2: Dropdown Filter Full Width */}
      <div style={{ marginBottom: '20px', position: 'relative' }}>
        <select className="filter-select" style={{ padding: '0px 16px', borderRadius: '4px', flex: 1, fontWeight: '600', color: '#272b30', width: '1200px', height: '40px', fontSize: '14px', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none' }} value={filterKategori} onChange={(e) => setFilterKategori(e.target.value)}>
          <option value="">Pilih Kategori</option>
          {uniqueKategori.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
        <img src="/down.png" alt="" style={{ position: 'absolute', right: '14px', top: '55%', transform: 'translateY(-50%)', width: '11px', height: '11px', pointerEvents: 'none' }} />
      </div>

      {/* Baris 3: Tabel */}
      <div style={{ backgroundColor: '#fff', border: '1px solid #e6e6e6', borderRadius: '4px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr>
              <th className="sortable-header" style={{...tableHeaderStyle, width:'207.48px', color:sortConfig.key==='Tgl_Pengeluaran'?'#083487':'#4f575e'}} onClick={()=>requestSort('Tgl_Pengeluaran')}>Tanggal Pengeluaran<img src="/sort.png" style={{width:'12px', height:'12px', marginLeft:'6px'}} alt="Sort" /></th>
              <th className="sortable-header" style={{...tableHeaderStyle, width:'165.48px', color:sortConfig.key==='Kategori'?'#083487':'#4f575e'}} onClick={()=>requestSort('Kategori')}>Kategori<img src="/sort.png" style={{width:'12px', height:'12px', marginLeft:'6px'}} alt="Sort" /></th>
              <th className="sortable-header" style={{...tableHeaderStyle, width:'150.57px', color:sortConfig.key==='Nominal'?'#083487':'#4f575e'}} onClick={()=>requestSort('Nominal')}>Nominal<img src="/sort.png" style={{width:'12px', height:'12px', marginLeft:'6px'}} alt="Sort" /></th>
              <th className="sortable-header" style={{...tableHeaderStyle, width:'300px', color:sortConfig.key==='Deskripsi'?'#083487':'#4f575e'}} onClick={()=>requestSort('Deskripsi')}>Deskripsi<img src="/sort.png" style={{width:'12px', height:'12px', marginLeft:'6px'}} alt="Sort" /></th>
              <th className="sortable-header" style={{...tableHeaderStyle, width:'137.35px', color:sortConfig.key==='No_Kamar'?'#083487':'#4f575e'}} onClick={()=>requestSort('No_Kamar')}>No Kamar<img src="/sort.png" style={{width:'12px', height:'12px', marginLeft:'6px'}} alt="Sort" /></th>
              <th style={{...tableHeaderStyle, width:'237.53px', cursor:'default', textAlign:'center'}}>Action</th>
            </tr>
          </thead>

          {currentExpenses.length > 0 && (
            <tbody>
              {currentExpenses.map(exp => (
                <tr key={exp.Pengeluaran_ID}>
                  <td style={{...tableDataStyle, width:'207.48px'}}>{formatDate(exp.Tgl_Pengeluaran)}</td>
                  <td style={{...tableDataStyle, width:'165.48px'}}>{exp.Kategori}</td>
                  <td style={{...tableDataStyle, width:'150.57px'}}>Rp {exp.Nominal.toLocaleString('id-ID')}</td>
                  <td style={{...tableDataStyle, width:'300px'}}>{exp.Deskripsi}</td>
                  <td style={{...tableDataStyle, width:'137.35px'}}>{exp.No_Kamar}</td>
                  <td style={{...tableDataStyle, width:'237.53px'}}>
                    <Link to={`/pengeluaran/edit/${exp.Pengeluaran_ID}`} style={{ ...btnStyle, backgroundColor: '#feb941', height: '40px', width: '71.58px', gap: '3px'}}>Edit<img src="/pen.png" style={{width:'14px', height:'12px'}} alt="Edit" /></Link>
                    <button onClick={() => openDeleteModal(exp.Pengeluaran_ID)} style={{ ...btnStyle, backgroundColor: '#f00', height: '40px', width:'90.09px', margin: '0px 0px 0px 24px', gap: '5px'}}>Hapus<img src="/trash.png" style={{width:'14px', height:'14px'}} alt="Hapus" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {/* Pesan jika tidak ada data */}
      {processedExpenses.length === 0 && (
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
      {processedExpenses.length > 0 && (
        <div
          style={{
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            width: '100%',
            marginTop: '22px'
          }}
        >
          {/* Footer Info Items */}
          <div
            style={{
              fontSize: '14px',
              color: '#6a7178'
            }}
          >
            {`${startIndex + 1} to ${Math.min(endIndex, processedExpenses.length)} of ${processedExpenses.length} items`}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              {/* Previous Button */}
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
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={{
                    width: '32px',
                    height: '32px',
                    border: currentPage === page ? '1px solid #083487' : '1px solid #e0e4e8',
                    borderRadius: '4px',
                    backgroundColor: '#fff',
                    color: currentPage === page ? '#083487' : '#4f575e',
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

              {/* Next Button */}
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

export default Pengeluaran;