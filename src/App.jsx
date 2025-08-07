import { useState, useRef, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import MapComponent from './components/Map'
import Timeline from './components/Timeline'
import About from './components/About'
import Numbers from './components/Numbers'
import Chapters from './components/Chapters'
import LiveTracker from './components/LiveTracker'
import './App.css'
import { ThemeProvider } from './contexts/ThemeContext'
import { initializeConfig, getChaptersData, getDatasetDate } from './config'

function App() {
  const [timeRange, setTimeRange] = useState(null) // Start with null until data loads
  const [sharedChapterSelection, setSharedChapterSelection] = useState([]) // Shared between Map and Chapters
  const [chapters, setChapters] = useState([])
  const [isConfigLoaded, setIsConfigLoaded] = useState(false)
  const [datasetDate, setDatasetDate] = useState(null)
  const mapRef = useRef(null)

  // Initialize configuration and load chapters data
  useEffect(() => {
    const loadData = async () => {
      try {
        const activityData = await initializeConfig()
        
        // Get chapters from the activity data
        const chaptersData = getChaptersData()
        
        // Filter out chapters with missing data
        const validChapters = chaptersData.filter(chapter => 
          chapter.chapter && chapter.chapter_id && chapter.country
        )
        
        setChapters(validChapters)
        setDatasetDate(getDatasetDate())
        setIsConfigLoaded(true)
      } catch (error) {
        console.error('Error initializing configuration:', error)
        setIsConfigLoaded(true) // Still mark as loaded to prevent infinite loading
      }
    }

    loadData()
  }, [])

  const handleSharedChapterChange = (updatedChapters) => {
    setSharedChapterSelection(updatedChapters)
  }

  // Show loading state until config is loaded
  if (!isConfigLoaded) {
    return (
      <ThemeProvider>
        <div className="App">
          <Header />
          <main className="main-content">
            <div className="loading-container" style={{ padding: '2rem', textAlign: 'center' }}>
              <p>Loading configuration...</p>
            </div>
          </main>
        </div>
      </ThemeProvider>
    )
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
                  selectedChapters={sharedChapterSelection}
                  onChapterChange={handleSharedChapterChange}
                  chapters={chapters}
                />
                <Timeline 
                  timeRange={timeRange}
                  setTimeRange={setTimeRange}
                  mapRef={mapRef}
                  selectedChapters={sharedChapterSelection}
                />
              </div>
            } />
            <Route path="/chapters" element={
              <Chapters 
                selectedChapters={sharedChapterSelection}
                onChapterChange={handleSharedChapterChange}
                chapters={chapters}
              />
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
