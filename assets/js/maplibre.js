// YetiGeoLabs 2023

const ALL_LAYERS = ['z8','z10','z15','centroids','z15_bbox_outline']

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

// Controls
class ToggleBoundingBox {
  constructor(options) {
    this._options = {...options};
    this._container = document.createElement("div");
    this._container.classList.add("maplibregl-ctrl");

    var button = document.createElement("button")
    button.type = "button"
    button.textContent = "Show Bounding Boxes"
    button.classList.add("button")

    button.addEventListener('click',function(e){
      console.log(e)
      if (map.getLayoutProperty('z15_bbox_outline','visibility') != 'visible'){
        map.setLayoutProperty('z15_bbox_outline','visibility','visible')
        button.textContent = "Hide Bounding Boxes"
      }else{
        map.setLayoutProperty('z15_bbox_outline','visibility','none')
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

// Put the chapter search box in a control inside the actual map
class ChapterSearchBox {
  constructor(options) {
    this._options = {...options};
    this._container = document.createElement("div");
    this._container.className = 'maplibregl-ctrl';

    var dropdown = document.createElement("select")
        dropdown.classList.add("selectpicker")
        dropdown.classList.add("chapter-dropdown-menu")
        dropdown.setAttribute('data-show-subtext', true);
        dropdown.setAttribute('data-live-search', true);
        dropdown.setAttribute('data-size', 15);

    // Populate the dropdown and search menu
    var group = document.createElement('optgroup')
        group.innerHTML = "YouthMappers Chapters"
    
    var defaultOption = document.createElement('option')
        defaultOption.setAttribute('data-subtext','Choose A Chapter...')
        defaultOption.setAttribute('value','-1')
        group.appendChild(defaultOption)
    
    chapters.forEach(function(chap){
	    var option = document.createElement('option')
	        option.value = chap.chapter_id
	        option.text = chap['Chapter Name']
	        option.setAttribute('data-subtext', chap.university + ', ' + chap.city + ', ' + chap.country);

	    site.chapterIndexMap[chap.chapter_id] = chap['Chapter Name']

  	  if (chap.chapter!=''){
	  	  group.appendChild(option)
	    }
    })

    dropdown.appendChild(group);
    this._container.appendChild(dropdown)
    
    // Create the list to add chapters to
    var selectedChapterList = document.createElement('ul')
    selectedChapterList.setAttribute('id','selectedChapters')

    // Add it to this container (underneath, I hope)
    this._container.appendChild(selectedChapterList)

    // Choose a chapter from the dropdown list
    dropdown.addEventListener('change',function(e){
      var chap = Number(dropdown.value)

      if (chap < 0){return}
    
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

// Controls
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
map.addControl(new ToggleBoundingBox());
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

map.addControl(new ChapterSearchBox(), 'top-left');

map.addControl(new TimelineSpan(), 'bottom-left');


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
//   <h6>${site.chapterIndexMap[p.chapter_id]}</h6>
//   <table>
//   <tr><td>${p.buildings}</td><td>Buildings</td></tr>
//   <tr><td>${p.amenities}</td><td>Amenities</td></tr>
//   <tr><td>${p.highways}</td><td>Highways</td></tr>
//   <tr><td>${p.all_feats - p.highways - p.amenities - p.buildings}</td><td>Other features</td></tr>
//   </table>

//   `
// }