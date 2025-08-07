import maplibregl from 'maplibre-gl'

class GlobeControl {
  constructor() {
    this._isGlobe = false
  }

  onAdd(map) {
    this._map = map
    this._container = document.createElement('div')
    this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group'
    
    this._button = document.createElement('button')
    this._button.className = 'maplibregl-ctrl-icon'
    this._button.type = 'button'
    this._button.title = 'Toggle Globe View'
    this._button.setAttribute('aria-label', 'Toggle Globe View')
    
    // Set initial icon
    this._updateIcon()
    
    this._button.addEventListener('click', () => {
      this._toggleGlobe()
    })
    
    this._container.appendChild(this._button)
    return this._container
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container)
    this._map = undefined
  }

  _showNotSupported() {
    const originalHTML = this._button.innerHTML
    const originalTitle = this._button.title
    
    this._button.innerHTML = '❌'
    this._button.title = 'Globe view not supported in this MapLibre version'
    
    setTimeout(() => {
      this._button.innerHTML = originalHTML
      this._button.title = originalTitle
    }, 2000)
  }

  _toggleGlobe() {
    // Check if the map supports projection changes
    if (!this._map.setProjection) {
      this._showNotSupported()
      return
    }
    
    this._isGlobe = !this._isGlobe
    
    try {
      if (this._isGlobe) {
        // Try to switch to globe projection
        this._map.setProjection({type: 'globe'})
        // Zoom out a bit for better globe view
        const currentZoom = this._map.getZoom()
        if (currentZoom > 4) {
          this._map.setZoom(Math.min(currentZoom, 4))
        }
      } else {
        // Switch back to mercator projection
        this._map.setProjection({type: 'mercator'})
      }
      this._updateIcon()
    } catch (error) {
      console.warn('Globe projection error:', error.message)
      // Try alternative projection names/formats
      try {
        if (this._isGlobe) {
          // Try object format
          this._map.setProjection({ type: 'globe' })
        } else {
          this._map.setProjection({ type: 'mercator' })
        }
        this._updateIcon()
      } catch (fallbackError) {
        console.warn('Globe projection not supported:', fallbackError.message)
        // Revert the toggle state
        this._isGlobe = !this._isGlobe
        this._showNotSupported()
      }
    }
  }

  _updateIcon() {
    // Use CSS to style the button with appropriate icon
    if (this._isGlobe) {
      this._button.innerHTML = '🗺️' // Map icon when in globe mode
      this._button.title = 'Switch to Flat Map'
    } else {
      this._button.innerHTML = '🌍' // Globe icon when in flat mode
      this._button.title = 'Switch to Globe View'
    }
    
    // Style the button to match MapLibre controls
    this._button.style.fontSize = '14px'
    this._button.style.lineHeight = '1'
    this._button.style.background = 'none'
    this._button.style.border = 'none'
    this._button.style.cursor = 'pointer'
    this._button.style.width = '29px'
    this._button.style.height = '29px'
    this._button.style.display = 'flex'
    this._button.style.alignItems = 'center'
    this._button.style.justifyContent = 'center'
  }
}

export default GlobeControl
