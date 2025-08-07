import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import maplibregl from 'maplibre-gl'
import { Protocol } from 'pmtiles'
import './Map.css'
import { addAllLayers, updateLayerFilters, clearAllFilters } from '../styles/mapLayers'
import ChapterSearch from './ChapterSearch'
import GlobeControl from './GlobeControl.jsx'
import BboxControl from './BboxControl.jsx'
import { useTheme } from '../contexts/ThemeContext'
import { CONFIG, DATA_FILES, getStaticCdnUrl } from '../config'

const MapComponent = forwardRef(({ timeRange, selectedChapters, onChapterChange, chapters }, ref) => {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const { darkMode } = useTheme()
  const mapInitialized = useRef(false)

  // Helper function to build popup content (similar to the old buildPopUp function)
  const buildPopUp = (properties) => {
    const MONTHS = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    
    const date = new Date(properties.timestamp * 1000)
    const chapterName = CONFIG.getChapter(properties.chapter_id)?.chapter || `Chapter ${properties.chapter_id}`
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 200px;">
        <h5 style="margin: 0 0 5px 0; color: #FF6B35;">${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}</h5>
        <h6 style="margin: 0 0 10px 0; color: #666;">${chapterName}</h6>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 2px 5px; font-weight: bold;">${properties.buildings || 0}</td><td style="padding: 2px 5px;">Buildings</td></tr>
          <tr><td style="padding: 2px 5px; font-weight: bold;">${properties.amenities || 0}</td><td style="padding: 2px 5px;">Amenities</td></tr>
          <tr><td style="padding: 2px 5px; font-weight: bold;">${properties.highways || 0}</td><td style="padding: 2px 5px;">Highways</td></tr>
          <tr><td style="padding: 2px 5px; font-weight: bold;">${properties.all_feats - (properties.highways || 0) - (properties.amenities || 0) - (properties.buildings || 0)}</td><td style="padding: 2px 5px;">Other features</td></tr>
        </table>
      </div>
    `
  }

  // Function to add hover functionality to centroids
  const addCentroidsHover = () => {
    if (!map.current) return

    // Create popup instance
    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false
    })

    // Mouse enter event
    map.current.on('mouseenter', 'centroids', (e) => {
      // Change cursor to pointer
      map.current.getCanvas().style.cursor = 'pointer'
      
      // Get feature properties
      const coordinates = e.lngLat
      const properties = e.features[0].properties
      
      // Set popup content and location
      popup.setLngLat(coordinates)
        .setHTML(buildPopUp(properties))
        .addTo(map.current)
    })

    // Mouse leave event
    map.current.on('mouseleave', 'centroids', () => {
      // Reset cursor
      map.current.getCanvas().style.cursor = ''
      // Remove popup
      popup.remove()
    })
  }

  // Expose the map object via ref
  useImperativeHandle(ref, () => ({
    getMap: () => map.current
  }))

  // Function to get the appropriate map style based on theme
  const getMapStyle = () => {
    return darkMode 
      ? 'https://api.maptiler.com/maps/a075bd9b-8334-4046-bc04-fb3e9027ea4d/style.json?key=lKNWNcFzZ8CaRdTSSYvy'
      : 'https://api.maptiler.com/maps/67271b54-3f5f-480c-b7d2-b99f551113fa/style.json?key=lKNWNcFzZ8CaRdTSSYvy'
  }

  // Function to add all sources and layers
  const addSourcesAndLayers = () => {
    if (!map.current) return
    
    // Add terrain source
    map.current.addSource("maptiler3D", {
      "type": "raster-dem",
      "url": "https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=lKNWNcFzZ8CaRdTSSYvy",
    })

    // Add tilesets using dynamic CDN URLs
    map.current.addSource('r8agg', {
      type: "vector",
      url: `pmtiles://${DATA_FILES.tiles.res8()}`
    })
    map.current.addSource('r8agg_bboxes', {
      type: "vector",
      url: `pmtiles://${DATA_FILES.tiles.res8Bboxes()}`
    })
    map.current.addSource('r6agg', {
      type: "vector",
      url: `pmtiles://${DATA_FILES.tiles.res6()}`
    })
    map.current.addSource('r4agg', {
      type: "vector",
      url: `pmtiles://${DATA_FILES.tiles.res4()}`
    })

    let ymlogo;
    (async () => {
      ymlogo = await map.current.loadImage(getStaticCdnUrl('ym_logo_transparent_small.png'));
      map.current.addImage('ym_logo', ymlogo.data)
    })();

    
    // Add all layers immediately (logo will show up when ready, or layer will fall back gracefully)
    addAllLayers(map.current, 'Village labels')

  }

  useEffect(() => {
    if (map.current) return // Only initialize map once

    // Setup PMTiles protocol
    const protocol = new Protocol()
    maplibregl.addProtocol("pmtiles", protocol.tile)

    // Initialize map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: getMapStyle(),
      center: [0, 15],
      zoom: 2.1,
      hash: true,
      minZoom: 2.01,
      maxZoom: 14.99
    })

    map.current.on('style.load', () => {
      addSourcesAndLayers()
      mapInitialized.current = true
      
      // Apply initial filters after map and layers are loaded
      updateLayerFilters(map.current, timeRange, selectedChapters)
      
      // Add hover functionality to centroids
      addCentroidsHover()
    })

    // Add navigation control
    map.current.addControl(new maplibregl.NavigationControl())
    
    // Add globe toggle control
    map.current.addControl(new GlobeControl(), 'top-right')
    
    // Add bounding boxes toggle control
    map.current.addControl(new BboxControl(), 'top-right')

    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [darkMode]) // Add darkMode as dependency to recreate map on theme change

  // Effect to update map based on timeRange and selectedChapters
  useEffect(() => {
    if (!map.current || !mapInitialized.current) return
    
    updateLayerFilters(map.current, timeRange, selectedChapters)
  }, [timeRange, selectedChapters])

  return (
    <div className="map-wrapper">
      <div ref={mapContainer} className="map-container" />
      <ChapterSearch 
        selectedChapters={selectedChapters || []}
        onChapterChange={onChapterChange}
        chapters={chapters}
        mode="overlay"
      />
    </div>
  )
})

export default MapComponent