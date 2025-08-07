import maplibregl from 'maplibre-gl'

class BboxControl {
  constructor() {
    this._isVisible = true // Start with bboxes visible since we set them to visible by default
  }

  onAdd(map) {
    this._map = map
    this._container = document.createElement('div')
    this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group'
    
    this._button = document.createElement('button')
    this._button.className = 'maplibregl-ctrl-icon'
    this._button.type = 'button'
    this._button.title = 'Toggle Bounding Boxes'
    this._button.setAttribute('aria-label', 'Toggle Bounding Boxes')
    
    // Set initial icon
    this._updateIcon()
    
    this._button.addEventListener('click', () => {
      this._toggleBboxes()
    })
    
    this._container.appendChild(this._button)
    return this._container
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container)
    this._map = undefined
  }

  _toggleBboxes() {
    if (!this._map.getLayer('r8agg_bboxes')) {
      console.warn('Bounding boxes layer not found')
      return
    }
    
    this._isVisible = !this._isVisible
    
    // Toggle the layer visibility
    const visibility = this._isVisible ? 'visible' : 'none'
    this._map.setLayoutProperty('r8agg_bboxes', 'visibility', visibility)
    
    this._updateIcon()
  }

  _updateIcon() {
    // Use CSS to style the button with appropriate icon
    if (this._isVisible) {
      this._button.innerHTML = '📦' // Box icon when visible
      this._button.title = 'Hide Bounding Boxes'
    } else {
      this._button.innerHTML = '📋' // Clipboard/outline icon when hidden
      this._button.title = 'Show Bounding Boxes'
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

export default BboxControl
