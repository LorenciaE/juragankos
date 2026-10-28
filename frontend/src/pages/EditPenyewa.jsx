
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getTenantById, updateTenant, getRooms } from '../services/api';

const EditPenyewa = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    Nama_Lengkap: '',
    No_Hp: '',
    Tgl_Masuk: '',
    Tgl_Keluar: '',
    Kamar_ID: '',
    Status_Sewa: ''
  });

  const [displayNoHp, setDisplayNoHp] = useState('');
  const [rooms, setRooms] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [roomsData, tenantData] = await Promise.all([
          getRooms(),
          getTenantById(id)
        ]);

        if (!isMounted) return;

        setRooms(roomsData);

        const rawTglMasuk =
          tenantData.tgl_masuk ??
          tenantData.Tgl_Masuk ??
          '';

        const rawTglKeluar =
          tenantData.tgl_keluar ??
          tenantData.Tgl_Keluar ??
          '';

        const tglMasuk = rawTglMasuk
          ? String(rawTglMasuk).split('T')[0]
          : '';

        const tglKeluar = rawTglKeluar
          ? String(rawTglKeluar).split('T')[0]
          : '';

        const noHpLama = String(
          tenantData.no_hp ??
          tenantData.No_Hp ??
          ''
        );

        setFormData({
          Nama_Lengkap:
            tenantData.nama_lengkap ??
            tenantData.Nama_Lengkap ??
            '',
          No_Hp: noHpLama,
          Tgl_Masuk: tglMasuk,
          Tgl_Keluar: tglKeluar,
          Kamar_ID: String(
            tenantData.kamar_id ??
            tenantData.Kamar_ID ??
            ''
          ),
          Status_Sewa:
            tenantData.status_sewa ??
            tenantData.Status_Sewa ??
            ''
        });

        setDisplayNoHp(noHpLama);
      } catch (err) {
        console.error('Gagal memuat data penyewa:', err);

        if (isMounted) {
          setErrorMessage('Gagal memuat data penyewa.');
        }
      } finally {
        if (isMounted) {
          setLoadingData(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [id]);

    const maskPhoneNumber = (phone) => {
      const cleanPhone = String(phone ?? '').replace(/\D/g, '');

      if (cleanPhone.length <= 7) return cleanPhone;

      const start = cleanPhone.slice(0, 4);
      const end = cleanPhone.slice(-3);
      const maskedLength = cleanPhone.length - 7;

      return `${start}${'*'.repeat(maskedLength)}${end}`;
    };

    const handleChange = (e) => {
      const { name, value } = e.target;

      if (name === 'No_Hp') {
        const cleanedValue = value.replace(/[^\d*]/g, '');

        setDisplayNoHp(cleanedValue);

        setFormData((prev) => ({
          ...prev,
          No_Hp: cleanedValue
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value
        }));
      }

      setFieldErrors((prev) => ({
        ...prev,
        [name]: false
      }));

      setErrorMessage('');
    };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    const errors = {};

    if (!formData.Nama_Lengkap.trim()) {
      errors.Nama_Lengkap = true;
    }

    if (!String(formData.No_Hp ?? '').trim()) {
      errors.No_Hp = true;
    }

    if (!formData.Tgl_Masuk) {
      errors.Tgl_Masuk = true;
    }

    if (!formData.Kamar_ID) {
      errors.Kamar_ID = true;
    }

    if (!formData.Status_Sewa) {
      errors.Status_Sewa = true;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage('Mohon lengkapi data');
      return;
    }

    try {
      const payload = {
        ...formData,
        No_Hp: maskPhoneNumber(formData.No_Hp),
        Tgl_Keluar: formData.Tgl_Keluar || null
      };

      await updateTenant(id, payload);

      setSuccessMessage('Data Berhasil Ditambahkan / Diedit');

      setTimeout(() => {
        navigate('/penyewa');
      }, 1500);
    } catch (err) {
      console.error('Gagal mengedit data penyewa:', err);

      const msg =
        err.response?.data?.message ||
        'Terjadi kesalahan pada server';

      setErrorMessage(msg);
    }
  };

  if (loadingData) {
    return (
      <p style={{ padding: '20px' }}>
        Memuat data...
      </p>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* BANNER ERROR */}
      {errorMessage && (
        <div
          role="alert"
          className="feedback-message feedback-message-error feedback-message-autoclose"
          style={{
            position: 'fixed',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '59px',
            padding: '16px',
            backgroundColor: '#dc2020',
            color: '#ffffff',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxSizing: 'border-box',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 10000,
            fontSize: '16px',
            fontWeight: '600'
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
              fontWeight: '600',
              flexShrink: 0
            }}
          >
            ✕
          </div>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* BANNER SUCCESS */}
      {successMessage && (
        <div
          role="alert"
          className="feedback-message feedback-message-success feedback-message-autoclose"
          style={{
            position: 'fixed',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '59px',
            padding: '16px',
            backgroundColor: '#29823B',
            color: '#ffffff',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxSizing: 'border-box',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 10000,
            fontSize: '16px',
            fontWeight: '600'
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
              fontWeight: '600',
              flexShrink: 0
            }}
          >
            ✓
          </div>
          <span>{successMessage}</span>
        </div>
      )}

      <h2
        style={{
          fontSize: '32px',
          color: '#111',
          fontWeight: '600',
          marginBottom: '32px',
          margin: '-2px'
        }}
      >
        Edit Penyewa
      </h2>

      <div
        style={{
          display: 'flex',
          gap: '20px',
          marginTop: '32px'
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '4px',
            border: '0.8px solid #d9dee3',
            width: '592px',
            height: '667.6px'
          }}
        >
          <form onSubmit={handleSubmit}>
            {/* NAMA */}
            <div
              style={{
                marginBottom: fieldErrors.Nama_Lengkap ? '4px' : '24px'
              }}
            >
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#4f575e',
                  height: '21px'
                }}
              >
                Nama <span style={{ color: 'red' }}>*</span>
              </label>

              <input
                type="text"
                name="Nama_Lengkap"
                value={formData.Nama_Lengkap}
                onChange={handleChange}
                onFocus={(e) => {
                  e.target.style.border = '1px solid #053183';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.border = fieldErrors.Nama_Lengkap
                    ? '1px solid red'
                    : '1px solid #ccc';
                }}
                style={{
                  width: '100%',
                  padding: '0px 16px',
                  borderRadius: '4px',
                  border: fieldErrors.Nama_Lengkap
                    ? '0.8px solid red'
                    : '0.8px solid #ced4da',
                  height: '40px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />

              {fieldErrors.Nama_Lengkap && (
                <small
                  style={{
                    display: 'block',
                    color: 'red',
                    fontSize: '12px',
                    lineHeight: '16px',
                    marginTop: '4px'
                  }}
                >
                  This field is required.
                </small>
              )}
            </div>

            {/* NOMOR TELEPON */}
            <div
              style={{
                marginBottom: fieldErrors.No_Hp ? '4px' : '24px'
              }}
            >
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#4f575e',
                  height: '21px'
                }}
              >
                No Telepon <span style={{ color: 'red' }}>*</span>
              </label>

              <input
                type="text"
                name="No_Hp"
                value={displayNoHp}
                onChange={handleChange}
                onFocus={(e) => {
                  e.target.style.border = '1px solid #053183';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.border = fieldErrors.No_Hp
                    ? '1px solid red'
                    : '1px solid #ccc';
                }}
                style={{
                  width: '100%',
                  padding: '0px 16px',
                  borderRadius: '4px',
                  border: fieldErrors.No_Hp
                    ? '0.8px solid red'
                    : '0.8px solid #ced4da',
                  height: '40px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />

              {fieldErrors.No_Hp && (
                <small
                  style={{
                    display: 'block',
                    color: 'red',
                    fontSize: '12px',
                    lineHeight: '16px',
                    marginTop: '4px'
                  }}
                >
                  This field is required.
                </small>
              )}
            </div>

            {/* TANGGAL MASUK */}
            <div
              style={{
                marginBottom: fieldErrors.Tgl_Masuk ? '12px' : '34px'
              }}
            >
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#4f575e',
                  height: '21px'
                }}
              >
                Tanggal Masuk <span style={{ color: 'red' }}>*</span>
              </label>

              <input
                type="date"
                name="Tgl_Masuk"
                value={formData.Tgl_Masuk}
                onChange={handleChange}
                onFocus={(e) => {
                  e.target.style.border = '1px solid #053183';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.border = fieldErrors.Tgl_Masuk
                    ? '1px solid red'
                    : '1px solid #ccc';
                }}
                style={{
                  width: '100%',
                  padding: '0px 16px',
                  borderRadius: '4px',
                  border: fieldErrors.Tgl_Masuk
                    ? '0.8px solid red'
                    : '0.8px solid #ced4da',
                  height: '40px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />

              {fieldErrors.Tgl_Masuk && (
                <small
                  style={{
                    display: 'block',
                    color: 'red',
                    fontSize: '12px',
                    lineHeight: '16px',
                    marginTop: '4px'
                  }}
                >
                  This field is required.
                </small>
              )}
            </div>

            {/* TANGGAL KELUAR */}
            <div
              style={{
                marginBottom: fieldErrors.Tgl_Keluar ? '12px' : '34px'
              }}
            >
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#4f575e',
                  height: '21px'
                }}
              >
                Tanggal Keluar
              </label>

              <input
                type="date"
                name="Tgl_Keluar"
                value={formData.Tgl_Keluar}
                onChange={handleChange}
                onFocus={(e) => {
                  e.target.style.border = '1px solid #053183';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.border = fieldErrors.Tgl_Keluar
                    ? '1px solid red'
                    : '1px solid #ccc';
                }}
                style={{
                  width: '100%',
                  padding: '0px 16px',
                  borderRadius: '4px',
                  border: fieldErrors.Tgl_Keluar
                    ? '0.8px solid red'
                    : '0.8px solid #ced4da',
                  height: '40px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* NOMOR KAMAR */}
            <div
              style={{
                marginBottom: fieldErrors.Kamar_ID ? '6px' : '24px',
                position: 'relative'
              }}
            >
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#4f575e',
                  height: '21px'
                }}
              >
                Nomor Kamar <span style={{ color: 'red' }}>*</span>
              </label>

              <select
                name="Kamar_ID"
                value={formData.Kamar_ID}
                onChange={handleChange}
                onFocus={(e) => {
                  e.target.style.border = '1px solid #053183';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.border = fieldErrors.Kamar_ID
                    ? '1px solid red'
                    : '1px solid #ccc';
                }}
                style={{
                  appearance: 'none',
                  width: '100%',
                  padding: '0px 32px 0px 16px',
                  borderRadius: '4px',
                  border: fieldErrors.Kamar_ID
                    ? '0.8px solid red'
                    : '0.8px solid #ced4da',
                  height: '40px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  backgroundColor: '#fff'
                }}
              >
                <option value="" style={{ color: '#272b30' }}>
                  Pilih Nomor Kamar
                </option>

                {rooms.map((room) => (
                  <option
                    key={room.Kamar_ID ?? room.kamar_id}
                    value={room.Kamar_ID ?? room.kamar_id}
                  >
                    {room.No_Kamar ?? room.no_kamar}
                  </option>
                ))}
              </select>

              <img
                src="/down.png"
                alt=""
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '38px',
                  width: '11px',
                  height: '11px',
                  pointerEvents: 'none'
                }}
              />

              {fieldErrors.Kamar_ID && (
                <small
                  style={{
                    display: 'block',
                    color: 'red',
                    fontSize: '12px',
                    lineHeight: '16px',
                    marginTop: '4px'
                  }}
                >
                  This field is required.
                </small>
              )}
            </div>

            {/* STATUS SEWA */}
            <div
              style={{
                marginBottom: fieldErrors.Status_Sewa ? '4px' : '24px',
                position: 'relative'
              }}
            >
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  textShadow: '0.2px 0 currentColor',
                  fontSize: '14px',
                  color: '#4f575e',
                  height: '21px'
                }}
              >
                Status Sewa <span style={{ color: 'red' }}>*</span>
              </label>

              <select
                name="Status_Sewa"
                value={formData.Status_Sewa}
                onChange={handleChange}
                onFocus={(e) => {
                  e.target.style.border = '1px solid #053183';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.border = fieldErrors.Status_Sewa
                    ? '1px solid red'
                    : '1px solid #ccc';
                }}
                style={{
                  appearance: 'none',
                  width: '100%',
                  padding: '0px 32px 0px 16px',
                  borderRadius: '4px',
                  border: fieldErrors.Status_Sewa
                    ? '0.8px solid red'
                    : '0.8px solid #ced4da',
                  height: '40px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  backgroundColor: '#fff'
                }}
              >
                <option value="" style={{ color: '#272b30' }}>
                  Pilih Status Sewa
                </option>
                <option value="AKTIF" style={{ color: '#272b30' }}>
                  AKTIF
                </option>
                <option value="NON AKTIF" style={{ color: '#272b30' }}>
                  NON AKTIF
                </option>
              </select>

              <img
                src="/down.png"
                alt=""
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '38px',
                  width: '11px',
                  height: '11px',
                  pointerEvents: 'none'
                }}
              />

              {fieldErrors.Status_Sewa && (
                <small
                  style={{
                    display: 'block',
                    color: 'red',
                    fontSize: '12px',
                    lineHeight: '16px',
                    marginTop: '4px'
                  }}
                >
                  This field is required.
                </small>
              )}
            </div>

            {/* TOMBOL */}
            <div style={{ display: 'flex' }}>
              <Link
                to="/penyewa"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(-1);
                }}
                style={{
                  backgroundColor: '#fff',
                  color: '#479f45',
                  border: '1px solid #479f45',
                  padding: '9px 16px',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontWeight: '500',
                  fontSize: '14px',
                  height: '40px',
                  textShadow: '0.2px 0 currentColor',
                  width: '88.61px',
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                Kembali
              </Link>

              <button
                type="submit"
                style={{
                  backgroundColor: '#479f45',
                  color: 'white',
                  border: 'none',
                  padding: '0px 16px',
                  borderRadius: '4px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  marginLeft: '24px',
                  fontSize: '14px',
                  height: '40px',
                  width: '84.3px',
                  textShadow: '0.2px 0 currentColor'
                }}
              >
                Simpan
              </button>
            </div>
          </form>
        </div>

        {/* ILUSTRASI */}
        <div>
          <img
            src="/Request.png"
            alt="Ilustrasi"
            style={{
              width: '592px',
              height: '261.44px',
              objectFit: 'fill',
              margin: '-2px'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default EditPenyewa;
