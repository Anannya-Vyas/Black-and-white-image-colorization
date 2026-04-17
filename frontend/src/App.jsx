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
      const response = await fetch('http://localhost:5000/api/colorize', {
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
      alert("Failed to connect to backend server. Make sure it is running on port 5000.")
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
        <h1 className="hero-text">ChromeAI Colorize</h1>
        <p className="sub-text">Transform vintage black & white memories into vibrant colors with Neural Networks.</p>
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
            {loading ? 'Processing through AI...' : 'Colorize this Image'}
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
              
              <div style={{ position: 'absolute', bottom: '10px', left: '10px', zIndex: 4, background: 'rgba(0,0,0,0.5)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Grayscale</div>
              <div style={{ position: 'absolute', bottom: '10px', right: '10px', zIndex: 4, background: 'rgba(0,0,0,0.5)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>AI Colorized</div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn-primary" style={{ background: '#1e293b' }} onClick={() => { setColorizedUrl(null); setOriginalUrl(null); setImage(null); }}>Start New</button>
              <a href={colorizedUrl} download="colorized.jpg" className="btn-primary">Download Result</a>
            </div>
          </div>
        )}
      </main>

      <footer style={{ marginTop: '4rem', color: '#475569', fontSize: '0.8rem' }}>
        Built with OpenCV DNN & Python Backend • Powered by Neural Networks
      </footer>
    </div>
  )
}

export default App
