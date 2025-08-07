// R4 Aggregation Layer (Country/Region level)
export const r4AggLayer = {
  'id': 'r4agg',
  'type': 'heatmap',
  'source': 'r4agg',
  'source-layer': 'r4agg',
  'minzoom': 2,
  'maxzoom': 4.01,
  'paint': {
    "heatmap-weight": [
      "interpolate",
      ["linear"],
      ["get", "all_feats"],
        0, 0,
        100, 1
    ],
    "heatmap-intensity": [
      "interpolate",
      ["linear"],
      ["zoom"],
      2, 1,
      3, 1.5
    ],
    "heatmap-radius": [
      "interpolate",
      ["linear"],
      ["zoom"],
      2, 2,
      3, 4
    ]
  }
}

// R6 Aggregation Layer (State/Province level)
export const r6AggLayer = {
  'id': 'r6agg',
  'type': 'heatmap',
  'source': 'r6agg',
  'source-layer': 'r6agg',
  'minzoom': 4,
  'maxzoom': 6.01,
  'paint': {
    "heatmap-weight": [
      "interpolate",
      ["linear"],
      ["get", "all_feats"],
        0, 0,
        100, 1
    ],
    "heatmap-intensity": [
      "interpolate",
      ["linear"],
      ["zoom"],
      3, 1,
      5, 1.5
    ],
    "heatmap-radius": [
      "interpolate",
      ["linear"],
      ["zoom"],
      3, 4,
      5, 6
    ]
  }
}

// R8 Aggregation Layer (City/Daily level)
export const r8AggLayer = {
  'id': 'r8agg',
  'type': 'heatmap',
  'source': 'r8agg',
  'source-layer': 'daily',
  'minzoom': 6,
  'maxzoom': 15,
  'paint': {
    "heatmap-weight": [
      "interpolate",
      ["linear"],
      ["get", "all_feats"],
        0, 0,
        10, 1
    ],
    "heatmap-intensity": [
      "interpolate",
      ["linear"],
      ["zoom"],
      5, 1,
      15, 1
    ],
    "heatmap-radius": [
      "interpolate",
      ["linear"],
      ["zoom"],
      5, 2,
      10, 5,
      11, 8,
      12, 50,
      15, 200
    ],
    "heatmap-opacity": [
      "interpolate",
      ["linear"],
      ["zoom"],
      12, 1,
      13, 0.5,
      14, 0.1,
      15, 0.01
    ]
  }
}

// R8 Bounding Boxes Layer
export const r8AggBboxesLayer = {
  'id': 'r8agg_bboxes',
  'type': 'line',
  'source': 'r8agg_bboxes',
  'source-layer': 'daily',
  'minzoom': 6,
  'paint': {
    'line-color': '#ff6b35',
    'line-width': [
      'interpolate',
      ['linear'],
      ['zoom'],
      6, 0.5,
      10, 1,
      15, 2
    ],
    'line-opacity': [
      'interpolate',
      ['linear'],
      ['zoom'],
      6, 0.3,
      10, 0.6,
      15, 0.8
    ]
  },
  'layout': {
    'visibility': 'visible'
  }
}

// Centroids Layer
export const centroidsLayer = {
  'id': 'centroids',
  'type': 'symbol',
  'source': 'r8agg',
  'source-layer': 'daily',
  'minzoom': 13.0,
  'layout': {
    'text-field': ['get', 'all_feats'],
    'text-size': 15,
    // 'icon-image': 'ym_logo' // Uncomment when logo is added
  },
  'paint': {
    'text-opacity': 1,
    'text-color': 'black'
  }
}

// Array of all layers for easy iteration
export const allLayers = [
  r4AggLayer,
  r6AggLayer,
  r8AggLayer,
  r8AggBboxesLayer,
  centroidsLayer
]

// Helper function to add all layers to a map
export const addAllLayers = (map, beforeLayer = 'Village labels') => {
  allLayers.forEach(layer => {
    map.addLayer(layer, beforeLayer)
  })
}

// Helper function to update layer filters based on time range and chapters
export const updateLayerFilters = (map, timeRange, selectedChapters) => {
  if (!map) return
  
  const timeFilteredLayers = ['r4agg', 'r6agg', 'r8agg', 'r8agg_bboxes', 'centroids']
  
  timeFilteredLayers.forEach(layerId => {
    if (map.getLayer(layerId)) {
      let finalFilter = null
      
      // Check if we have a valid time range - remove the "full range" auto-detection
      let hasTimeFilter = false
      let startTime, endTime
      if (timeRange && timeRange.length === 2 && timeRange[0] && timeRange[1]) {
        // Always apply time filter if we have valid dates, regardless of range size
        hasTimeFilter = true
        // Convert from milliseconds to seconds for comparison with feature data
        startTime = Math.floor(timeRange[0].getTime() / 1000)
        endTime = Math.floor(timeRange[1].getTime() / 1000)
      }
      
      // Check if we have chapter filter
      const hasChapterFilter = selectedChapters && selectedChapters.length > 0
      
      // Convert chapter IDs to numbers to match map data format
      const chapterIds = hasChapterFilter ? selectedChapters.map(id => parseInt(id)) : []
      
      // Build the appropriate filter
      if (hasTimeFilter && hasChapterFilter) {
        finalFilter = [
          'all',
          ['>=', ['get', 'timestamp'], startTime],
          ['<=', ['get', 'timestamp'], endTime],
          ['in', ['get', 'chapter_id'], ['literal', chapterIds]]
        ]
      } else if (hasTimeFilter) {
        finalFilter = [
          'all',
          ['>=', ['get', 'timestamp'], startTime],
          ['<=', ['get', 'timestamp'], endTime]
        ]
      } else if (hasChapterFilter) {
        finalFilter = ['in', ['get', 'chapter_id'], ['literal', chapterIds]]
      }
      
      // Apply the filter
      map.setFilter(layerId, finalFilter)
    }
  })
}

// Helper function to clear all filters
export const clearAllFilters = (map) => {
  const timeFilteredLayers = ['r4agg', 'r6agg', 'r8agg', 'r8agg_bboxes', 'centroids']
  
  timeFilteredLayers.forEach(layerId => {
    if (map.getLayer(layerId)) {
      map.setFilter(layerId, null)
    }
  })
}