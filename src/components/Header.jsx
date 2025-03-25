// src/components/Header.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="header">
      <img 
        src="/images/logo blanco.png" 
        className="logo" 
        alt="Logo TuEstilo" 
      />
      
      <div className="header-right">
        <button 
          className="header-link"
          onClick={() => navigate('/App')}
        >
          Búsqueda por Imágenes
        </button>
        
        <button 
          className="header-link"
          onClick={() => navigate('/Contact')}
        >
          Contáctanos
        </button>
      </div>
    </header>
  );
}