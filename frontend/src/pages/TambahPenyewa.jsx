import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createTenant, getRooms } from '../services/api';

const TambahPenyewa = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    Nama_Lengkap: '',
    No_Hp: '',
    Tgl_Masuk: '',
    Tgl_Keluar: '',
    Kamar_ID: '',
    Status_Sewa: ''
  });

  // State untuk menyimpan teks tampilan No HP di UI
  const [displayNoHp, setDisplayNoHp] = useState('');

  const [rooms, setRooms] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

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

  // Fungsi untuk menyamarkan digit tengah nomor HP
  const maskPhoneNumber = (phone) => {
    // Menghapus semua karakter non-angka
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length <= 6) return cleanPhone;

    const startLength = 4; // 4 digit pertama tetap terlihat (misal: 0812)
    const endLength = 3;   // 3 digit terakhir tetap terlihat

    if (cleanPhone.length <= startLength + endLength) {
      return cleanPhone;
    }

    const start = cleanPhone.slice(0, startLength);
    const end = cleanPhone.slice(-endLength);
    const maskedLength = cleanPhone.length - (startLength + endLength);
    const masked = '*'.repeat(maskedLength);

    return `${start}${masked}${end}`;
  };


const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === 'No_Hp') {
    const rawDigits = value.replace(/\D/g, '');

    setFormData((prev) => ({
      ...prev,
      No_Hp: rawDigits
    }));

    setDisplayNoHp(rawDigits);

    setFieldErrors((prev) => ({
      ...prev,
      No_Hp: false
    }));
  } else {
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: false
    }));
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    let errors = {};
    if (!formData.Nama_Lengkap) errors.Nama_Lengkap = true;
    if (!formData.Tgl_Masuk) errors.Tgl_Masuk = true;
    if (!formData.No_Hp) errors.No_Hp = true;
    if (!formData.Kamar_ID) errors.Kamar_ID = true;
    if (!formData.Status_Sewa) errors.Status_Sewa = true;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage('Mohon Lengkapi Data');
      return;
    }

    // Mengirim payload dengan No_Hp yang sudah di-masking ke backend

