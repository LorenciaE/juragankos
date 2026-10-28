
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getPaymentById, updatePayment } from '../services/api';

const EditPembayaran = () => {
  const navigate = useNavigate();
  const { id, paymentId } = useParams();

  const [formData, setFormData] = useState({
    Bulan_Pembayaran: '',
    Tgl_Pembayaran: '',
    Status_Pembayaran: '',
    Metode_Pembayaran: '',
    Nominal: ''
  });

  const [sewaId, setSewaId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        setLoadingData(true);
        setErrorMessage('');

        console.log('ID kamar:', id);
        console.log('ID pembayaran:', paymentId);

        const data = await getPaymentById(paymentId);

        console.log('Response getPaymentById:', data);

        // Mendukung response berbentuk objek langsung,
        // { data: {...} }, atau { payment: {...} }.
        const payment = data?.data ?? data?.payment ?? data;

        const paymentDate =
          payment.tgl_pembayaran ??
          payment.Tgl_Pembayaran ??
          '';

        const formattedDate = paymentDate
          ? String(paymentDate).split('T')[0]
          : '';

        setFormData({
          Bulan_Pembayaran:
            payment.bulan_pembayaran ??
            payment.Bulan_Pembayaran ??
            '',
          Tgl_Pembayaran: formattedDate,
          Status_Pembayaran:
            payment.status_pembayaran ??
            payment.Status_Pembayaran ??
            '',
          Metode_Pembayaran:
            payment.metode_pembayaran ??
            payment.Metode_Pembayaran ??
            '',
          Nominal:
            payment.nominal ??
            payment.Nominal ??
            ''
        });

        // Pertahankan Sewa_ID dari data pembayaran asli.
        setSewaId(
          payment.sewa_id ??
          payment.Sewa_ID ??
          null
        );
      } catch (err) {
        console.error('Gagal mengambil data pembayaran:', err);
        console.error('Detail error:', err.response?.data);

        setErrorMessage(
          err.response?.data?.message ||
          'Gagal memuat data pembayaran.'
        );
      } finally {
        setLoadingData(false);
      }
    };

    if (paymentId) {
      fetchPayment();
    } else {
      setErrorMessage('ID pembayaran tidak ditemukan.');
      setLoadingData(false);
    }
  }, [id, paymentId]);

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

    if (!formData.Bulan_Pembayaran) {
      errors.Bulan_Pembayaran = true;
    }

    if (!formData.Tgl_Pembayaran) {
      errors.Tgl_Pembayaran = true;
    }

    if (!formData.Status_Pembayaran) {
      errors.Status_Pembayaran = true;
    }

    if (!formData.Metode_Pembayaran) {
      errors.Metode_Pembayaran = true;
    }

    if (
      formData.Nominal === '' ||
      formData.Nominal === null ||
      Number(formData.Nominal) <= 0
    ) {
      errors.Nominal = true;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage('Mohon Lengkapi Data');
      return;
    }

    try {
      const dataToSubmit = {
        Bulan_Pembayaran: formData.Bulan_Pembayaran,
        Tgl_Pembayaran: formData.Tgl_Pembayaran,
        Status_Pembayaran: formData.Status_Pembayaran,
        Metode_Pembayaran: formData.Metode_Pembayaran,
        Nominal: Number(formData.Nominal),
        Kamar_ID: Number(id),
        Sewa_ID: sewaId === null ? null : Number(sewaId)
      };


      await updatePayment(paymentId, dataToSubmit);

      setSuccessMessage('Data pembayaran berhasil diperbarui.');

      setTimeout(() => {
        navigate(`/kamar/${id}/pembayaran`);
      }, 1500);
    } catch (err) {
      console.error('Gagal memperbarui pembayaran:', err);
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
        Memuat data pembayaran...
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
              backgroundColor: 'rgba(255,255,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
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
              backgroundColor: 'rgba(255,255,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
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
          margin: '-2px 0 32px'
        }}
      >
        Edit Pembayaran
      </h2>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
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
            maxWidth: '100%',
            minHeight: '554px',
            boxSizing: 'border-box'
          }}
        >
          <form onSubmit={handleSubmit}>
            {/* BULAN PEMBAYARAN */}
            <div
              style={{
                marginBottom: fieldErrors.Bulan_Pembayaran ? '4px' : '24px'
              }}
            >
              <label
                style={{
                  display: 'block',
                  marginBottom: '9px',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#4f575e'
                }}
              >
                Bulan Pembayaran <span style={{ color: 'red' }}>*</span>
              </label>

              <input
                type="text"
                name="Bulan_Pembayaran"
                value={formData.Bulan_Pembayaran}
                onChange={handleChange}
                onFocus={(e) => {
                  e.target.style.border = '1px solid #053183';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.border = fieldErrors.Bulan_Pembayaran
                    ? '0.8px solid red'
                    : '0.8px solid #ced4da';
                }}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '0 16px',
                  borderRadius: '4px',
                  border: fieldErrors.Bulan_Pembayaran
                    ? '0.8px solid red'
                    : '0.8px solid #ced4da',
                  height: '40px',
                  fontSize: '14px'
                }}
              />

              {fieldErrors.Bulan_Pembayaran && (
                <small style={errorTextStyle}>
                  This field is required.
                </small>
              )}
            </div>

            {/* TANGGAL PEMBAYARAN */}
            <div
              style={{
                marginBottom: fieldErrors.Tgl_Pembayaran ? '4px' : '26px'
              }}
            >
              <label
                style={{
                  display: 'block',
                  marginBottom: '9px',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#4f575e'
                }}
              >
                Tanggal Pembayaran <span style={{ color: 'red' }}>*</span>
              </label>

              <input
                type="date"
                name="Tgl_Pembayaran"
                value={formData.Tgl_Pembayaran}
                onChange={handleChange}
                onFocus={(e) => {
                  e.target.style.border = '1px solid #053183';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.border = fieldErrors.Tgl_Pembayaran
                    ? '0.8px solid red'
                    : '0.8px solid #ced4da';
                }}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '0 16px',
                  borderRadius: '4px',
                  border: fieldErrors.Tgl_Pembayaran
                    ? '0.8px solid red'
                    : '0.8px solid #ced4da',
                  height: '40px',
                  fontSize: '14px'
                }}
              />

              {fieldErrors.Tgl_Pembayaran && (
                <small style={errorTextStyle}>
                  This field is required.
                </small>
              )}
            </div>

            {/* STATUS PEMBAYARAN */}
            <div
              style={{
                marginBottom: fieldErrors.Status_Pembayaran ? '6px' : '26px',
                position: 'relative'
              }}
            >
              <label
                style={{
                  display: 'block',
                  marginBottom: '9px',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#4f575e'
                }}
              >
                Status Pembayaran <span style={{ color: 'red' }}>*</span>
              </label>

              <select
                name="Status_Pembayaran"
                value={formData.Status_Pembayaran}
                onChange={handleChange}
                onFocus={(e) => {
                  e.target.style.border = '1px solid #053183';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.border = fieldErrors.Status_Pembayaran
                    ? '0.8px solid red'
                    : '0.8px solid #ced4da';
                }}
                style={selectStyle}
              >
                <option value="">Pilih Status Pembayaran</option>
                <option value="LUNAS">LUNAS</option>
                <option value="BELUM LUNAS">BELUM LUNAS</option>
              </select>

              <img
                src="/down.png"
                alt=""
                style={dropdownIconStyle}
              />

              {fieldErrors.Status_Pembayaran && (
                <small style={errorTextStyle}>
                  This field is required.
                </small>
              )}
            </div>

            {/* METODE PEMBAYARAN */}
            <div
              style={{
                marginBottom: fieldErrors.Metode_Pembayaran ? '6px' : '24px',
                position: 'relative'
              }}
            >
              <label
                style={{
                  display: 'block',
                  marginBottom: '9px',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#4f575e'
                }}
              >
                Metode Pembayaran <span style={{ color: 'red' }}>*</span>
              </label>

              <select
                name="Metode_Pembayaran"
                value={formData.Metode_Pembayaran}
                onChange={handleChange}
                onFocus={(e) => {
                  e.target.style.border = '1px solid #053183';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.border = fieldErrors.Metode_Pembayaran
                    ? '0.8px solid red'
                    : '0.8px solid #ced4da';
                }}
                style={selectStyle}
              >
                <option value="">Pilih Metode Pembayaran</option>
                <option value="TRANSFER">TRANSFER</option>
                <option value="TUNAI">TUNAI</option>
              </select>

              <img
                src="/down.png"
                alt=""
                style={dropdownIconStyle}
              />

              {fieldErrors.Metode_Pembayaran && (
                <small style={errorTextStyle}>
                  This field is required.
                </small>
              )}
            </div>

            {/* NOMINAL */}
            <div
              style={{
                marginBottom: fieldErrors.Nominal ? '6px' : '24px'
              }}
            >
              <label
                style={{
                  display: 'block',
                  marginBottom: '9px',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#4f575e'
                }}
              >
                Nominal <span style={{ color: 'red' }}>*</span>
              </label>

              <input
                type="number"
                name="Nominal"
                value={formData.Nominal}
                onChange={handleChange}
                min="1"
                onFocus={(e) => {
                  e.target.style.border = '1px solid #053183';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.border = fieldErrors.Nominal
                    ? '0.8px solid red'
                    : '0.8px solid #ced4da';
                }}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '0 16px',
                  borderRadius: '4px',
                  border: fieldErrors.Nominal
                    ? '0.8px solid red'
                    : '0.8px solid #ced4da',
                  height: '40px',
                  fontSize: '14px'
                }}
              />

              {fieldErrors.Nominal && (
                <small style={errorTextStyle}>
                  Masukkan nominal yang valid.
                </small>
              )}
            </div>

            {/* TOMBOL */}
            <div style={{ display: 'flex' }}>
              <Link
                to={`/kamar/${id}/pembayaran`}
                style={{
                  backgroundColor: '#fff',
                  color: '#479f45',
                  border: '1px solid #479f45',
                  padding: '10px 15px',
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
                  padding: '8px 15px',
                  borderRadius: '4px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  marginLeft: '24px',
                  fontSize: '14px',
                  height: '40px',
                  width: '85px'
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
              objectFit: 'fill',
              margin: '-2px'
            }}
          />
        </div>
      </div>
    </div>
  );
};

const errorTextStyle = {
  display: 'block',
  color: 'red',
  fontSize: '12px',
  lineHeight: '14px',
  marginTop: '4px'
};

const selectStyle = {
  appearance: 'none',
  width: '100%',
  boxSizing: 'border-box',
  padding: '0 32px 0 16px',
  borderRadius: '4px',
  border: '0.8px solid #ced4da',
  height: '40px',
  fontSize: '14px',
  backgroundColor: '#fff',
  color: '#272b30'
};

const dropdownIconStyle = {
  position: 'absolute',
  right: '14px',
  top: '43px',
  width: '11px',
  height: '11px',
  pointerEvents: 'none'
};

export default EditPembayaran;
