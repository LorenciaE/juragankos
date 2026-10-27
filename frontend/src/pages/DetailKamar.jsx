
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRoomById, getTenants, getExpenses } from '../services/api';

const DetailKamar = () => {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sortTenant, setSortTenant] = useState({ key: null, direction: 'asc' });
  const [sortActivity, setSortActivity] = useState({ key: null, direction: 'asc' });

  const [currentTenantPage, setCurrentTenantPage] = useState(1);
  const [currentActivityPage, setCurrentActivityPage] = useState(1);
  const itemsPerPage = 10;

  // Membaca kolom yang mungkin menggunakan snake_case atau PascalCase
  const getValue = (data, snakeCase, pascalCase) =>
    data?.[snakeCase] ?? data?.[pascalCase] ?? '';

  const getRoomId = (data) =>
    getValue(data, 'kamar_id', 'Kamar_ID');

  const getTenantValue = (data, key) => {
    const keys = {
      Penyewa_ID: ['penyewa_id', 'Penyewa_ID'],
      Nama_Lengkap: ['nama_lengkap', 'Nama_Lengkap'],
      No_Hp: ['no_hp', 'No_Hp'],
      Tgl_Masuk: ['tgl_masuk', 'Tgl_Masuk'],
      Tgl_Keluar: ['tgl_keluar', 'Tgl_Keluar'],
      Status_Sewa: ['status_sewa', 'Status_Sewa'],
      Kamar_ID: ['kamar_id', 'Kamar_ID']
    };

    const [snakeCase, pascalCase] = keys[key] || [key, key];
    return getValue(data, snakeCase, pascalCase);
  };

  const getActivityValue = (data, key) => {
    const keys = {
      Pengeluaran_ID: ['pengeluaran_id', 'Pengeluaran_ID'],
      Tgl_Pengeluaran: ['tgl_pengeluaran', 'Tgl_Pengeluaran'],
      Deskripsi: ['deskripsi', 'Deskripsi'],
      Kamar_ID: ['kamar_id', 'Kamar_ID']
    };

    const [snakeCase, pascalCase] = keys[key] || [key, key];
    return getValue(data, snakeCase, pascalCase);
  };

  const getRoomValue = (data, key) => {
    const keys = {
      No_Kamar: ['no_kamar', 'No_Kamar'],
      Lantai: ['lantai', 'Lantai'],
      Status_Ketersediaan: [
        'status_ketersediaan',
        'Status_Ketersediaan'
      ]
    };

    const [snakeCase, pascalCase] = keys[key] || [key, key];
    return getValue(data, snakeCase, pascalCase);
  };

  useEffect(() => {
    const fetchDetailData = async () => {
      try {
        setLoading(true);

        const [roomData, allTenants, allExpenses] = await Promise.all([
          getRoomById(id),
          getTenants(),
          getExpenses()
        ]);

        console.log('Data kamar:', roomData);
        console.log('Data penyewa:', allTenants);
        console.log('Data pengeluaran:', allExpenses);

        setRoom(roomData);

        const roomId = String(id);

        const roomTenants = (Array.isArray(allTenants) ? allTenants : [])
          .filter((tenant) => String(getRoomId(tenant)) === roomId);

        setTenants(roomTenants);

        const roomExpenses = (Array.isArray(allExpenses) ? allExpenses : [])
          .filter((expense) => String(getRoomId(expense)) === roomId);

        setActivities(roomExpenses);
      } catch (err) {
        console.error('Gagal memuat detail kamar:', err);
        setRoom(null);
        setTenants([]);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDetailData();
  }, [id]);

  // Format tanggal
  const formatDate = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Menghitung Kosong Sejak: H+1 dari tanggal keluar terakhir
  const getKosongSejak = () => {
    if (!room || getRoomValue(room, 'Status_Ketersediaan') !== 'KOSONG') {
      return null;
    }

    const tenantsWithExitDate = tenants.filter(
      (tenant) => getTenantValue(tenant, 'Tgl_Keluar')
    );

    if (tenantsWithExitDate.length === 0) return null;

    const lastTenant = tenantsWithExitDate.reduce((latest, current) => {
      return new Date(getTenantValue(current, 'Tgl_Keluar')) >
        new Date(getTenantValue(latest, 'Tgl_Keluar'))
        ? current
        : latest;
    });

    const exitDate = new Date(getTenantValue(lastTenant, 'Tgl_Keluar'));
    const kosongSejakDate = new Date(exitDate);
    kosongSejakDate.setDate(kosongSejakDate.getDate() + 1);

    return formatDate(kosongSejakDate);
  };

  // Masking nomor telepon
  const maskPhoneNumber = (phone) => {
    if (!phone) return '-';

    const phoneStr = String(phone);

    if (phoneStr.length >= 8) {
      return phoneStr.slice(0, 4) + '****' + phoneStr.slice(-4);
    }

    return phoneStr;
  };

  // Sorting riwayat penyewa
  const processedTenants = useMemo(() => {
    const sortable = [...tenants];

    if (sortTenant.key !== null) {
      sortable.sort((a, b) => {
        const valueA = getTenantValue(a, sortTenant.key);
        const valueB = getTenantValue(b, sortTenant.key);

        if (valueA < valueB) return sortTenant.direction === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortTenant.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return sortable;
  }, [tenants, sortTenant]);

  const requestSortTenant = (key) => {
    let direction = 'asc';

    if (sortTenant.key === key && sortTenant.direction === 'asc') {
      direction = 'desc';
    }

    setSortTenant({ key, direction });
  };

  const totalTenantPages = Math.ceil(processedTenants.length / itemsPerPage);
  const tenantStartIndex = (currentTenantPage - 1) * itemsPerPage;
  const tenantEndIndex = tenantStartIndex + itemsPerPage;
  const currentTenants = processedTenants.slice(
    tenantStartIndex,
    tenantEndIndex
  );

  useEffect(() => {
    setCurrentTenantPage(1);
  }, [sortTenant, id]);

  // Sorting aktivitas kamar
  const processedActivities = useMemo(() => {
    const sortable = [...activities];

    if (sortActivity.key !== null) {
      sortable.sort((a, b) => {
        const valueA = getActivityValue(a, sortActivity.key);
        const valueB = getActivityValue(b, sortActivity.key);

        if (valueA < valueB) return sortActivity.direction === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortActivity.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return sortable;
  }, [activities, sortActivity]);

  const requestSortActivity = (key) => {
    let direction = 'asc';

    if (sortActivity.key === key && sortActivity.direction === 'asc') {
      direction = 'desc';
    }

    setSortActivity({ key, direction });
  };

  const totalActivityPages = Math.ceil(
    processedActivities.length / itemsPerPage
  );
  const activityStartIndex = (currentActivityPage - 1) * itemsPerPage;
  const activityEndIndex = activityStartIndex + itemsPerPage;
  const currentActivities = processedActivities.slice(
    activityStartIndex,
    activityEndIndex
  );

  useEffect(() => {
    setCurrentActivityPage(1);
  }, [sortActivity, id]);

  // Styling
  const cardStyle = {
    backgroundColor: '#fff',
    borderRadius: '4px',
    padding: '20px',
    marginBottom: '24px'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    color: '#4f575e',
    marginBottom: '8px',
    fontWeight: 'bold'
  };

  const readOnlyInputStyle = {
    width: '100%',
    height: '40px',
    padding: '0px 16px',
    backgroundColor: '#f9f9f9',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    color: '#888',
    fontSize: '14px',
    outline: 'none',
    marginBottom: '10px'
  };

  const thStyle = {
    padding: '0px 24px',
    borderBottom: '1px solid #e0e0e0',
    fontWeight: 'bold',
    color: '#4f575e',
    fontSize: '14px',
    cursor: 'pointer',
    userSelect: 'none',
    textAlign: 'left',
    height: '48px'
  };

  const tdStyle = {
    padding: '8px 24px',
    borderBottom: '1px solid #e0e0e0',
    fontSize: '14px',
    color: '#272b30',
    height: '56px'
  };

  const cardTitleStyle = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#222',
    marginBottom: '20px'
  };

  const paginationButtonStyle = (disabled) => ({
    width: '32px',
    height: '32px',
    border: '1px solid #e0e4e8',
    borderRadius: '4px',
    backgroundColor: '#fff',
    color: disabled ? '#c5cbd1' : '#4f575e',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  });

  const pageButtonStyle = (active) => ({
    width: '32px',
    height: '32px',
    border: active ? '1px solid #083487' : '1px solid #e0e4e8',
    borderRadius: '4px',
    backgroundColor: '#fff',
    color: active ? '#083487' : '#4f575e',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: active ? '600' : '400',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  });

  const renderPagination = (
    currentPage,
    totalPages,
    setPage,
    startIndex,
    endIndex,
    totalItems
  ) => {
    if (totalItems === 0) return null;

    return (
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
          {`${startIndex + 1} to ${Math.min(endIndex, totalItems)} of ${totalItems} items`}
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={paginationButtonStyle(currentPage === 1)}
            >
              <span style={{ transform: 'translateY(-3px)' }}>‹</span>
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => setPage(page)}
                  style={pageButtonStyle(currentPage === page)}
                >
                  {page}
                </button>
              )
            )}

            <button
              onClick={() =>
                setPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              style={paginationButtonStyle(currentPage === totalPages)}
            >
              <span style={{ transform: 'translateY(-3px)' }}>›</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <p style={{ padding: '20px' }}>Memuat profil kamar...</p>;
  }

  if (!room) {
    return <p style={{ padding: '20px' }}>Data kamar tidak ditemukan.</p>;
  }

  const statusKamar = getRoomValue(room, 'Status_Ketersediaan');
  const tglKosongSejak = getKosongSejak();

  return (
    <div>
      {/* Header */}
      <h2
        style={{
          fontSize: '32px',
          fontWeight: '600',
          color: '#111',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '24px'
        }}
      >
        <Link
          to="/kamar"
          style={{
            textDecoration: 'none',
            color: '#111',
            fontSize: '24px'
          }}
        >
          <img
            src="/back.png"
            alt="Kembali"
            style={{ width: '14px', height: '18px' }}
          />
        </Link>
        Profil Kamar
      </h2>

      {/* Bagian 1: Informasi Kamar */}
      <div style={{ ...cardStyle, marginTop: '28px' }}>
        <h3 style={{ ...cardTitleStyle, margin: '0px 0px 10px' }}>
          Informasi Kamar
        </h3>

        <label style={labelStyle}>Nomor Kamar</label>
        <input
          type="text"
          value={getRoomValue(room, 'No_Kamar')}
          readOnly
          style={{
            ...readOnlyInputStyle,
            backgroundColor: '#f1f3f5',
            color: '#adb5bd'
          }}
        />

        <label style={labelStyle}>Lantai</label>
        <input
          type="text"
          value={getRoomValue(room, 'Lantai')}
          readOnly
          style={{
            ...readOnlyInputStyle,
            backgroundColor: '#f1f3f5',
            color: '#adb5bd'
          }}
        />

        <label style={labelStyle}>Status Ketersediaan Kamar</label>
        <input
          type="text"
          value={statusKamar}
          readOnly
          style={{
            ...readOnlyInputStyle,
            backgroundColor: '#f1f3f5',
            color: '#adb5bd',
            marginBottom: statusKamar === 'KOSONG' ? '4px' : '10px'
          }}
        />

        {statusKamar === 'KOSONG' && tglKosongSejak && (
          <p
            style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#000000',
              marginTop: '5px',
              marginBottom: '0px'
            }}
          >
            Kosong Sejak: {tglKosongSejak} - Sekarang
          </p>
        )}
      </div>

      {/* Bagian 2: Riwayat Penyewa */}
      <div style={{ ...cardStyle, marginTop: '32px' }}>
        <h3 style={{ ...cardTitleStyle, marginBottom: '10px' }}>
          Riwayat Penyewa
        </h3>

        <div
          style={{
            border: '1px solid #e6e6e6',
            borderRadius: '4px',
            backgroundColor: '#fff'
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th
                  className="sortable-header"
                  style={{
                    ...thStyle,
                    color: sortTenant.key === 'Nama_Lengkap' ? '#083487' : '#4f575e'
                  }}
                  onClick={() => requestSortTenant('Nama_Lengkap')}
                >
                  Nama
                  <img
                    src="/sort.png"
                    alt="Sort"
                    style={{ width: '12px', height: '12px', marginLeft: '6px' }}
                  />
                </th>
                <th
                  className="sortable-header"
                  style={{
                    ...thStyle,
                    color: sortTenant.key === 'No_Hp' ? '#083487' : '#4f575e'
                  }}
                  onClick={() => requestSortTenant('No_Hp')}
                >
                  No Telepon
                  <img
                    src="/sort.png"
                    alt="Sort"
                    style={{ width: '12px', height: '12px', marginLeft: '6px' }}
                  />
                </th>
                <th
                  className="sortable-header"
                  style={{
                    ...thStyle,
                    color: sortTenant.key === 'Tgl_Masuk' ? '#083487' : '#4f575e'
                  }}
                  onClick={() => requestSortTenant('Tgl_Masuk')}
                >
                  Tanggal Masuk
                  <img
                    src="/sort.png"
                    alt="Sort"
                    style={{ width: '12px', height: '12px', marginLeft: '6px' }}
                  />
                </th>
                <th
                  className="sortable-header"
                  style={{
                    ...thStyle,
                    color: sortTenant.key === 'Tgl_Keluar' ? '#083487' : '#4f575e'
                  }}
                  onClick={() => requestSortTenant('Tgl_Keluar')}
                >
                  Tanggal Keluar
                  <img
                    src="/sort.png"
                    alt="Sort"
                    style={{ width: '12px', height: '12px', marginLeft: '6px' }}
                  />
                </th>
                <th
                  className="sortable-header"
                  style={{
                    ...thStyle,
                    color: sortTenant.key === 'Status_Sewa' ? '#083487' : '#4f575e'
                  }}
                  onClick={() => requestSortTenant('Status_Sewa')}
                >
                  Status Sewa
                  <img
                    src="/sort.png"
                    alt="Sort"
                    style={{ width: '12px', height: '12px', marginLeft: '6px' }}
                  />
                </th>
              </tr>
            </thead>

            {currentTenants.length > 0 && (
              <tbody>
                {currentTenants.map((tenant, index) => (
                  <tr
                    key={
                      getTenantValue(tenant, 'Penyewa_ID') ||
                      `${getTenantValue(tenant, 'Nama_Lengkap')}-${index}`
                    }
                  >
                    <td style={tdStyle}>
                      {getTenantValue(tenant, 'Nama_Lengkap')}
                    </td>
                    <td style={tdStyle}>
                      {maskPhoneNumber(getTenantValue(tenant, 'No_Hp'))}
                    </td>
                    <td style={tdStyle}>
                      {formatDate(getTenantValue(tenant, 'Tgl_Masuk'))}
                    </td>
                    <td style={tdStyle}>
                      {formatDate(getTenantValue(tenant, 'Tgl_Keluar'))}
                    </td>
                    <td style={tdStyle}>
                      {getTenantValue(tenant, 'Status_Sewa')}
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>

        {processedTenants.length === 0 && (
          <div style={{ marginTop: '0px', fontSize: '14px', color: '#111' }}>
            Tidak ada data yang ditampilkan
          </div>
        )}

        {renderPagination(
          currentTenantPage,
          totalTenantPages,
          setCurrentTenantPage,
          tenantStartIndex,
          tenantEndIndex,
          processedTenants.length
        )}
      </div>

      {/* Bagian 3: Aktivitas Kamar */}
      <div style={cardStyle}>
        <h3 style={{ ...cardTitleStyle, marginBottom: '10px' }}>
          Aktivitas Kamar
        </h3>

        <div
          style={{
            border: '1px solid #e6e6e6',
            borderRadius: '4px',
            backgroundColor: '#fff'
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th
                  className="sortable-header"
                  style={{
                    ...thStyle,
                    color: sortActivity.key === 'Tgl_Pengeluaran' ? '#083487' : '#4f575e'
                  }}
                  onClick={() => requestSortActivity('Tgl_Pengeluaran')}
                >
                  Tanggal
                  <img
                    src="/sort.png"
                    alt="Sort"
                    style={{ width: '12px', height: '12px', marginLeft: '6px' }}
                  />
                </th>
                <th
                  className="sortable-header"
                  style={{
                    ...thStyle,
                    width: '602.83px',
                    color: sortActivity.key === 'Deskripsi' ? '#083487' : '#4f575e'
                  }}
                  onClick={() => requestSortActivity('Deskripsi')}
                >
                  Deskripsi
                  <img
                    src="/sort.png"
                    alt="Sort"
                    style={{ width: '12px', height: '12px', marginLeft: '6px' }}
                  />
                </th>
              </tr>
            </thead>

            {currentActivities.length > 0 && (
              <tbody>
                {currentActivities.map((activity, index) => (
                  <tr
                    key={
                      getActivityValue(activity, 'Pengeluaran_ID') ||
                      `${getActivityValue(activity, 'Tgl_Pengeluaran')}-${index}`
                    }
                  >
                    <td style={tdStyle}>
                      {formatDate(getActivityValue(activity, 'Tgl_Pengeluaran'))}
                    </td>
                    <td style={tdStyle}>
                      {getActivityValue(activity, 'Deskripsi')}
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>

        {processedActivities.length === 0 && (
          <div style={{ marginTop: '0px', fontSize: '14px', color: '#111' }}>
            Tidak ada data yang ditampilkan
          </div>
        )}

        {renderPagination(
          currentActivityPage,
          totalActivityPages,
          setCurrentActivityPage,
          activityStartIndex,
          activityEndIndex,
          processedActivities.length
        )}
      </div>
    </div>
  );
};

export default DetailKamar;
