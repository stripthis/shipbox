var config = {
	copyright : 'Leaflet, Openstreet map, Mapbox &bullet; Greenpeace &copy; 2014',
	tileLayer : 'rbertot.ihpo2bcl',
	featureLayers : {
		'rbertot.ii696lei' : 'rw3',
		'rbertot.jb84217i' : 'myez'
	},
	mapOptions : {
		center : [40, 0], 
		zoom : 4,	
		minZoom : 2
	},
	icons : {
		'' : {
			"iconUrl": 'img/empty.png',
			"iconSize": [0, 0],    // size of the icon
			"iconAnchor": [0, 0],  // point of the icon which will correspond to marker's location
			"popupAnchor": [0, 0], // point from which the popup should open relative to the iconAnchor
			"className": "hidden"
		}, 
		'r' : { // r = rainbow warrior 3
			"iconUrl": 'img/icon-rw.svg',
			"iconSize": [60, 68],
			"iconAnchor": [40, 48],
			"popupAnchor": [0, -25],
			"className": "ship"
		},
		'e' : { // r = esperanza
			"iconUrl": 'img/icon-espy.svg',
			"iconSize": [60, 68],
			"iconAnchor": [40, 48],
			"popupAnchor": [0, -25],
			"className": "ship"
		},
		'a' : { // a = arctic sunrise
			"iconUrl": 'img/icon-as.svg',
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
		whitelist : ['star','circle'], // only these type of points will be added to the cluster
		clusterGroup : {
			showCoverageOnHover : false,
			maxClusterRadius : 40
		}
	},
	minimap : {
		width : 300
	}
};

var app = {
	// The map and layers are defined at runtime by init
 	map : undefined, 
	layer : undefined,
	minimap : undefined,
	ships : {},
	layers : {},

	// The clusterGroup gets each whitelisted marker in the group added to it
	// once loaded, and then is added to the map
	createCluster : function(l, ship) {
		var clusterGroup = new L.MarkerClusterGroup(config.cluster.clusterGroup);
		l.eachLayer(function(layer) {
			// only cluster markers whose symbol are in the whitelist
			if(config.cluster.whitelist.indexOf(layer.feature.properties['marker-symbol']) > -1) {
		    	clusterGroup.addLayer(layer);
			} else {
				app.layers[ship].addLayer(layer);
			}
		});
		app.layers[ship].addLayer(clusterGroup);
	},

	// Add a minimap
	createMiniMap : function() {
	 	//new L.Control.MiniMap(L.mapbox.tileLayer(config.tileLayer))
		//	.addTo(app.map);
		var minitile = new L.mapbox.tileLayer(config.tileLayer);
		var miniMap = new L.Control.MiniMap(minitile, config.minimap);
		miniMap.addTo(app.map);

	},

	// Add the line connecting the markers
	connectTheDots : function(l, ship) {
		var line = [];
		l.eachLayer(function(marker) {
			line.push(marker.getLatLng());
		});
  		L.polyline(line, config.polyline).addTo(app.layers[ship]);
	},

	// Style markers with icon images based on their symbol 
	styleMarkers : function(l) {
		var marker = l,
		    feature = marker.feature;
		    
		switch(feature.properties['marker-symbol']) {
			case '':
				marker.setIcon(L.icon(config.icons['']));
			break;
			case 'r':
				marker.setIcon(L.icon(config.icons['r']));
				app.ships['rw3'] = marker;
			break;
			case 'e':
				marker.setIcon(L.icon(config.icons['e']));
				app.ships['myez'] = marker;
			break;
		}
	},

	loadCopyright : function () {
		$(".leaflet-control-attribution").html(config.copyright);
	},

	bindNavEvents : function () {
		$( ".toggle" ).click(function(e) {
			e.preventDefault();
			s = this.getAttribute("data-ship");
			app.onShipLayerToggle(s);
		});
		$( ".pan" ).click(function(e) {
			e.preventDefault();
			s = this.getAttribute("data-ship");
			app.onPanToShip(s);
		});
	},

	onShipLayerToggle : function(s) {
		if (app.map.hasLayer(app.layers[s])) {
			app.map.removeLayer(app.layers[s]);
		} else {
			app.map.addLayer(app.layers[s]);
		}
	},

	onPanToShip : function(s) {
		ship = app.ships[s];
        app.map.panTo(ship.getLatLng());
        ship.openPopup();
	},

	onLayerReady : function(l) {
		var ship = config.featureLayers[l._geojson.id];
		app.createCluster(l, ship);
		app.connectTheDots(l, ship);
	},
	
	onAllLayerReady : function() {
		app.bindNavEvents();
		app.createMiniMap();
		app.loadCopyright();
	},
	
	init : function() {
		// Here we avoid loading in markers from the layer. Instead we add just the
		// backing tileLayer, and then use the featureLayers to add data on top of it.
		app.map = L.map('map', config.mapOptions)
			.addLayer(L.mapbox.tileLayer(config.tileLayer));

		
		// we don't directly use the feature layer used to load the markers
		// instead we break it down into other layers and add it to app.layer
		var l,
			i = 0,
			imax = Object.keys(config.featureLayers).length;

		for (l in config.featureLayers) {
			l_name = config.featureLayers[l];
			app.layers[l_name] = L.layerGroup();
			app.map.addLayer(app.layers[l_name]);

			L.mapbox.featureLayer(l)
				.on('layeradd', function(e) { // done for each markers
					app.styleMarkers(e.layer);
				})
				.on('ready', function(e) { // done for each feature layers
					app.onLayerReady(e.target);
					if (++i === imax) {
						app.onAllLayerReady();
					}
				})
				.on('click', function(e) {
		    		app.map.panTo(e.layer.getLatLng());
	   			});
		}
	}
}

app.init();




