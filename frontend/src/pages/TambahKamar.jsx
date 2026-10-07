import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createRoom } from '../services/api';

const TambahKamar = () => {
  const navigate = useNavigate();
  
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFieldErrors({ ...fieldErrors, [name]: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validasi kelengkapan data
    let errors = {};
    if (!formData.No_Kamar) errors.No_Kamar = true;
    if (!formData.Harga) errors.Harga = true;
    if (!formData.Lantai) errors.Lantai = true;
    if (!formData.Tipe_Kamar) errors.Tipe_Kamar = true;
    if (!formData.Status_Ketersediaan) errors.Status_Ketersediaan = true;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage('Mohon Lengkapi Data'); // Pesan error kelengkapan data
      return;
    }

    try {
      await createRoom(formData);
      setSuccessMessage('Data Berhasil Ditambahkan / Diedit');
      setTimeout(() => {
        navigate('/kamar');
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Terjadi kesalahan pada server';
      setErrorMessage(msg);
    }
  };

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
      
      <h2 style={{ fontSize: '32px', color: '#111', fontWeight: '600', textShadow: '0.5px 0 currentColor', marginBottom: '32px', marginTop: '-2px' }}>Tambah Kamar</h2>

      <div style={{ display: 'flex', gap: '20px', marginTop: '12px'}}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '4px',border: '0.8px solid #d9dee3', width: '592px', height: '554px', marginTop: '-2px'}}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: fieldErrors.No_Kamar ? '6px' : '26px' }}>
              <label style={{ width: '542px', display: 'block', marginBottom: '8px', fontWeight: '600', textShadow: '0.2px 0 currentColor', fontSize: '14px', color: '#4f575e'}}> Nomor Kamar <span style={{ color: 'red' }}>*</span></label>
              <input 
                type="text" 
                name="No_Kamar"
                value={formData.No_Kamar}
                onChange={handleChange}
                onFocus={(e) => {
                  e.target.style.border = '1px solid #053183';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => e.target.style.border = fieldErrors.No_Kamar ? '1px solid red' : '1px solid #ccc'}
                style={{ width: '100%', padding: '0px 16px', borderRadius: '4px', border: fieldErrors.No_Kamar ? '0.8px solid red' : '0.8px solid #ced4da', height: '40px', fontSize: '15px'}}
              />
              {fieldErrors.No_Kamar && (
                <small style={{ display:'block', color:'red', fontSize:'12px', lineHeight:'16px', marginTop:'4px' }}>
                  This field is required.
                </small>
              )}
            </div>

            <div style={{ marginBottom: fieldErrors.Harga ? '6px' : '26px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', textShadow: '0.2px 0 currentColor', fontSize: '14px', color: '#4f575e' }}>Harga <span style={{ color: 'red' }}>*</span></label>
              <input 
                type="number" 
                name="Harga"
                value={formData.Harga}
                onChange={handleChange}
                onFocus={(e) => {
                  e.target.style.border = '1px solid #053183';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => e.target.style.border = fieldErrors.Harga ? '1px solid red' : '1px solid #ccc'}
                style={{ width: '100%', padding: '0px 16px', borderRadius: '4px', border: fieldErrors.Harga ? '0.8px solid red' : '0.8px solid #ced4da', height: '40px' }}
              />
              {fieldErrors.Harga && (
                <small style={{ display:'block', color:'red', fontSize:'12px', lineHeight:'16px', marginTop:'4px' }}>
                  This field is required.
                </small>
              )}
            </div>

            <div style={{ marginBottom: fieldErrors.Lantai ? '6px' : '26px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', textShadow: '0.2px 0 currentColor', fontSize: '14px', color: '#4f575e' }}>Lantai <span style={{ color: 'red' }}>*</span></label>
              <input 
                type="number" 
                name="Lantai"
                value={formData.Lantai}
                onChange={handleChange}
                onFocus={(e) => {
                  e.target.style.border = '1px solid #053183';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => e.target.style.border = fieldErrors.Lantai ? '1px solid red' : '1px solid #ccc'}
                style={{ width: '100%', padding: '0px 16px', borderRadius: '4px', border: fieldErrors.Lantai ? '0.8px solid red' : '0.8px solid #ced4da', height: '40px' }}
              />
              {fieldErrors.Lantai && (
                <small style={{ display:'block', color:'red', fontSize:'12px', lineHeight:'16px', marginTop:'4px' }}>
                  This field is required.
                </small>
              )}
            </div>

            <div style={{ marginBottom: fieldErrors.Tipe_Kamar ? '6px' : '26px', position: 'relative' }}>
              <label style={{display: 'block', marginBottom: '9px', fontWeight: '600', textShadow: '0.2px 0 currentColor', fontSize: '14px', color: '#4f575e'}}>
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
                onBlur={(e) => e.target.style.border = fieldErrors.Tipe_Kamar ? '1px solid red' : '1px solid #ccc'}
                style={{
                  width: '100%',padding: '0px 16px',borderRadius: '4px',border: fieldErrors.Tipe_Kamar? '0.8px solid red' : '0.8px solid #ced4da',
                  fontSize: '14px',appearance: 'none',paddingLeft: '15px',height: '40px',color: '#272b30'
                }}
              >
                <option value="" style={{ color: '#272b30' }}>Pilih Tipe Kamar</option>
                <option value="AC" style={{ color: '#272b30'}}>AC</option>
                <option value="NON AC" style={{ color: '#272b30' }}>NON AC</option>
              </select>

              <img src="/down.png" alt="" style={{ position: 'absolute', right: '16px', top: '38px', width: '11px', height: '11px', pointerEvents: 'none' }}/>
              {fieldErrors.Tipe_Kamar && (
                <small style={{ display:'block', color:'red', fontSize:'12px', lineHeight:'16px', marginTop:'4px' }}>
                  This field is required.
                </small>
              )}
            </div>

            <div style={{ marginBottom: fieldErrors.Status_Ketersediaan ? '6px' : '24px', position: 'relative' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', textShadow: '0.2px 0 currentColor', fontSize: '14px', color: '#4f575e' }}>Status Ketersediaan <span style={{ color: 'red' }}>*</span></label>
              <select 
                name="Status_Ketersediaan"
                value={formData.Status_Ketersediaan}
                onChange={handleChange}
                style={{ width: '100%', padding: '0px 16px', borderRadius: '4px', border: fieldErrors.Status_Ketersediaan ? '0.8px solid red' : '0.8px solid #ced4da', fontSize: '14px', appearance: 'none', paddingLeft: '15px', color: '#272b30', height: '40px'}}
                onFocus={(e) => {
                  e.target.style.border = '1px solid #053183';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => e.target.style.border = fieldErrors.Status_Ketersediaan ? '1px solid red' : '1px solid #ccc'}
              >
                <option value="" style={{ color: '#272b30' }}>Pilih Status Ketersediaan</option>
                <option value="TERISI" style={{ color: '#272b30' }}>TERISI</option>
                <option value="KOSONG" style={{ color: '#272b30' }}>KOSONG</option>
              </select>

              <img src="/down.png" alt="" style={{ position: 'absolute', right: '16px', top: '38px', width: '11px', height: '11px', pointerEvents: 'none' }}/>
              {fieldErrors.Status_Ketersediaan && (
                <small style={{ display:'block', color:'red', fontSize:'12px', lineHeight:'16px', marginTop:'4px' }}>
                  This field is required.
                </small>
              )}
            </div>

            <div style={{ display: 'flex'}}>
              <Link to="/kamar" style={{ backgroundColor: '#fff', color: '#479f45', border: '1px solid #479f45', padding: '9px 16px', borderRadius: '4px', textDecoration: 'none', fontWeight: '600', fontSize: '14px', height: '40px', textShadow: '0.2px 0 currentColor', width: '88.61px'}}>
                Kembali
              </Link>
              <button type="submit" style={{ backgroundColor: '#479f45', color: 'white', border: 'none', padding: '0px 16px', borderRadius: '4px', fontWeight: '600', cursor: 'pointer', fontSize: '14px', height: '40px', width: '84.3px', textShadow: '0.2px 0 currentColor', margin: '0px 0px 0px 24px'}}>
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

export default TambahKamar;