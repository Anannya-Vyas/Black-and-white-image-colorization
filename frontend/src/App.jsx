import { useState, useRef, useEffect } from 'react'
import './index.css'

function App() {
  const [image, setImage] = useState(null)
  const [originalUrl, setOriginalUrl] = useState(null)
  const [colorizedUrl, setColorizedUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [sliderPos, setSliderPos] = useState(50)
  const containerRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => {
    setDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      processFile(file)
    }
  }

  const processFile = (file) => {
    setImage(file)
    setOriginalUrl(URL.createObjectURL(file))
    setColorizedUrl(null)
  }

  const handleUpload = async () => {
    if (!image) return
    setLoading(true)
    
    const formData = new FormData()
    formData.append('image', image)

    try {
      const response = await fetch('/api/colorize', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      if (data.image) {
        setColorizedUrl(data.image)
      } else {
        alert("Error: " + (data.error || "Unknown error"))
      }
    } catch (err) {
      console.error(err)
      alert("Failed to connect to the AI engine. Please check your internet connection or try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSliderMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.pageX - rect.left
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPos(percent)
  }

  return (
    <div className="animate-fade-in">
      <header>
        <h1 className="hero-text">Chrome Neural Colorizer</h1>
        <p className="sub-text">Transform vintage black & white memories into vibrant colors using Machine Learning & Neural Networks.</p>
      </header>

      <main>
        {!colorizedUrl && (
          <div 
            className={`glass upload-zone ${dragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('fileInput').click()}
          >
            <input 
              type="file" 
              id="fileInput" 
              hidden 
              onChange={(e) => processFile(e.target.files[0])} 
              accept="image/*"
            />
            {originalUrl ? (
              <img src={originalUrl} style={{ maxWidth: '100%', borderRadius: '12px' }} alt="Original Preview" />
            ) : (
              <div>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <p style={{ marginTop: '1rem', fontWeight: 600 }}>Drop your B&W photo here or click to browse</p>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Supports JPG, PNG, WebP</p>
              </div>
            )}
          </div>
        )}

        {originalUrl && !colorizedUrl && (
          <button 
            className="btn-primary" 
            onClick={handleUpload} 
            disabled={loading}
            style={{ marginBottom: '2rem' }}
          >
            {loading ? 'Processing through Neural Network...' : 'Colorize this Image'}
          </button>
        )}

        {colorizedUrl && (
          <div className="animate-fade-in">
            <div 
              className="comparison-container" 
              ref={containerRef}
              onMouseMove={handleSliderMove}
              onTouchMove={(e) => handleSliderMove(e.touches[0])}
            >
              {/* The "After" image is the base */}
              <img src={colorizedUrl} className="comparison-image" alt="Colorized" />
              
              {/* The "Before" image is overlaid and clipped */}
              <div 
                className="after-image" 
                style={{ 
                  width: `${sliderPos}%`,
                  backgroundImage: `url(${originalUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'left center',
                  clipPath: `inset(0 ${100 - sliderPos}% 0 0)`
                }}
                role="img"
                aria-label="Original grayscale overlay"
              >
                <img src={originalUrl} className="comparison-image" style={{ width: 'auto', height: '100%', visibility: 'hidden' }} alt="" />
              </div>

              {/* Slider Handle */}
              <div className="slider-handle" style={{ left: `${sliderPos}%` }}></div>
              
              <div style={{ position: 'absolute', bottom: '10px', left: '10px', zIndex: 4, background: 'rgba(0,0,0,0.5)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Grayscale Original</div>
              <div style={{ position: 'absolute', bottom: '10px', right: '10px', zIndex: 4, background: 'rgba(0,0,0,0.5)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Neural Reconstruction</div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn-primary" style={{ background: '#1e293b' }} onClick={() => { setColorizedUrl(null); setOriginalUrl(null); setImage(null); }}>Start New</button>
              <a href={colorizedUrl} download="colorized.jpg" className="btn-primary">Download Result</a>
            </div>
          </div>
        )}
      </main>

      <footer className="glass" style={{ marginTop: '4rem', padding: '2rem', borderRadius: '24px 24px 0 0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <p style={{ fontWeight: 700, fontSize: '1.1rem', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Built by Anannya Vyas
          </p>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '600px', lineHeight: '1.6' }}>
            This project explores the intersection of Computer Vision and Deep Learning. It uses a Caffe-based Convolutional Neural Network to predict color distributions for grayscale images.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
            <a href="https://github.com/Anannya-Vyas/Black-and-white-image-colorization" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              GitHub Project
            </a>
            <a href="https://github.com/Anannya-Vyas/Black-and-white-image-colorization/blob/master/COMPREHENSIVE_GUIDE.md" target="_blank" rel="noopener noreferrer" style={{ color: '#8b5cf6', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📚 Technical Guide
            </a>
          </div>
          <p style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.8rem' }}>
            Open Source • Contribute via Pull Requests • MIT License
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
