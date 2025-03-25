import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import './SearchByImage.css';

export default function SearchByImage() {
  const navigate = useNavigate();

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

      const response = await fetch('http://89.116.214.23:8000/search', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Error del servidor');

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        let filtered = data.results;
        if (filtered.length > 1) {
          filtered = filtered.slice(1);
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

      setFileObj(file);
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

        <div className="upload-container">
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
                      src={`http://89.116.214.23:8000${item.image_url}`}
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
              src={`http://89.116.214.23:8000${selectedProduct.image_url}`}
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
