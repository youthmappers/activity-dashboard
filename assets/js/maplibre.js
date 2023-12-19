// YetiGeoLabs 2023

const ALL_LAYERS = ['z8','z10','z15','centroids','z15_bbox_outline']

// const STYLES = {
//   'YMDashboard Dark': 'mapbox://styles/jenningsanderson/cl1wc8nhb008015ozetrf0sfb',
//   'YouthMappers Dashboard' : 'mapbox://styles/jenningsanderson/ckv1l2bdr2v7d14o3y5a7l6rv'
// }

// Control implemented as ES5 prototypical class
// function ToggleStyle() { }
//  ToggleStyle.prototype.onAdd = function(map) {
//   this._map = map;
//   this._container = document.createElement('div');
//   this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group custom-map-button';
//   this._container.innerHTML = '<a id="toggleTheme" type="button" class="button">Toggle Theme</a>';
//   return this._container;
// };
// ToggleStyle.prototype.onRemove = function () {
//   this._container.parentNode.removeChild(this._container);
//   this._map = undefined;
// };

// // Control implemented as ES5 prototypical class
// function ToggleBoundingBoxes() { }
//  ToggleBoundingBoxes.prototype.onAdd = function(map) {
//   this._map = map;
//   this._container = document.createElement('div');
//   this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group custom-map-button';
//   this._container.innerHTML = '<a id="toggleBoundingBoxes" type="button" class="button">Show Bounding Boxes</a>';
//   return this._container;
// };
// ToggleBoundingBoxes.prototype.onRemove = function () {
//   this._container.parentNode.removeChild(this._container);
//   this._map = undefined;
// };

let protocol = new pmtiles.Protocol();
maplibregl.addProtocol("pmtiles",protocol.tile);

var map = new maplibregl.Map({
  container: 'map',
  style: 'https://api.maptiler.com/maps/67271b54-3f5f-480c-b7d2-b99f551113fa/style.json?key=lKNWNcFzZ8CaRdTSSYvy',
  center: [0,15],
  zoom: 2.1,
  hash: true,
  minZoom:2.01,
  maxZoom:18,

});
// map.addControl(new ToggleBoundingBoxes());
// map.addControl(new ToggleStyle());
map.addControl(new maplibregl.NavigationControl({
  visualizePitch: true
}));
map.addControl(
  new maplibregl.TerrainControl({
      source: 'maptiler3D',
      exaggeration: 1
  })
);


// document.getElementById('toggleBoundingBoxes').addEventListener('click',function(){
  
//   curr_vis = map.getLayoutProperty('z15_bbox_outline','visibility')
//   if (curr_vis == 'visible'){
//     map.setLayoutProperty('z15_bbox_outline','visibility','none')
//     this.text = 'Show Bounding Boxes'
//   }else{
//     map.setLayoutProperty('z15_bbox_outline','visibility','visible')
//     this.text = 'Hide Bounding Boxes'
//   }
// })

// document.getElementById('toggleTheme').addEventListener('click',function(){

//   var curr_theme = map.getStyle().name

//   if (curr_theme == 'YouthMappers Dashboard'){
//     map.setStyle(STYLES['YMDashboard Dark'])
//     // this.text = 'Dark Style'
//   }

//   if (curr_theme == 'YMDashboard Dark'){
//    map.setStyle(STYLES['YouthMappers Dashboard']) 
//    // this.text = 'Light Style'
//   }
// })

// document.getElementById('toggleGlobe').addEventListener('click',function(){

//   var curr_projection = map.getProjection().name

//   if (curr_projection == 'globe'){
//     map.setProjection('mercator')
//   }

//   if (curr_projection == 'mercator'){
//    map.setProjection('globe') 
//   }
// })

map.on('style.load', function(){

  map.addSource("maptiler3D", {
    "type": "raster-dem",
    "url": "https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=lKNWNcFzZ8CaRdTSSYvy",
  });

  // map.setTerrain({
  //   source: "maptiler3D",
  //   exaggeration: 2.5
  // });

  map.addSource('ym_changesets', {
      type: "vector",
      url: "pmtiles://data/ym_changesets.pmtiles"
  })
  
  map.addLayer({
    'id': 'z8',
    'type': 'heatmap',
    'source': 'ym_changesets',
    'source-layer': 'z8agg',
    'minzoom':2,
    'maxzoom':3,
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
  // },);  
  },
  // 'settlement-minor-label'
  );

  map.addLayer({
    'id': 'z10',
    'type': 'heatmap',
    'source': 'ym_changesets',
    'source-layer': 'z10agg',
    'minzoom':3,
    'maxzoom':6,
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
  },);  
  // },'settlement-minor-label');

  map.addLayer({
    'id': 'z15',
    'type': 'heatmap',
    'source': 'ym_changesets',
    'source-layer': 'z15agg',
    'minzoom':5,
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
  });//, 'settlement-minor-label');

  map.addLayer({
    'id': 'z15_bbox_outline',
    'type': 'line',
    'source': 'ym_changesets',
    'source-layer': 'z15agg_bbox',
    'minzoom':11.0,
    'maxzoom':18,
    'paint': {
      'line-color': 'orange',
      'line-width': 5
    },
    'layout':{
      'visibility':'none'
    }
  });

  map.addLayer({
    'id': 'centroids',
    'type': 'symbol',
    'source': 'ym_changesets',
    'source-layer': 'z15agg',
    'minzoom':13.0,
    'maxzoom':18.1,
    'layout': {
      'text-field' : ['get','all_feats'],
      'text-size'  : 15
    },
    'paint':{
      'text-opacity': 1,
      'text-color': 'black',
    }
  });
  
  // Create a popup, but don't add it to the map yet.
  // const popup = new mapboxgl.Popup({
  //   closeButton: false,
  //   closeOnClick: false
  // });
   
  // map.on('mouseenter', 'centroids', (e) => {
  //   // Change the cursor style as a UI indicator.
  //   map.getCanvas().style.cursor = 'pointer';
   
  //   // Copy coordinates array.
  //   const coordinates = e.features[0].geometry.coordinates.slice();
  //   const description = buildPopUp(e.features[0].properties)
   
  //   // Ensure that if the map is zoomed out such that multiple
  //   // copies of the feature are visible, the popup appears
  //   // over the copy being pointed to.
  //   while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
  //     coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
  //   }
   
  //   // Populate the popup and set its coordinates
  //   // based on the feature found.
  //   popup.setLngLat(coordinates).setHTML(description).addTo(map);
  // });
   
  // map.on('mouseleave', 'centroids', () => {
  //   map.getCanvas().style.cursor = '';
  // popup.remove();
  // });


  //Fire the first brush action to set the time.
  brushed(true);
});

var mapFilters = []

function setTemporalFilters(filters){
  mapFilters[0] = filters[0]
  mapFilters[1] = filters[1]
}

function setFilters(){
  ALL_LAYERS.forEach(function(layerID){
    map.setFilter(layerID,
      ['all'].concat(mapFilters)
    )
  })
}

// function buildPopUp(p){
//   d = new Date(p.timestamp * 1000)
//   return `<h5>${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}</h5>
//   <h6>${chapterIndexMap[p.chapter_id]}</h6>
//   <table>
//   <tr><td>${p.buildings}</td><td>Buildings</td></tr>
//   <tr><td>${p.amenities}</td><td>Amenities</td></tr>
//   <tr><td>${p.highways}</td><td>Highways</td></tr>
//   <tr><td>${p.all_feats - p.highways - p.amenities - p.buildings}</td><td>Other features</td></tr>
//   </table>

//   `
// }