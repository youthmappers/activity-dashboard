// YetiGeoLabs 2025
// YouthMappers

// Variables and map constants
const ALL_LAYERS = ['r4agg', 'r6agg', 'r8agg', 'r8agg_bboxes', 'centroids']
var mapFilters = []
// Imports, Protocols
const protocol = new pmtiles.Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);

// Initialize the map
var map = new maplibregl.Map({
  container: 'map',
  style: 'https://api.maptiler.com/maps/67271b54-3f5f-480c-b7d2-b99f551113fa/style.json?key=lKNWNcFzZ8CaRdTSSYvy',
  center: [0,15],
  zoom: 2.1,
  hash: true,
  minZoom:2.01,
  maxZoom:14.99,
});

let ymlogo;
(async () => {
  ymlogo = await map.loadImage('assets/img/ym_logo_transparent_small.png');
})();

// Map Functions and Classes
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

function updateFiltersFromChaptersList(){
	chapterFilters = ['any']
	site.selectedChapters.forEach(function(chap){
		chapterFilters.push(['==','chapter_id',chap])
	})
	mapFilters = mapFilters.slice(0,2)
	if (site.selectedChapters.size>0){
		mapFilters.push(chapterFilters)
	}
	setFilters();
}

// IControls
class BoundingBoxToggle {
  constructor(options) {
    this._options = {...options};
    this._container = document.createElement("div");
    this._container.classList.add("maplibregl-ctrl");
    this._container.style.backgroundColor = 'white'

    var button = document.createElement("button")
        button.classList.add("btn");
        button.classList.add("btn-light")
        button.classList.add("btn-sm")
        button.textContent = "Show Bounding Boxes"

    button.addEventListener('click',function(e){
      if (map.getLayoutProperty('r8agg_bboxes','visibility') != 'visible'){
        map.setLayoutProperty('r8agg_bboxes','visibility','visible')
        button.textContent = "Hide Bounding Boxes"
      }else{
        map.setLayoutProperty('r8agg_bboxes','visibility','none')
        button.textContent = "Show Bounding Boxes"
      }
    })

    this._container.appendChild(button)
  }

  onAdd(map) {
    this._map = map;
    return this._container;
  }

  onRemove(){
    this._container.parentNode?.removeChild(this._container);
    delete this._map;
  }
}

class ChapterSearchBox {
  constructor(options) {
    this._options = {...options};
    this._container = document.createElement("div");
    this._container.className = 'maplibregl-ctrl';

    var dataListInput = document.createElement("input")
        dataListInput.classList.add("form-control") 
        dataListInput.setAttribute("list", "datalistOptions")
        dataListInput.setAttribute("placeholder", "Filter by Chapter...")

    var dataList = document.createElement("datalist")
        dataList.id = "datalistOptions"

        dataListInput.appendChild(dataList)

    var dropdown = document.createElement("select")
        dropdown.classList.add("form-select")
        dropdown.classList.add("chapter-dropdown-menu")
    
    chapters.forEach(function(chap){

      var dataListItem = document.createElement('option')
          dataListItem.value = chap.chapter
          dataListItem.text = chap.university + ', ' + chap.city + ', ' + chap.country
          dataListItem.setAttribute("chapter_id", chap.chapter_id)

	    site.chapterIndexMap[chap.chapter_id] = chap.chapter

  	  if (chap.chapter!=''){
        dataList.appendChild(dataListItem)
	    }
    })

    this._container.appendChild(dataListInput)
    
    // Create the list to add chapters to
    var selectedChapterList = document.createElement('ul')
        selectedChapterList.classList.add('bg-light')
        selectedChapterList.setAttribute('id','selectedChapters')

    // Add it to this container (underneath, I hope)
    this._container.appendChild(selectedChapterList)

    // Choose a chapter from the datalist
    dataListInput.addEventListener('change', function(e) {
      const selectedOption = Array.from(dataList.options).find(option => option.value === e.target.value);

      selectedOption.disabled = true;

      if (!selectedOption) {
      console.log("No matching chapter found");
      return;
      }

      const chapterName = selectedOption.value;
      const chap = Number(selectedOption.getAttribute("chapter_id"));

      if (chap < 0) {
      return;
      }

      e.target.value = '';

      // Proceed with the rest of the logic
    
      // If it exists, we remove it
      if (site.selectedChapters.has(chap)){
        site.selectedChapters.delete(chap)
        updateFiltersFromChaptersList();
    
      // Else, we add it
      }else{
        
        site.selectedChapters.add(chap)
        
        var thisChapLi = document.createElement('li')
        thisChapLi.classList.add('selected-chapter')
    
        var remove = document.createElement('a')
            remove.style.cursor = 'pointer';
            remove.innerHTML = '&#10062; '
    
        var text = document.createElement('p')
        text.style.display = 'inline-block'
        text.innerHTML = site.chapterIndexMap[chap]
    
        thisChapLi.appendChild(remove)
        thisChapLi.appendChild(text)
        thisChapLi.id = chap
        
        remove.addEventListener('click',function(){
          document.getElementById(chap).remove();
          site.selectedChapters.delete(chap)
          updateFiltersFromChaptersList()
        })
        
        selectedChapterList.appendChild(thisChapLi)
        updateFiltersFromChaptersList()
      }
    })
  }

  onAdd(map) {
    this._map = map;
    return this._container;
  }

