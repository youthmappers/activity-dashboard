import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import maplibregl from 'maplibre-gl'
import { Protocol } from 'pmtiles'
import './Map.css'
import { addAllLayers, updateLayerFilters, clearAllFilters } from '../styles/mapLayers'
import ChapterSearch from './ChapterSearch'
import { useTheme } from '../contexts/ThemeContext'

const MapComponent = forwardRef(({ timeRange, selectedChapters, onChapterChange, chapters }, ref) => {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const { darkMode } = useTheme()
  const mapInitialized = useRef(false)

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

    // Add tilesets
    map.current.addSource('r8agg', {
      type: "vector",
      url: "pmtiles://data/res8.pmtiles"
    })
    map.current.addSource('r8agg_bboxes', {
      type: "vector",
      url: "pmtiles://data/res8_bboxes.pmtiles"
    })
    map.current.addSource('r6agg', {
      type: "vector",
      url: "pmtiles://data/res6.pmtiles"
    })
    map.current.addSource('r4agg', {
      type: "vector",
      url: "pmtiles://data/res4.pmtiles"
    })

    // Add all layers from the module
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
    })

    // Add navigation control
    map.current.addControl(new maplibregl.NavigationControl())

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
    
    console.log('Filters updated - Time range:', timeRange, 'Chapters:', selectedChapters?.length || 0)
    
    // Always apply the filters - let the filter function handle the logic
    updateLayerFilters(map.current, timeRange, selectedChapters)
  }, [timeRange, selectedChapters])

  return (
    <div className="map-wrapper">
      <div ref={mapContainer} className="map-container" />
      <ChapterSearch 
        selectedChapters={selectedChapters || []}
        onChapterChange={onChapterChange}
        chapters={chapters}
      />
    </div>
  )
})

export default MapComponent