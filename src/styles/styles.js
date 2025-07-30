const r4Agg = {
    'id': 'r4agg',
    'type': 'heatmap',
    'source': 'r4agg',
    'source-layer': 'r4agg',
    'minzoom':2,
    'maxzoom':4.01,
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
      // Adjust the heatmap radius by zoom level
      "heatmap-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        2, 2,
        3, 4
      ]
    }
  }

  // Daily aggregation at zoom 10
  map.addLayer({
    'id': 'r6agg',
    'type': 'heatmap',
    'source': 'r6agg',
    'source-layer': 'r6agg',
    'minzoom':4,
    'maxzoom':6.01,
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
      // Adjust the heatmap radius by zoom level
      "heatmap-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        3, 4,
        5, 6
      ]
    }
  }, 'Village labels');

  // Daily aggregation at zoom 15
  map.addLayer({
    'id': 'r8agg',
    'type': 'heatmap',
    'source': 'r8agg',
    'source-layer': 'daily',
    'minzoom':6,
    'maxzoom':15,
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
      // Adjust the heatmap radius by zoom level
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

      // Transition from heatmap to actual features at some point?
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
  }, 'Village labels');

  // Daily Bounding boxes
  map.addLayer({
    'id': 'r8agg_bboxes',
    'type': 'line',
    'source': 'r8agg_bboxes',
    'source-layer': 'daily',
    'minzoom':6,
    'paint': {
      'line-color': 'orange',
      'line-width': 1
    },
    'layout':{
      'visibility':'none'
    }
  });