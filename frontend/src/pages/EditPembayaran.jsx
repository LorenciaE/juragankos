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
        const data = await getPaymentById(paymentId);
        const formattedDate = data.Tgl_Pembayaran ? data.Tgl_Pembayaran.split('T')[0] : '';

        setFormData({
          Bulan_Pembayaran: data.Bulan_Pembayaran,
          Tgl_Pembayaran: formattedDate,
          Status_Pembayaran: data.Status_Pembayaran,
          Metode_Pembayaran: data.Metode_Pembayaran,
          Nominal: data.Nominal
        });
        
        // Simpan Sewa_ID asli dari record pembayaran ini
        setSewaId(data.Sewa_ID);
        setLoadingData(false);
      } catch (err) {
        setErrorMessage('Gagal memuat data pembayaran.');
        setLoadingData(false);
      }
    };
    fetchPayment();
  }, [paymentId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFieldErrors({ ...fieldErrors, [name]: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    let errors = {};
    if (!formData.Bulan_Pembayaran) errors.Bulan_Pembayaran = true;
    if (!formData.Tgl_Pembayaran) errors.Tgl_Pembayaran = true;
    if (!formData.Status_Pembayaran) errors.Status_Pembayaran = true;
    if (!formData.Metode_Pembayaran) errors.Metode_Pembayaran = true;
    if (!formData.Nominal) errors.Nominal = true;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage('Mohon Lengkapi Data');
      return;
    }

    try {
      const dataToSubmit = {
        ...formData,
        Kamar_ID: parseInt(id),
        Sewa_ID: parseInt(sewaId),
        Nominal: parseFloat(formData.Nominal)
      };

      await updatePayment(paymentId, dataToSubmit);
      setSuccessMessage('Data Berhasil Ditambahkan / Diedit');
      setTimeout(() => {
        navigate(`/kamar/${id}/pembayaran`); 
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Terjadi kesalahan pada server';
      setErrorMessage(msg);
    }
  };

  if (loadingData) return <p style={{ padding: '20px' }}>Memuat data...</p>;

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

      <h2 style={{ fontSize: '32px', color: '#111', fontWeight: '600', marginBottom: '32px', margin: '-2px'}}>Edit Pembayaran</h2>
      
      <div style={{ display: 'flex', gap: '20px', marginTop: '32px' }}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '4px', border: '0.8px solid #d9dee3', width: '592px', height: '554px'}}>
          <form onSubmit={handleSubmit}>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '9px', fontWeight: '600', fontSize: '14px', color: '#4f575e' }}>Bulan Pembayaran <span style={{ color: 'red' }}>*</span></label>
              <input type="text" name="Bulan_Pembayaran" value={formData.Bulan_Pembayaran} onChange={handleChange} onFocus={(e) => {
                e.target.style.border = '1px solid #053183';
                e.target.style.outline = 'none';
              }}
              onBlur={(e) => e.target.style.border = fieldErrors.Bulan_Pembayaran 
              ? '0.8px solid red' : '0.8px solid #ced4da'} style={{ width: '100%', paddingLeft: '14px', padding: '0px 16px', borderRadius: '4px', border: fieldErrors.Bulan_Pembayaran ? '0.8px solid red' : '0.8px solid #ced4da' , height: '40px' }} />
              {fieldErrors.Bulan_Pembayaran && (
                <small style={{ display:'block', color:'red', fontSize:'12px', lineHeight:'14px', marginTop:'4px' }}>
                  This field is required.
                </small>
              )}
            </div>

            <div style={{ marginBottom: '26px' }}>
              <label style={{ display: 'block', marginBottom: '9px', fontWeight: '600', fontSize: '14px', color: '#4f575e' }}>Tanggal Pembayaran <span style={{ color: 'red' }}>*</span></label>
              <input type="date" name="Tgl_Pembayaran" value={formData.Tgl_Pembayaran} onChange={handleChange} onFocus={(e) => {
                e.target.style.border = '1px solid #053183';
                e.target.style.outline = 'none';
              }}
              onBlur={(e) => e.target.style.border = fieldErrors.Tgl_Pembayaran 
              ? '0.8px solid red' : '0.8px solid #ced4da'} style={{ width: '100%', paddingLeft: '14px', padding: '0px 16px', borderRadius: '4px', border: fieldErrors.Tgl_Pembayaran ? '0.8px solid red' : '0.8px solid #ced4da', height: '40px', fontSize: '14px' }} />
              {fieldErrors.Tgl_Pembayaran && (
                <small style={{ display:'block', color:'red', fontSize:'12px', lineHeight:'14px', marginTop:'4px' }}>
                  This field is required.
                </small>
              )}
            </div>

            <div style={{ marginBottom: fieldErrors.Status_Pembayaran ? '6px' : '26px' }}>
              <label style={{ display: 'block', marginBottom: '9px', fontWeight: '600', fontSize: '14px', color: '#4f575e' }}>Status Pembayaran <span style={{ color: 'red' }}>*</span></label>
              <select name="Status_Pembayaran" value={formData.Status_Pembayaran} onChange={handleChange} onFocus={(e) => {
                  e.target.style.border = '1px solid #053183';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => e.target.style.border = fieldErrors.Status_Pembayaran 
                ? '0.8px solid red' : '0.8px solid #ced4da'} style={{ appearance: 'none', width: '100%', padding: '0px 0px 0px 16px', borderRadius: '4px', border: fieldErrors.Status_Pembayaran ? '0.8px solid red' : '0.8px solid #ced4da' , height: '40px', fontSize: '14px'}}>
                <option value="" style={{ color: '#272b30'}}>Pilih Status Pembayaran</option>
                <option value="LUNAS" style={{ color: '#272b30'}}>LUNAS</option>
                <option value="BELUM LUNAS" style={{ color: '#272b30'}}>BELUM LUNAS</option>
              </select>
              <img src="/down.png" alt="" style={{ position: 'absolute', right: '648px', top: '53.25%', transform: 'translateY(-50%)', width: '11px', height: '11px', pointerEvents: 'none' }}/>
              {fieldErrors.Status_Pembayaran && (
                <small style={{ display:'block', color:'red', fontSize:'12px', lineHeight:'14px', marginTop:'4px' }}>
                  This field is required.
                </small>
              )}
            </div>

            <div style={{ marginBottom: fieldErrors.Metode_Pembayaran ? '6px' : '24px' }}>
              <label style={{ display: 'block', marginBottom: '9px', fontWeight: '600', fontSize: '14px', color: '#4f575e' }}>Metode Pembayaran <span style={{ color: 'red' }}>*</span></label>
              <select name="Metode_Pembayaran" value={formData.Metode_Pembayaran} onChange={handleChange} onFocus={(e) => {
                  e.target.style.border = '1px solid #053183';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => e.target.style.border = fieldErrors.Metode_Pembayaran 
                ? '0.8px solid red' : '0.8px solid #ced4da'} style={{ appearance: 'none', width: '100%', padding: '0px 0px 0px 16px', borderRadius: '4px', border: fieldErrors.Metode_Pembayaran ? '0.8px solid red' : '0.8px solid #ced4da', height: '40px', fontSize: '14px' }}>
                <option value="" style={{ color: '#272b30'}}>Pilih Metode Pembayaran</option>
                <option value="TRANSFER" style={{ color: '#272b30'}}>TRANSFER</option>
                <option value="TUNAI" style={{ color: '#272b30'}}>TUNAI</option>
              </select>
              <img src="/down.png" alt="" style={{ position: 'absolute', right: '648px', top: '68.25%', transform: 'translateY(-50%)', width: '11px', height: '11px', pointerEvents: 'none' }}/>
              {fieldErrors.Metode_Pembayaran && (
                <small style={{ display:'block', color:'red', fontSize:'12px', lineHeight:'14px', marginTop:'4px' }}>
                  This field is required.
                </small>
              )}
            </div>

            <div style={{ marginBottom: fieldErrors.Nominal ? '6px' : '24px' }}>
              <label style={{ display: 'block', marginBottom: '9px', fontWeight: '600', fontSize: '14px', color: '#4f575e' }}>Nominal <span style={{ color: 'red' }}>*</span></label>
              <input type="number" name="Nominal" value={formData.Nominal} onChange={handleChange} onFocus={(e) => {
                e.target.style.border = '1px solid #053183';
                e.target.style.outline = 'none';
              }}
              onBlur={(e) => e.target.style.border = fieldErrors.Nominal 
              ? '0.8px solid red' : '0.8px solid #ced4da'} style={{ width: '100%', padding: '0px 0px 0px 16px', borderRadius: '4px', border: fieldErrors.Nominal ? '0.8px solid red' : '0.8px solid #ced4da' , height: '40px', fontSize: '14px'}} />
              {fieldErrors.Nominal && (
                <small style={{ display:'block', color:'red', fontSize:'12px', lineHeight:'14px', marginTop:'4px' }}>
                  This field is required.
                </small>
              )}
            </div>

            <div style={{ display: 'flex'}}>
              <Link type="button" onClick={() => navigate(-1)} style={{ backgroundColor: '#fff', color: '#479f45', border: '1px solid #479f45', padding: '10px 15px', borderRadius: '4px', textDecoration: 'none', fontWeight: '500', fontSize: '14px', height: '40px', textShadow: '0.2px 0 currentColor', width: '88.61px'}}>
                Kembali
              </Link>
              <button type="submit" style={{ backgroundColor: '#479f45', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', fontWeight: '500', cursor: 'pointer', marginLeft: '14px', fontSize: '14px', height: '40px', width: '85px', textShadow: '0.2px 0 currentColor', margin: '0px 0px 0px 24px'}}>
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

export default EditPembayaran;