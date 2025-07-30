import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import maplibregl from 'maplibre-gl'
import { Protocol } from 'pmtiles'
import './Map.css'
import { addAllLayers, updateLayerFilters, clearAllFilters } from '../styles/mapLayers'
import ChapterSearch from './ChapterSearch'

const MapComponent = forwardRef(({ timeRange, selectedChapters, onChapterChange, chapters }, ref) => {
  const mapContainer = useRef(null)
  const map = useRef(null)

  // Expose the map object via ref
  useImperativeHandle(ref, () => ({
    getMap: () => map.current
  }))

  useEffect(() => {
    if (map.current) return // Only initialize map once

    // Setup PMTiles protocol
    const protocol = new Protocol()
    maplibregl.addProtocol("pmtiles", protocol.tile)

    // Initialize map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://api.maptiler.com/maps/67271b54-3f5f-480c-b7d2-b99f551113fa/style.json?key=lKNWNcFzZ8CaRdTSSYvy',
      center: [0, 15],
      zoom: 2.1,
      hash: true,
      minZoom: 2.01,
      maxZoom: 14.99
    })
    
    // (async () => {
    //   const ymlogo = await map.current.loadImage('assets/img/ym_logo_transparent_small.png');
    //   // Add YM logo image (assuming you have it)
    //   map.current.addImage('ym_logo', ymlogo.data)
    // })();


    map.current.on('style.load', () => {
      // 3D terrain
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
  }, [])

  // Effect to update map based on timeRange and selectedChapters
  useEffect(() => {
    if (!map.current) return
    
    console.log('Filters updated - Time range:', timeRange, 'Chapters:', selectedChapters?.length || 0)
    
    // Check if timeRange covers full extent (indicating reset)
    const isFullRange = timeRange && timeRange.length === 2 && 
      Math.abs(timeRange[1].getTime() - timeRange[0].getTime()) > 300 * 24 * 60 * 60 * 1000
    
    if (isFullRange && (!selectedChapters || selectedChapters.length === 0)) {
      clearAllFilters(map.current)
    } else {
      updateLayerFilters(map.current, timeRange, selectedChapters)
    }
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