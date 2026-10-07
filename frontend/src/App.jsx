import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Kamar from './pages/Kamar';
import TambahKamar from './pages/TambahKamar';
import EditKamar from './pages/EditKamar';
import DetailKamar from './pages/DetailKamar';
import Pengeluaran from './pages/Pengeluaran';
import TambahPengeluaran from './pages/TambahPengeluaran';
import EditPengeluaran from './pages/EditPengeluaran';
import Penyewa from './pages/Penyewa';
import TambahPenyewa from './pages/TambahPenyewa';
import EditPenyewa from './pages/EditPenyewa';
import Pembayaran from './pages/Pembayaran';
import TambahPembayaran from './pages/TambahPembayaran';
import EditPembayaran from './pages/EditPembayaran';
import Login from './pages/Login'; // <--- Import halaman Login

// Komponen Pembungkus Layout
const Layout = () => {
  const location = useLocation();
  // Cek apakah halaman saat ini adalah halaman login
  const isLoginPage = location.pathname === '/login';

  return (
    <>
      {/* Navbar HANYA muncul jika BUKAN di halaman login */}
      {!isLoginPage && <Navbar />}
      
      {/* Container class (padding) HANYA dipakai jika BUKAN di halaman login */}
      <div className={!isLoginPage ? "container" : ""}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Dashboard />} />
          
          <Route path="/kamar" element={<Kamar />} />
          <Route path="/kamar/tambah" element={<TambahKamar />} />
          <Route path="/kamar/edit/:id" element={<EditKamar />} />
          <Route path="/kamar/detail/:id" element={<DetailKamar />} />
          <Route path="/kamar/:id/pembayaran" element={<Pembayaran />} />
          <Route path="/kamar/:id/pembayaran/tambah" element={<TambahPembayaran />} />
          <Route path="/kamar/:id/pembayaran/edit/:paymentId" element={<EditPembayaran />} />
          
          <Route path="/pengeluaran" element={<Pengeluaran />} />
          <Route path="/pengeluaran/tambah" element={<TambahPengeluaran />} />
          <Route path="/pengeluaran/edit/:id" element={<EditPengeluaran />} />
          
          <Route path="/penyewa" element={<Penyewa />} />
          <Route path="/penyewa/tambah" element={<TambahPenyewa />} />
          <Route path="/penyewa/edit/:id" element={<EditPenyewa />} />
        </Routes>
      </div>
    </>
  );
};

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;