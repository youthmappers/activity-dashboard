import { useState, useRef, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import MapComponent from './components/Map'
import Timeline from './components/Timeline'
import About from './components/About'
import Numbers from './components/Numbers'
import LiveTracker from './components/LiveTracker'
import './App.css'
import * as d3 from 'd3'

function App() {
  const [timeRange, setTimeRange] = useState(null) // Start with null until data loads
  const [selectedChapters, setSelectedChapters] = useState([])
  const [chapters, setChapters] = useState([])
  const mapRef = useRef(null)

  // Load chapters data
  useEffect(() => {
    fetch('/data/chapters_and_uids.json')
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

  return (
    <div className="app-container">
      <Header />
      <Routes>
        <Route path="/" element={
          <main className="main-content">
            <div className="map-section">
              <MapComponent 
                ref={mapRef} 
                timeRange={timeRange}
                selectedChapters={selectedChapters}
                onChapterChange={setSelectedChapters}
                chapters={chapters}
              />
            </div>
            <div className="timeline-section">
              <Timeline 
                timeRange={timeRange} 
                setTimeRange={setTimeRange} 
                mapRef={mapRef}
                selectedChapters={selectedChapters}
              />
            </div>
          </main>
        } />
        <Route path="/numbers" element={<Numbers />} />
        <Route path="/live" element={<LiveTracker />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  )
}

export default App
