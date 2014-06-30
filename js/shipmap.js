var config = {
	tileLayer : 'rbertot.ihpo2bcl',
	featureLayers : {
		'rw3' : 'rbertot.ii696lei'
	},
	mapOptions : {
		center : [49.102645497788814, 0.87890625], 
		zoom : 6,	
		minZoom : 2
	},
	icons : {
		'empty' : {
			"iconUrl": 'img/empty.png',
			"iconSize": [0, 0],    // size of the icon
			"iconAnchor": [0, 0],  // point of the icon which will correspond to marker's location
			"popupAnchor": [0, 0], // point from which the popup should open relative to the iconAnchor
			"className": "hidden"
		}, 
		'rw3' : {
			"iconUrl": 'img/rainbow.png',
			"iconSize": [60, 68],
			"iconAnchor": [40, 48],
			"popupAnchor": [0, -25],
			"className": "ship"
		}
	},
	polyline : {
		color: '#fff',     // Stroke color
		opacity: 1,        // Stroke opacity
		weight: 3,         // Stroke weight
		stroke: true,
		dashArray : [0.3,10]
	},
	cluster : {
		whitelist : ['star','circle'] // only these type of points will be added to the cluster
	}
};

var app = {
	// The map and layers are defined at runtime by init
 	map : undefined, 
	layer : undefined,

	// The clusterGroup gets each whitelisted marker in the group added to it
	// once loaded, and then is added to the map
	createCluster : function(e) {
		var clusterGroup = new L.MarkerClusterGroup({
			showCoverageOnHover : false,
			maxClusterRadius : 30
		});
		e.target.eachLayer(function(layer) {
			// only cluster markers whos symbol are in the whitelist
			if(config.cluster.whitelist.indexOf(layer.feature.properties['marker-symbol']) > -1) {
		    	clusterGroup.addLayer(layer);
			} else {
				app.map.addLayer(layer);
			}
		});
		app.map.addLayer(clusterGroup);
	},

	// Add a minimap
	createMiniMap : function() {
	 	new L.Control.MiniMap(L.mapbox.tileLayer(config.tileLayer))
			.addTo(app.map);	
	},

	// Add the line connecting the markers
	connectTheDots : function(f) {
		var line = [];
		f.eachLayer(function(marker) {
			line.push(marker.getLatLng());
		});
  		L.polyline(line, config.polyline).addTo(this.map);
	},
	
	// Style markers with icon images based on their symbol 
	styleMarkers : function(e) {
		var marker = e.layer,
		    feature = marker.feature;
		switch(feature.properties['marker-symbol']) {
			case '':
				marker.setIcon(L.icon(config.icons['empty']));
			break;
			case 'r':
				marker.setIcon(L.icon(config.icons['rw3']));
			break;
		}
	},

	init : function() {
		// Here we avoid loading in markers from the layer. Instead we add just the
		// backing tileLayer, and then use the featureLayers to add data on top of it.
		this.map = L.map('map', config.mapOptions)
			.addLayer(L.mapbox.tileLayer(config.tileLayer))

		this.layer = L.mapbox.featureLayer(config.featureLayers.rw3)
			.on('ready', function(e) {
				app.createCluster(e);
				app.connectTheDots(this);
			})
			.on('layeradd', function(e) {
				app.styleMarkers(e)
			})
			.on('click', function(e) {
        		app.map.panTo(e.layer.getLatLng());
   			});
	}
}

app.init();




