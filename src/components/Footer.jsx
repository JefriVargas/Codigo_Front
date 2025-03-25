// src/components/Footer.jsx
import React from 'react';
import './Footer.css'; // Archivo de estilos CSS

export default function Footer() {
  return (
    <div className="footer">
      <a href="https://www.tiktok.com/@max_cs_" target="_blank" rel="noopener noreferrer">
        <img 
          src="/images/tiktok.png" 
          className="footer-icon" 
          alt="TikTok" 
        />
      </a>

      <a href="https://www.instagram.com/tuestilo010/" target="_blank" rel="noopener noreferrer">
        <img
          src="/images/instagram.png" 
          className="footer-icon"
          alt="Instagram"
        />
      </a>

      <a href="https://www.facebook.com/people/Tuestilo/61568596362351/" target="_blank" rel="noopener noreferrer">
        <img
          src="/images/facebook.png"
          className="footer-icon"
          alt="Facebook"
        />
      </a>
    </div>
  );
}