import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import './Contact.css';

// Convierte base64 a File
function base64ToFile(base64, filename = 'imageFromSearch.jpg') {
  const arr = base64.split(',');
  if (arr.length < 2) return null;
  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch) return null;

  const mime = mimeMatch[1];
  const bStr = atob(arr[1]);
  let n = bStr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bStr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export default function Contact() {
  const location = useLocation();

  // Datos de formulario
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [detalleAdicional, setDetalleAdicional] = useState('');

  // Imagen
  const [isDragging, setIsDragging] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [fileObj, setFileObj] = useState(null);

  // Para mostrar "Enviando..." mientras se procesa
  const [isSending, setIsSending] = useState(false);

  // Snackbar
  const [snackbarMsg, setSnackbarMsg] = useState(null);
  const timerRef = useRef(null);

  const showSnackbar = (message) => {
    setSnackbarMsg(message);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setSnackbarMsg(null);
    }, 3000);
  };

  // Cargar base64 si venimos de SearchByImage
  useEffect(() => {
    if (location.state?.base64) {
      setSelectedImage(location.state.base64);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [location.state]);

  // Requerimos: nombre, teléfono, imagen
  const isFormComplete = nombre.trim() && telefono.trim() && selectedImage;

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target.result);
      };
      reader.readAsDataURL(file);
      toBase64(file);
      setFileObj(file);
    }
  };

  // Convertir File -> base64
  const toBase64 = (file) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      setSelectedImage(evt.target.result);
    };
    reader.readAsDataURL(file);
  };

  // DRAG & DROP
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      toBase64(file);
      setFileObj(file);
      // Limpia dataTransfer
      e.dataTransfer.clearData();
    }
  };

  // Eliminar imagen
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setFileObj(null);
  };

  // Enviar al backend
  const handleEnviar = async () => {
    if (!isFormComplete) {
      showSnackbar('Completa todos los campos y la imagen antes de enviar.');
      return;
    }

    try {
      setIsSending(true); // Muestra "Enviando..."

      const formData = new FormData();
      formData.append('name', nombre);
      formData.append('phone', telefono);
      // El backend asocia "message" con nuestro 'detalleAdicional'
      formData.append('message', detalleAdicional);

      // Convertir base64 a File si no tenemos fileObj
      let finalFile = fileObj;
      if (!finalFile && selectedImage) {
        finalFile = base64ToFile(selectedImage);
      }
      if (finalFile) {
        formData.append('image', finalFile);
      }

      const response = await fetch('https://api.tuestilo.xyz/contact', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Error al enviar el formulario');
      }

      const data = await response.json();
      showSnackbar('¡Correo enviado con éxito!');

      // Limpiamos
      setNombre('');
      setTelefono('');
      setDetalleAdicional('');
      setSelectedImage(null);
      setFileObj(null);

      console.log('Respuesta del backend:', data);
    } catch (error) {
      showSnackbar(error.message);
    } finally {
      // Quita "Enviando..."
      setIsSending(false);
    }
  };

  return (
    <div className="contact-container">
      <Header />

      <div className="contact-main">
        <h1 className="contact-title">Contactanos</h1>
        <p className="contact-subtext">
          Llena este formulario y te responderemos con tu prenda lo antes posible
        </p>

        <label className="label-bold">Nombre</label>
        <input
          className="single-line-input"
          type="text"
          placeholder="Jose Luis"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <div className="form-row">
          <div className="form-group">
            <label className="label-bold">Teléfono</label>
            <input
              className="single-line-input"
              type="tel"
              placeholder="+51 984 193 485"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </div>
        </div>

        <label className="label-bold">Algún detalle adicional</label>
        <textarea
          className="multiline-input"
          placeholder="Mensajes..."
          value={detalleAdicional}
          onChange={(e) => setDetalleAdicional(e.target.value)}
        />

        {/* Imagen */}
        <label className="label-bold">Imagen</label>
        <div className="upload-container"
        // Asignamos los eventos de drag & drop
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          borderColor: isDragging ? 'blue' : '#999', 
          // algún estilo condicional para indicar hover
        }}
      >
          {!selectedImage ? (
            <label className="upload-label">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
              <img
                src="/images/Upload.jpg"
                className="upload-icon"
                alt="Subir imagen"
              />
              <p className="bold-text">
                Drag and drop or <span className="browse-text">browse</span> to upload
              </p>
              <p className="small-text">PNG, JPG, GIF up to 10MB</p>
            </label>
          ) : (
            <div className="image-preview">
              <img
                src={selectedImage}
                className="selected-image"
                alt="Previsualización"
              />
              <button className="close-image-button" onClick={handleRemoveImage}>
                ×
              </button>
            </div>
          )}
        </div>

        <div className="submit-row">
          <button
            className={`send-button ${!isFormComplete ? 'disabled' : ''}`}
            onClick={handleEnviar}
            disabled={!isFormComplete}
          >
            Enviar
          </button>
        </div>
      </div>

      <Footer />

      {/* Snackbar */}
      {snackbarMsg && (
        <div className="snackbar2">
          {snackbarMsg}
        </div>
      )}

      {/* Overlay "Enviando..." */}
      {isSending && (
        <div className="loading-overlay">
          <div className="loading-message">Enviando...</div>
        </div>
      )}
    </div>
  );
}
