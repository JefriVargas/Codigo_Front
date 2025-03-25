// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SearchByImage from './SearchByImage';
import Contact from './Contact';
// import Home from './pages/Home'; // si tuvieras una home

export default function App() {
  return (
    <Routes>
      {/* E.g. Ruta principal -> SearchByImage */}
      <Route path="/" element={<SearchByImage />} />
      {/* Ruta /app -> SearchByImage tambien, si prefieres */}
      <Route path="/app" element={<SearchByImage />} />
      {/* Ruta /contact -> Contact */}
      <Route path="/contact" element={<Contact />} />
      {/* Otras rutas */}
    </Routes>
  );
}
