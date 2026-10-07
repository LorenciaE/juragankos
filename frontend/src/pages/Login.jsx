import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // State untuk menangani pesan error banner dan border merah pada field
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMessage('');

    let errors = {};
    if (!username) errors.username = true;
    if (!password) errors.password = true;

    // Jika ada kolom yang kosong saat ditekan login
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage('Invalid username or password.');
      return;
    }

    // Jika lolos validasi, arahkan ke dashboard
    navigate('/');
  };

  const handleInputChange = (field, value) => {
    if (field === 'username') setUsername(value);
    if (field === 'password') setPassword(value);
    
    // Hapus tanda merah pada field saat user mulai mengetik kembali
    setFieldErrors({ ...fieldErrors, [field]: false });
  };

  // --- STYLING PERSIS OUTSYSTEMS (MENGIKUTI KODE ANDA) ---
  const backgroundStyle = {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#083487', // Biru gelap khas OutSystems
    margin: 0,
    position: 'fixed', // Fixed agar benar-benar diam menutupi layar
    top: 0,
    left: 0,
    zIndex: 9999,
    fontFamily: '"Open Sans", "Segoe UI", Helvetica, Arial, sans-serif' // Font bawaan OS
  };

  const cardStyle = {
    backgroundColor: '#ffffff',
    padding: '60px 50px', // Jarak dalam kotak yang lega
    borderRadius: '4px',
    width: '620px',
    height: '500px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)', // Shadow halus
    textAlign: 'center',
    boxSizing: 'border-box',
    position: 'relative' // Diperlukan agar banner error merah bisa diposisikan di atas card
  };

  const bannerErrorStyle = {
    position: 'absolute',
    top: '-65px',
    left: '0',
    width: '100%',
    backgroundColor: '#dc3545', // Warna merah alert
    color: '#ffffff',
    padding: '14px 20px',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    textAlign: 'left',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
  };

  const logoContainerStyle = {
    width: '150px',
    height: '170px',
    margin: '0 auto 30px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '50%',
    overflow: 'hidden', // Memastikan gambar logo nanti tetap bulat
    backgroundColor: '#fff',
    marginTop: '-8px'
  };

  const titleStyle = {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111111',
    marginBottom: '10px',
    marginTop: '-30px'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    marginBottom: '0px',
    color: '#000000',
    fontWeight: '600', // Agak tebal
    textAlign: 'left'
  };

  const getInputStyle = (hasError) => ({
    width: '100%',
    padding: '8px 0', // Padding atas bawah, tanpa padding kiri-kanan
    border: 'none', // Hilangkan semua garis tepi
    // Jika error, garis bawah jadi merah. Jika normal, abu-abu tipis.
    borderBottom: hasError ? '2px solid #dc3545' : '1px solid #dcdcdc', 
    borderRadius: '0', // Hilangkan efek melengkung di sudut
    outline: 'none', // Hilangkan efek outline bawaan browser
    fontSize: '15px',
    color: '#4f575e',
    backgroundColor: 'transparent',
    transition: 'border-bottom 0.2s ease' // Efek transisi mulus
  });

  const buttonStyle = {
    width: '100%',
    padding: '14px',
    backgroundColor: '#fdb73b', // Kuning-Oranye persis gambar
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    height: '40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '5px'
  };

  return (
    <div style={backgroundStyle}>
      <div style={cardStyle}>
      
        {/* Banner Merah di atas Card saat gagal login / field kosong */}
        {errorMessage && (
          <div style={bannerErrorStyle}>
            <span style={{ fontSize: '16px' }}>❌</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <div style={logoContainerStyle}>
            <img 
              src="/logo.png.png" 
              alt="Logo JuraganKos" 
              style={{ 
                width: '147px', 
                height: '168px', 
                margin: '0 auto 30px', 
                display: 'block', 
                objectFit: 'contain' // Agar gambar tidak penyok/terpotong
              }} 
            />
        </div>

        <h2 style={titleStyle}>
          Hi! Selamat Datang Kembali!
        </h2>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '24px', textAlign: 'left' }}>
            <label style={labelStyle}>
              Username <span style={{ color: '#dc3545'}}>*</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              style={getInputStyle(fieldErrors.username)}
              required
              // Saat diklik: garis bawah jadi biru gelap dan lebih tebal (kecuali sedang error merah)
              onFocus={(e) => {
                if (!fieldErrors.username) e.target.style.borderBottom = '2px solid #0a3a75';
              }}
              // Saat dilepas: garis bawah kembali abu-abu tipis
              onBlur={(e) => {
                if (!fieldErrors.username) e.target.style.borderBottom = '1px solid #dcdcdc';
              }}
            />
            {fieldErrors.username && (
              <small style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                This field is required.
              </small>
            )}
          </div>

          <div style={{ marginBottom: '30px', marginTop: '-20px', textAlign: 'left' }}>
            <label style={labelStyle}>
              Password <span style={{ color: '#dc3545' }}>*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              style={getInputStyle(fieldErrors.password)}
              required
              // Saat diklik: garis bawah jadi biru gelap dan lebih tebal
              onFocus={(e) => {
                if (!fieldErrors.password) e.target.style.borderBottom = '2px solid #0a3a75';
              }}
              // Saat dilepas: garis bawah kembali abu-abu tipis
              onBlur={(e) => {
                if (!fieldErrors.password) e.target.style.borderBottom = '1px solid #dcdcdc';
              }}
            />
            {fieldErrors.password && (
              <small style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                This field is required.
              </small>
            )}
          </div>

          <button 
            type="submit" 
            style={buttonStyle}
            // Efek hover sedikit lebih gelap
            onMouseEnter={(e) => e.target.style.backgroundColor = '#e5a532'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#fdb73b'}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;