  onRemove(){
    this._container.parentNode?.removeChild(this._container);
    delete this._map;
  }
}

class TimelineSpan {
  constructor(options) {
    this._options = {...options};
    this._container = document.createElement("div");
    this._container.className = 'maplibregl-ctrl maplibregl-ctrl-attrib';

    var timelineSpan = document.createElement('p')
        timelineSpan.textContent = ""
        // timelineSpan.appendChild(document.createElement('br'))
        timelineSpan.style['margin-bottom'] = '0px';
    var dateString = document.createElement('span');
        dateString.setAttribute('id','datestring')
        timelineSpan.appendChild(dateString)

    this._container.appendChild(timelineSpan)
  }

  onAdd(map) {
    this._map = map;
    return this._container;
  }

  onRemove(){
    this._container.parentNode?.removeChild(this._container);
    delete this._map;
  }
}

class StyleToggle {
  constructor(options) {
    this._options = {...options};
    this._container = document.createElement("div");
    this._container.classList.add("maplibregl-ctrl");
    this._container.style.backgroundColor = 'white'

    var button = document.createElement("button")
        button.classList.add("btn");
        button.classList.add("btn-light")
        button.classList.add("btn-sm")
        button.textContent = "Dark Style"
    
    var style='light'

    button.addEventListener('click',function(e){
      if (style=='light'){
        button.textContent = "Light Style"
        // Activate dark mode
        map.setStyle('https://api.maptiler.com/maps/a075bd9b-8334-4046-bc04-fb3e9027ea4d/style.json?key=lKNWNcFzZ8CaRdTSSYvy',{diff:false})
        style = 'dark'
      }else{
        button.textContent = "Dark Style"
        style='light'
        map.setStyle('https://api.maptiler.com/maps/67271b54-3f5f-480c-b7d2-b99f551113fa/style.json?key=lKNWNcFzZ8CaRdTSSYvy',{diff:false})
        // Activate light mode
      }
    })

    this._container.appendChild(button)
  }

  onAdd(map) {
    this._map = map;
    return this._container;
  }

  onRemove(){
    this._container.parentNode?.removeChild(this._container);
    delete this._map;
  }
}


// Add controls to the map
map.addControl(new BoundingBoxToggle());
map.addControl(new StyleToggle());
map.addControl(new maplibregl.NavigationControl({
  visualizePitch: true
}));
// Terrain Control
map.addControl(
  new maplibregl.TerrainControl({
      source: 'maptiler3D',
      exaggeration: 1
  })
);
// Chapter Search Box
map.addControl(new ChapterSearchBox(), 'top-left');
// Updating Timeline
map.addControl(new TimelineSpan(), 'bottom-left');

map.on('style.load', function(){

  // 3D terrain
  map.addSource("maptiler3D", {
    "type": "raster-dem",
    "url": "https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=lKNWNcFzZ8CaRdTSSYvy",
  });

  // Add tilesets
  map.addSource('r8agg', {
      type: "vector",
      url: "pmtiles://data/res8.pmtiles"
  })
  map.addSource('r8agg_bboxes', {
    type: "vector",
    url: "pmtiles://data/res8_bboxes.pmtiles"
})
map.addSource('r6agg', {
  type: "vector",
  url: "pmtiles://data/res6.pmtiles"
})
map.addSource('r4agg', {
  type: "vector",
  url: "pmtiles://data/res4.pmtiles"
})
  
  // Weekly aggregation for heatmap at low zooms
  map.addLayer({
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
  }, 'Village labels');

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

  map.addImage('ym_logo', ymlogo.data);

  // Centroids to display number of features
  map.addLayer({
    'id': 'centroids',
    'type': 'symbol',
    'source': 'r8agg',
    'source-layer': 'daily',
    'minzoom':13.0,
    // 'maxzoom':15,
    'layout': {
      'text-field' : ['get','all_feats'],
      'text-size'  : 15,
      'icon-image': 'ym_logo'
    },
    'paint':{
      'text-opacity': 1,
      'text-color': 'black'
      
    }
  });


  

  // Create a popup, but don't add it to the map yet.
  const popup = new maplibregl.Popup({
    closeButton: false,
    closeOnClick: false
  });

  map.on('styleimagemissing', (e) => {
    
  });
   
  map.on('mouseenter', 'centroids', (e) => {
    // Change the cursor style as a UI indicator.
    map.getCanvas().style.cursor = 'pointer';
   
    // Copy coordinates array.
    const coordinates = e.features[0].geometry.coordinates.slice();
    const description = buildPopUp(e.features[0].properties)

    popup.setLngLat(coordinates).setHTML(description).addTo(map);
  });
   
  map.on('mouseleave', 'centroids', () => {
    map.getCanvas().style.cursor = '';
    popup.remove();
  });

  //Fire the first brush action to set the time.
  brushed(true);
});


function buildPopUp(p){
  d = new Date(p.timestamp * 1000)
  return `<h5>${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}</h5>
  <h6>${site.chapterIndexMap[p.chapter_id]}</h6>
  <table>
  <tr><td>${p.buildings || 0}</td><td>Buildings</td></tr>
  <tr><td>${p.amenities || 0}</td><td>Amenities</td></tr>
  <tr><td>${p.highways || 0}</td><td>Highways</td></tr>
  <tr><td>${p.all_feats - (p.highways  || 0)- (p.amenities || 0) - (p.buildings || 0)}</td><td>Other features</td></tr>
  </table>`
}




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