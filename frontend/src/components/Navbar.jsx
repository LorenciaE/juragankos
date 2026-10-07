import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-links">
        <img style={{width: '31.9px', height: '32px', margin: '0px 8px 0px 0px', marginLeft: '135px', borderRadius: '4px'}}src="/logo.png.png" alt="JuraganKos" className="navbar-logo"/>
        <h2 style={{fontSize: 14, fontWeight: 600, marginLeft: '-20px', marginRight: '-5px'}}>JuraganKos</h2>
        <Link style={{fontSize:14, fontWeight: 600}}to="/">Dashboard</Link>
        <Link style={{fontSize:14, fontWeight: 600}}to="/kamar">Kamar</Link>
        <Link style={{fontSize:14, fontWeight: 600}}to="/pengeluaran">Pengeluaran</Link>
        <Link style={{fontSize:14, fontWeight: 600}}to="/penyewa">Penyewa</Link>
      </div>
      <div>
        <Link style= {{fontSize: '14px'}}to="/login" className="logout-btn">
          [➔ Logout
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;