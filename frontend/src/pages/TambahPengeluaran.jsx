import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createExpense, getRooms } from '../services/api';

const TambahPengeluaran = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    Tgl_Pengeluaran: '',
    Kategori: '',
    Nominal: '',
    Deskripsi: '',
    Kamar_ID: ''
  });

  const [rooms, setRooms] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Mengambil data kamar untuk dropdown
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await getRooms();
        setRooms(data);
      } catch (err) {
        console.error("Gagal memuat data kamar", err);
      }
    };
    fetchRooms();
  }, []);

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
    if (!formData.Tgl_Pengeluaran) errors.Tgl_Pengeluaran = true;
    if (!formData.Kategori) errors.Kategori = true;
    if (!formData.Nominal) errors.Nominal = true;
    if (!formData.Deskripsi) errors.Deskripsi = true;
    if (!formData.Kamar_ID) errors.Kamar_ID = true;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage('Mohon Lengkapi Data');
      return;
    }

    try {
      await createExpense(formData);
      setSuccessMessage('Data Berhasil Ditambahkan');
      setTimeout(() => {
        navigate('/pengeluaran'); 
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

      <h2 style={{ fontSize: '32px', color: '#111', fontWeight: '600', marginBottom: '32px', marginTop: '-2px'}}>Tambah Pengeluaran</h2>
      
      <div style={{ display: 'flex', gap: '20px', marginTop: '-2px' }}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '4px', border: '0.8px solid #d9dee3', width: '592px', height: '554px'}}>
          <form onSubmit={handleSubmit}>
            
            <div style={{ marginBottom: fieldErrors.Tgl_Pengeluaran ? '14px' : '34px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#4f575e', height: '21px'}}>Tanggal Pengeluaran <span style={{ color: 'red' }}>*</span></label>
              <input type="date" name="Tgl_Pengeluaran" value={formData.Tgl_Pengeluaran} onChange={handleChange} 
              onFocus={(e) => {
                e.target.style.border = '1px solid #053183';
                e.target.style.outline = 'none';
              }}
              onBlur={(e) => e.target.style.border = fieldErrors.Tgl_Pengeluaran 
              ? '1px solid red' 
              : '1px solid #ccc'} style={{ width: '100%', padding: '0px 16px', borderRadius: '4px', border: fieldErrors.Tgl_Pengeluaran ? '0.8px solid red' : '0.8px solid #ced4da', height: '40px', fontSize: '14px' }} />
              {fieldErrors.Tgl_Pengeluaran && (
                <small style={{ display:'block', color:'red', fontSize:'12px', lineHeight:'16px', marginTop:'4px' }}>
                  This field is required.
                </small>
              )}
            </div>

            <div style={{ marginBottom: fieldErrors.Kategori ? '6px' : '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#4f575e' , height: '21px'}}>Kategori Pengeluaran <span style={{ color: 'red' }}>*</span></label>
              <select name="Kategori" value={formData.Kategori} onChange={handleChange} onFocus={(e) => {
                  e.target.style.border = '1px solid #053183';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => e.target.style.border = fieldErrors.Kategori 
                ? '1px solid red' 
                : '1px solid #ccc'} style={{ appearance: 'none', width: '100%', padding: '0px 16px', borderRadius: '4px', border: fieldErrors.Kategori ? '0.8px solid red' : '0.8px solid #ced4da', height: '40px', color: formData.Kategori ? '#272b30' : '#272b30', fontSize: '14px'}}>
                <option value="" style={{ color: '#272b30'}}>Pilih Kategori Pengeluaran</option>
                <option value="GAJI KARYAWAN" style={{ color: '#272b30' }}>GAJI KARYAWAN</option>
                <option value="BIAYA OPERASIONAL" style={{ color: '#272b30' }}>BIAYA OPERASIONAL</option>
              </select>
              <img src="/down.png" alt="" style={{ position: 'absolute', right: '648px', top: '40%', transform: 'translateY(-50%)', width: '11px', height: '11px', pointerEvents: 'none' }}/>
              {fieldErrors.Kategori && (
                <small style={{ display:'block', color:'red', fontSize:'12px', lineHeight:'16px', marginTop:'4px' }}>
                  This field is required.
                </small>
              )}
            </div>

            <div style={{ marginBottom: fieldErrors.Nominal ? '6px' : '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', textShadow: '0.2px 0 currentColor', fontSize: '14px', color: '#4f575e', height: '21px' }}>Nominal <span style={{ color: 'red' }}>*</span></label>
              <input type="number" name="Nominal" value={formData.Nominal} onChange={handleChange} onFocus={(e) => {
                e.target.style.border = '1px solid #053183';
                e.target.style.outline = 'none';
              }}
              onBlur={(e) => e.target.style.border = fieldErrors.Nominal 
              ? '0.8px solid red' : '0.8px solid #ced4da'} style={{ width: '100%', padding: '0px 16px', borderRadius: '4px', border: fieldErrors.Nominal ? '0.8px solid red' : '0.8px solid #ced4da', height: '40px', fontSize: '14px' }} />
              {fieldErrors.Nominal && (
                <small style={{ display:'block', color:'red', fontSize:'12px', lineHeight:'16px', marginTop:'4px' }}>
                  This field is required.
                </small>
              )}
            </div>

            <div style={{ marginBottom: fieldErrors.Deskripsi ? '6px' : '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', textShadow: '0.2px 0 currentColor', fontSize: '14px', color: '#4f575e', height: '21px' }}>Deskripsi <span style={{ color: 'red' }}>*</span></label>
              <input type="text" name="Deskripsi" value={formData.Deskripsi} onChange={handleChange} onFocus={(e) => {
                e.target.style.border = '1px solid #053183';
                e.target.style.outline = 'none';
              }}
              onBlur={(e) => e.target.style.border = fieldErrors.Deskripsi 
              ? '0.8px solid red' : '0.8px solid #ced4da'} style={{ width: '100%', padding: '0px 16px', borderRadius: '4px', border: fieldErrors.Deskripsi ? '0.8px solid red' : '0.8px solid #ced4da' , height: '40px', fontSize: '14px'}} />
              {fieldErrors.Deskripsi && (
                <small style={{ display:'block', color:'red', fontSize:'12px', lineHeight:'16px', marginTop:'4px' }}>
                  This field is required.
                </small>
              )}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#4f575e', height: '21px' }}>No Kamar</label>
              <select name="Kamar_ID" value={formData.Kamar_ID} onChange={handleChange} onFocus={(e) => {
                  e.target.style.border = '1px solid #053183';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => e.target.style.border = fieldErrors.Kamar_ID 
                ? '0.8px solid red' : '0.8px solid #ced4da'} style={{ appearance: 'none', width: '100%', padding: '0px 16px', borderRadius: '4px', border: fieldErrors.Kamar_ID ? '0.8px solid red' : '0.8px solid #ced4da', height: '40px', color: formData.Kamar_ID ? '#272b30' : '#272b30', fontSize: '14px'}}>
                <option value="" style={{ color: '#272b30' }}>Pilih No Kamar</option>
                {rooms.map(room => (
                  <option key={room.Kamar_ID} value={room.Kamar_ID}>{room.No_Kamar}</option>
                ))}
              </select>
              <img src="/down.png" alt="" style={{ position: 'absolute', right: '648px', top: '84.5%', transform: 'translateY(-50%)', width: '11px', height: '11px', pointerEvents: 'none' }}/>
            </div>

            <div style={{ display: 'flex'}}>
              <Link type="button" onClick={() => navigate(-1)} style={{ backgroundColor: '#fff', color: '#479f45', border: '1px solid #479f45', padding: '9px 16px', borderRadius: '4px', textDecoration: 'none', fontWeight: '600', fontSize: '14px', height: '40px', width: '88.61px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>
                Kembali
              </Link>
              <button type="submit" style={{ backgroundColor: '#479f45', color: 'white', border: 'none', padding: '0px 16px', borderRadius: '4px', fontWeight: '600', cursor: 'pointer', marginLeft: '24px', fontSize: '14px', height: '40px', width: '84.3px'}}>
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

export default TambahPengeluaran;