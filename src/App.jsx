import { useState, useRef, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import MapComponent from './components/Map'
import Timeline from './components/Timeline'
import About from './components/About'
import Numbers from './components/Numbers'
import LiveTracker from './components/LiveTracker'
import './App.css'
import { ThemeProvider } from './contexts/ThemeContext'
import { DATA_FILES } from './config'

function App() {
  const [timeRange, setTimeRange] = useState(null) // Start with null until data loads
  const [selectedChapters, setSelectedChapters] = useState([])
  const [chapters, setChapters] = useState([])
  const mapRef = useRef(null)

  // Load chapters data
  useEffect(() => {
    fetch(DATA_FILES.chapters)
      .then(response => response.json())
      .then(data => {
        // Filter out chapters with missing data
        const validChapters = data.filter(chapter => 
          chapter.chapter && chapter.chapter_id && chapter.country
        )
        setChapters(validChapters)
      })
      .catch(error => {
        console.error('Error loading chapters:', error)
      })
  }, [])

  const handleChapterChange = (updatedChapters) => {
    setSelectedChapters(updatedChapters)
  }

  return (
    <ThemeProvider>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={
              <div className="map-page">
                <MapComponent 
                  ref={mapRef}
                  timeRange={timeRange}
                  selectedChapters={selectedChapters}
                  onChapterChange={handleChapterChange}
                  chapters={chapters}
                />
                <Timeline 
                  timeRange={timeRange}
                  setTimeRange={setTimeRange}
                  mapRef={mapRef}
                  selectedChapters={selectedChapters}
                />
              </div>
            } />
            <Route path="/numbers" element={<Numbers />} />
            <Route path="/live" element={<LiveTracker />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App
