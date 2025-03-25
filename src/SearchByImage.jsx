import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import './SearchByImage.css';

export default function SearchByImage() {
  const navigate = useNavigate();

  const [isDragging, setIsDragging] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [fileObj, setFileObj] = useState(null);

  const [searchResults, setSearchResults] = useState([]);
  const [imagesToShow, setImagesToShow] = useState(0);
  const [modelDone, setModelDone] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const [isLoading, setIsLoading] = useState(false);

  // **SnackBar**: mensaje y setMensaje
  const [snackbarMsg, setSnackbarMsg] = useState(null);
  // Timer para ocultar el mensaje después de X segundos
  const timerRef = useRef(null);

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Función para mostrar el snackbar
  const showSnackbar = (message) => {
    setSnackbarMsg(message);
    // Ocultar tras 3 seg
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setSnackbarMsg(null);
    }, 3000);
  };

  const openModalForItem = (item) => {
    setSelectedProduct(item);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedProduct(null);
  };

  const uploadImage = async (file) => {
    try {
      setIsLoading(true);
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('https://api.tuestilo.xyz/search', {
        method: 'POST',
        body: formData,
        headers: {
          // No incluir Content-Type aquí porque es multipart/form-data
      },
      });

      if (!response.ok) throw new Error('Error del servidor');

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        let filtered = data.results;
        if (filtered.length > 1) {
          filtered = filtered.slice(0);
        }

        setSearchResults(filtered);
        setModelDone(true);
        setImagesToShow(3);
      } else {
        showSnackbar('No se encontraron resultados similares.');
        setSearchResults([]);
        setModelDone(false);
      }
    } catch (error) {
      showSnackbar(error.message);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleBuscar = () => {
    if (!fileObj) {
      showSnackbar('Primero selecciona una imagen');
      return;
    }
    uploadImage(fileObj);
  };

  const handleCancel = () => {
    setSelectedImage(null);
    setFileObj(null);
    setSearchResults([]);
    setModelDone(false);
    setImagesToShow(0);
  };

  const handleShowMore = () => {
    setImagesToShow((prev) => prev + 3);
  };

  const handleNotFound = () => {
    navigate('/contact', { state: { base64: selectedImage } });
  };

  const chunkResults = (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  const displayedItems = searchResults.slice(0, imagesToShow);
  const rows = chunkResults(displayedItems, 3);

  return (
    <div className="container">
      <Header />

      <div className="main-content">
        <h1 className="main-title">Encuentra tu producto con una Foto</h1>

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
                Arrastra o <span className="browse-text">selecciona</span> una imagen
              </p>
              <p className="small-text">Formatos: PNG, JPG, GIF hasta 10MB</p>
            </label>
          ) : (
            <img
              src={selectedImage}
              className="selected-image"
              style={{ width: windowWidth * 0.6 }}
              alt="Previsualización"
            />
          )}
        </div>

        <div className="guidelines-container">
          {/* Fila 1: Título a la izquierda, texto a la derecha */}
          <div className="guidelines-row">
            <div className="guidelines-title">
              <p>
              <strong>Requisitos para<br/>cargar<br/>imágenes:</strong>
              </p>
            </div>
            <div className="guidelines-text">
              <p> El tamaño debe ser inferior a 10 MB, el lado más largo de la imagen debe ser menor de 4000px<br/>
              Las fotos de ropa deben ser planas y sin obstrucciones. No se admiten imágenes con múltiples artículos, prendas dobladas u obstruidas, vistas no frontales, fotos de modelos ni fotos de maniquíes.</p>
            </div>
          </div>

          {/* Fila 2: Ejemplos de imágenes (3 buenas y 3 malas) */}
          <div className="guidelines-examples-row">
          <div className="guidelines-title">
          <p>
              <strong>Ejemplo de<br/>imagen subida:</strong>
              </p>
            </div>
            {/* Ejemplo: 3 "buenas" */}
            <div className="guidelines-example good">
              <img src="/images/Correcto1.jpg" alt="Buena imagen 1" />
            </div>
            <div className="guidelines-example good">
              <img src="/images/Correcto2.jpg" alt="Buena imagen 2" />
            </div>
            <div className="guidelines-example good">
              <img src="/images/Correcto3.jpg" alt="Buena imagen 3" />
            </div>

            {/* Ejemplo: 3 "malas" */}
            <div className="guidelines-example bad">
              <img src="/images/Incorrecto1.jpg" alt="Mala imagen 1" />
            </div>
            <div className="guidelines-example bad">
              <img src="/images/Incorrecto2.jpg" alt="Mala imagen 2" />
            </div>
            <div className="guidelines-example bad">
              <img src="/images/Incorrecto3.jpg" alt="Mala imagen 3" />
            </div>
          </div>
        </div>

        <div className="button-row">
          <button className="action-button" onClick={handleBuscar}>
            BUSCAR
          </button>
          <button className="cancel-button" onClick={handleCancel}>
            CANCELAR
          </button>
        </div>

        {modelDone && displayedItems.length > 0 && (
          <div className="results-container">
            <h2 className="sub-title">Resultados de la búsqueda:</h2>

            <div className="not-found-container" onClick={handleNotFound}>
              <p className="not-found-text">¿No es lo que buscabas?</p>
            </div>

            {rows.map((row, rowIndex) => (
              <div className="results-list" key={rowIndex}>
                {row.map((item, i) => (
                  <div
                    className="result-card"
                    key={i}
                    onClick={() => openModalForItem(item)}
                  >
                    <img
                      src={`https://api.tuestilo.xyz${item.image_url}`}
                      alt="Prenda"
                      className="card-image"
                    />
                    <div className="store-info">
                      <div className="store-name">{item.store?.name || 'Tienda'}</div>
                      <div className="store-location">{item.store?.location || ''}</div>
                      <div className="store-phone">{item.store?.phone || ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {imagesToShow < searchResults.length && (
              <div className="show-more-container" onClick={handleShowMore}>
                <img
                  src="/images/showmore.png"
                  className="show-more-icon"
                  alt="Mostrar más"
                />
                <p className="show-more-text">Mostrar más</p>
              </div>
            )}

          </div>
        )}
      </div>

      <Footer />

      {modalVisible && selectedProduct && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-button" onClick={closeModal}>
              ×
            </button>
            <img
              src={`https://api.tuestilo.xyz${selectedProduct.image_url}`}
              alt="Prenda grande"
              className="modal-big-image"
            />
          </div>
        </div>
      )}

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-message">Buscando resultados...</div>
        </div>
      )}

      {/* SnackBar */}
      {snackbarMsg && (
        <div className="snackbar">
          {snackbarMsg}
        </div>
      )}
    </div>
  );
}