const payload = {
  ...formData,
  No_Hp: formData.No_Hp,
  Tgl_Keluar: formData.Tgl_Keluar || null
};

    try {
      await createTenant(payload);
      setSuccessMessage('Data Berhasil Ditambahkan / Diedit');
      setTimeout(() => {
        navigate('/penyewa'); 
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

      <h2 style={{ fontSize: '32px', color: '#111', fontWeight: '600', marginBottom: '32px', margin: '-2px'}}>Tambah Penyewa</h2>
      
      <div style={{ display: 'flex', gap: '20px', marginTop: '32px' }}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '4px', border: '0.8px solid #d9dee3', width: '592px', height: '667.6px'}}>
          <form onSubmit={handleSubmit}>
            
            <div style={{ marginBottom: fieldErrors.Nama_Lengkap ? '4px' : '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#4f575e', height: '21px'}}>Nama <span style={{ color: 'red' }}>*</span></label>
              <input type="text" name="Nama_Lengkap" value={formData.Nama_Lengkap} onChange={handleChange} onFocus={(e) => {
                e.target.style.border = '1px solid #053183';
                e.target.style.outline = 'none';
              }}
              onBlur={(e) => e.target.style.border = fieldErrors.Nama_Lengkap 
              ? '1px solid red' 
              : '1px solid #ccc'} style={{ width: '100%', padding: '0px 16px', borderRadius: '4px', border: fieldErrors.Nama_Lengkap ? '0.8px solid red' : '0.8px solid #ced4da', height: '40px', fontSize: '14px' }} />
              {fieldErrors.Nama_Lengkap && (
                <small style={{ display:'block', color:'red', fontSize:'12px', lineHeight:'16px', marginTop:'4px' }}>
                  This field is required.
                </small>
              )}
            </div>

            <div style={{ marginBottom: fieldErrors.No_Hp ? '4px' : '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#4f575e', height: '21px'}}>No Telepon <span style={{ color: 'red' }}>*</span></label>
              <input 
                type="text" 
                name="No_Hp" 
                value={displayNoHp} 
                onChange={handleChange} 
                onFocus={(e) => {
                  e.target.style.border = '1px solid #053183';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => e.target.style.border = fieldErrors.No_Hp 
                ? '1px solid red' 
                : '1px solid #ccc'} 
                style={{ width: '100%', padding: '0px 16px', borderRadius: '4px', border: fieldErrors.No_Hp ? '0.8px solid red' : '0.8px solid #ced4da', height: '40px', fontSize: '14px' }} 
              />
              {fieldErrors.No_Hp && (
                <small style={{ display:'block', color:'red', fontSize:'12px', lineHeight:'16px', marginTop:'4px' }}>
                  This field is required.
                </small>
              )}
            </div>

            <div style={{ marginBottom: fieldErrors.Tgl_Masuk ? '14px' : '34px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#4f575e', height: '21px'}}>Tanggal Masuk <span style={{ color: 'red' }}>*</span></label>
              <input type="date" name="Tgl_Masuk" value={formData.Tgl_Masuk} onChange={handleChange} onFocus={(e) => {
                e.target.style.border = '1px solid #053183';
                e.target.style.outline = 'none';
              }}
              onBlur={(e) => e.target.style.border = fieldErrors.Tgl_Masuk 
              ? '1px solid red' 
              : '1px solid #ccc'} style={{ width: '100%', padding: '0px 16px', borderRadius: '4px', border: fieldErrors.Tgl_Masuk ? '0.8px solid red' : '0.8px solid #ced4da', height: '40px', fontSize: '14px' }} />
              {fieldErrors.Tgl_Masuk && (
                <small style={{ display:'block', color:'red', fontSize:'12px', lineHeight:'16px', marginTop:'4px' }}>
                  This field is required.
                </small>
              )}
            </div>

            <div style={{ marginBottom: '34px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#4f575e', height: '21px'}}>Tanggal Keluar</label>
              <input type="date" name="Tgl_Keluar" value={formData.Tgl_Keluar} onChange={handleChange} onFocus={(e) => {
                e.target.style.border = '1px solid #053183';
                e.target.style.outline = 'none';
              }}
              onBlur={(e) => e.target.style.border = fieldErrors.Tgl_Keluar 
              ? '1px solid red' 
              : '1px solid #ccc'} style={{ width: '100%', padding: '0px 16px', borderRadius: '4px', border: fieldErrors.Tgl_Keluar ? '0.8px solid red' : '0.8px solid #ced4da', height: '40px', fontSize: '14px' }} />
            </div>

            <div style={{ marginBottom: fieldErrors.Kamar_ID ? '4px' : '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#4f575e', height: '21px'}}>Nomor Kamar <span style={{ color: 'red' }}>*</span></label>
              <select name="Kamar_ID" value={formData.Kamar_ID} onChange={handleChange} onFocus={(e) => {
                  e.target.style.border = '1px solid #053183';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => e.target.style.border = fieldErrors.Kamar_ID 
                ? '1px solid red' 
                : '1px solid #ccc'} style={{ appearance: 'none', width: '100%', padding: '0px 16px', borderRadius: '4px', border: fieldErrors.Kamar_ID ? '0.8px solid red' : '0.8px solid #ced4da', height: '40px', fontSize: '14px' }}>
                <option value="" style={{ color: '#272b30'}}>Pilih Nomor Kamar</option>
                {rooms.map(room => (
                  <option key={room.Kamar_ID} value={room.Kamar_ID}>{room.No_Kamar}</option>
                ))}
              </select>
              <img src="/down.png" alt="" style={{ position: 'absolute', right: '646px', top: '73%', transform: 'translateY(-50%)', width: '11px', height: '11px', pointerEvents: 'none' }}/>
              {fieldErrors.Kamar_ID && (
                <small style={{ display:'block', color:'red', fontSize:'12px', lineHeight:'16px', marginTop:'4px' }}>
                  This field is required.
                </small>
              )}
            </div>

            <div style={{ marginBottom: fieldErrors.Status_Sewa ? '4px' : '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#4f575e', height: '21px'}}>Status Sewa <span style={{ color: 'red' }}>*</span></label>
              <select name="Status_Sewa" value={formData.Status_Sewa} onChange={handleChange} onFocus={(e) => {
                  e.target.style.border = '1px solid #053183';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => e.target.style.border = fieldErrors.Status_Sewa 
                ? '1px solid red' 
                : '1px solid #ccc'} style={{ appearance: 'none', width: '100%', padding: '0px 16px', borderRadius: '4px', border: fieldErrors.Status_Sewa ? '0.8px solid red' : '0.8px solid #ced4da', height: '40px', fontSize: '14px' }}>
                <option value="" style={{ color: '#272b30'}}>Pilih Status Sewa</option>
                <option value="AKTIF" style={{ color: '#272b30'}}>AKTIF</option>
                <option value="NON AKTIF" style={{ color: '#272b30'}}>NON AKTIF</option>
              </select>
              <img src="/down.png" alt="" style={{ position: 'absolute', right: '646px', top: '85.5%', transform: 'translateY(-50%)', width: '11px', height: '11px', pointerEvents: 'none' }}/>
              {fieldErrors.Status_Sewa && (
                <small style={{ display:'block', color:'red', fontSize:'12px', lineHeight:'16px', marginTop:'4px' }}>
                  This field is required.
                </small>
              )}
            </div>

            <div style={{ display: 'flex'}}>
              <Link type="button" onClick={() => navigate(-1)} style={{ backgroundColor: '#fff', color: '#479f45', border: '1px solid #479f45', padding: '9px 16px', borderRadius: '4px', textDecoration: 'none', fontWeight: '500', fontSize: '14px', height: '40px', textShadow: '0.2px 0 currentColor', width: '88.61px'}}>
                Kembali
              </Link>
              <button type="submit" style={{ backgroundColor: '#479f45', color: 'white', border: 'none', padding: '0px 16px', borderRadius: '4px', fontWeight: '500', cursor: 'pointer', marginLeft: '16px', fontSize: '14px', height: '40px', width: '84.3px', textShadow: '0.2px 0 currentColor', margin: '0px 0px 0px 24px'}}>
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

export default TambahPenyewa;