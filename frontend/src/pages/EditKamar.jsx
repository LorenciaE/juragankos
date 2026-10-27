
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getRoomById, updateRoom } from '../services/api';

const EditKamar = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    No_Kamar: '',
    Harga: '',
    Lantai: '',
    Tipe_Kamar: '',
    Status_Ketersediaan: ''
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoadingData(true);
        setErrorMessage('');

        console.log('ID kamar dari URL:', id);

        const data = await getRoomById(id);

        console.log('Response getRoomById:', data);

        // Backend PostgreSQL menggunakan snake_case.
        // PascalCase tetap didukung sebagai alternatif.
        const room = data?.data ?? data?.room ?? data;

        setFormData({
          No_Kamar: room.no_kamar ?? room.No_Kamar ?? '',
          Harga: room.harga ?? room.Harga ?? '',
          Lantai: room.lantai ?? room.Lantai ?? '',
          Tipe_Kamar: room.tipe_kamar ?? room.Tipe_Kamar ?? '',
          Status_Ketersediaan:
            room.status_ketersediaan ??
            room.Status_Ketersediaan ??
            ''
        });
      } catch (err) {
        console.error('Gagal mengambil data kamar:', err);
        console.error('Detail error:', err.response?.data);

        setErrorMessage(
          err.response?.data?.message ||
          'Gagal memuat data kamar.'
        );
      } finally {
        setLoadingData(false);
      }
    };

    if (id) {
      fetchRoom();
    } else {
      setErrorMessage('ID kamar tidak ditemukan.');
      setLoadingData(false);
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: false
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const errors = {};

    if (!formData.No_Kamar) errors.No_Kamar = true;
    if (!formData.Harga) errors.Harga = true;
    if (!formData.Lantai) errors.Lantai = true;
    if (!formData.Tipe_Kamar) errors.Tipe_Kamar = true;
    if (!formData.Status_Ketersediaan) {
      errors.Status_Ketersediaan = true;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage('Mohon Lengkapi Data');
      return;
    }

    try {
      // Kirim data dengan nama kolom yang digunakan backend.
      const roomData = {
        no_kamar: formData.No_Kamar,
        harga: Number(formData.Harga),
        lantai: Number(formData.Lantai),
        tipe_kamar: formData.Tipe_Kamar,
        status_ketersediaan: formData.Status_Ketersediaan
      };

      await updateRoom(id, roomData);

      setSuccessMessage('Data kamar berhasil diperbarui.');

      setTimeout(() => {
        navigate('/kamar');
      }, 1500);
    } catch (err) {
      console.error('Gagal memperbarui kamar:', err);
      console.error('Detail error:', err.response?.data);

      const msg =
        err.response?.data?.message ||
        'Terjadi kesalahan pada server';

      setErrorMessage(msg);
    }
  };

  if (loadingData) {
    return (
      <p style={{ padding: '20px' }}>
        Memuat data kamar...
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
            width: 'min(600px, calc(100vw - 32px))',
            minHeight: '59px',
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
          role="status"
          className="feedback-message feedback-message-success feedback-message-autoclose"
          style={{
            position: 'fixed',
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'min(600px, calc(100vw - 32px))',
            minHeight: '59px',
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
          marginTop: '-2px'
        }}
      >
        Edit Kamar
      </h2>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          marginTop: '-2px'
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '4px',
            border: '0.8px solid #d9dee3',
            width: '592px',
            maxWidth: '100%',
            minHeight: '554px',
            boxSizing: 'border-box'
          }}
        >
          <form onSubmit={handleSubmit}>
            {/* NOMOR KAMAR */}
            <div
              style={{
                marginBottom: fieldErrors.No_Kamar ? '4px' : '24px'
              }}
            >
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#4f575e'
                }}
              >
                Nomor Kamar <span style={{ color: 'red' }}>*</span>
              </label>

              <input
                type="text"
                name="No_Kamar"
                value={formData.No_Kamar}
                onChange={handleChange}
                onFocus={(e) => {
                  e.target.style.border = '1px solid #053183';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.border = fieldErrors.No_Kamar
                    ? '1px solid red'
                    : '1px solid #ccc';
                }}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '0 16px',
                  borderRadius: '4px',
                  border: fieldErrors.No_Kamar
                    ? '0.8px solid red'
                    : '0.8px solid #ced4da',
                  height: '40px',
                  fontSize: '14px'
                }}
              />

              {fieldErrors.No_Kamar && (
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

            {/* HARGA */}
            <div
              style={{
                marginBottom: fieldErrors.Harga ? '4px' : '24px'
              }}
            >
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#4f575e'
                }}
              >
                Harga <span style={{ color: 'red' }}>*</span>
              </label>

              <input
                type="number"
                name="Harga"
                value={formData.Harga}
                onChange={handleChange}
                onFocus={(e) => {
                  e.target.style.border = '1px solid #053183';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.border = fieldErrors.Harga
                    ? '1px solid red'
                    : '1px solid #ccc';
                }}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '0 16px',
                  borderRadius: '4px',
                  border: fieldErrors.Harga
                    ? '0.8px solid red'
                    : '0.8px solid #ced4da',
                  height: '40px',
                  fontSize: '14px'
                }}
              />

              {fieldErrors.Harga && (
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

            {/* LANTAI */}
            <div
              style={{
                marginBottom: fieldErrors.Lantai ? '4px' : '24px'
              }}
            >
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#4f575e'
                }}
              >
                Lantai <span style={{ color: 'red' }}>*</span>
              </label>

              <input
                type="number"
                name="Lantai"
                value={formData.Lantai}
                onChange={handleChange}
                onFocus={(e) => {
                  e.target.style.border = '1px solid #053183';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.border = fieldErrors.Lantai
                    ? '1px solid red'
                    : '1px solid #ccc';
                }}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '0 16px',
                  borderRadius: '4px',
                  border: fieldErrors.Lantai
                    ? '0.8px solid red'
                    : '0.8px solid #ced4da',
                  height: '40px',
                  fontSize: '14px'
                }}
              />

              {fieldErrors.Lantai && (
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

            {/* TIPE KAMAR */}
            <div
              style={{
                marginBottom: fieldErrors.Tipe_Kamar ? '4px' : '24px',
                position: 'relative'
              }}
            >
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#4f575e'
                }}
              >
                Tipe Kamar <span style={{ color: 'red' }}>*</span>
              </label>

              <select
                name="Tipe_Kamar"
                value={formData.Tipe_Kamar}
                onChange={handleChange}
                onFocus={(e) => {
                  e.target.style.border = '1px solid #053183';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.border = fieldErrors.Tipe_Kamar
                    ? '1px solid red'
                    : '1px solid #ccc';
                }}
                style={{
                  appearance: 'none',
                  width: '100%',
                  padding: '0 14px',
                  borderRadius: '4px',
                  border: fieldErrors.Tipe_Kamar
                    ? '0.8px solid red'
                    : '0.8px solid #ced4da',
                  height: '40px',
                  color: '#272b30',
                  fontSize: '14px'
                }}
              >
                <option value="">Pilih Tipe Kamar</option>
                <option value="AC">AC</option>
                <option value="NON AC">NON AC</option>
              </select>

              <img
                src="/down.png"
                alt=""
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '43.5px',
                  width: '11px',
                  height: '11px',
                  pointerEvents: 'none'
                }}
              />

              {fieldErrors.Tipe_Kamar && (
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

            {/* STATUS KETERSEDIAAN */}
            <div
              style={{
                marginBottom: fieldErrors.Status_Ketersediaan
                  ? '4px'
                  : '24px',
                position: 'relative'
              }}
            >
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#4f575e'
                }}
              >
                Status Ketersediaan{' '}
                <span style={{ color: 'red' }}>*</span>
              </label>

              <select
                name="Status_Ketersediaan"
                value={formData.Status_Ketersediaan}
                onChange={handleChange}
                onFocus={(e) => {
                  e.target.style.border = '1px solid #053183';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.border = fieldErrors.Status_Ketersediaan
                    ? '1px solid red'
                    : '1px solid #ccc';
                }}
                style={{
                  appearance: 'none',
                  width: '100%',
                  padding: '0 16px',
                  borderRadius: '4px',
                  border: fieldErrors.Status_Ketersediaan
                    ? '0.8px solid red'
                    : '0.8px solid #ced4da',
                  height: '40px',
                  color: '#272b30',
                  fontSize: '14px'
                }}
              >
                <option value="">Pilih Status Ketersediaan</option>
                <option value="TERISI">TERISI</option>
                <option value="KOSONG">KOSONG</option>
              </select>

              <img
                src="/down.png"
                alt=""
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '43.5px',
                  width: '11px',
                  height: '11px',
                  pointerEvents: 'none'
                }}
              />

              {fieldErrors.Status_Ketersediaan && (
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
                to="/kamar"
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
                  boxSizing: 'border-box',
                  textAlign: 'center',
                  width: '88.61px'
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
                  padding: '0 16px',
                  borderRadius: '4px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontSize: '14px',
                  height: '40px',
                  width: '85px',
                  marginLeft: '24px'
                }}
              >
                Simpan
              </button>
            </div>
          </form>
        </div>

        <div>
          <img
            src="/Request.png"
            alt="Ilustrasi"
            style={{
              width: '592px',
              maxWidth: '100%',
              height: '261.44px',
              objectFit: 'fill'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default EditKamar;
