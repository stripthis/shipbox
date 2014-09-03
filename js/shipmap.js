var config = {
	copyright : 'Leaflet, Openstreet map, Mapbox &bullet; Greenpeace &copy; 2014',
	tileLayer : 'rbertot.ihpo2bcl',
	featureLayers : {
		'rbertot.ii696lei' : 'rw3',
		'rbertot.jb84217i' : 'myez',
		'rbertot.jddm1ep5' : 'myas',
		//'gpshipsmap.j3b5195d' : 'rw3',
		//'gpshipsmap.j1jfcjmg' : 'myez',
		//'gpshipsmap.j9bnjlbi' : 'myas'
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
			"className": "ship",
			"shipName" : 'rw3'
		},
		'e' : { // r = esperanza
			"iconUrl": 'img/icon-espy.svg',
			"iconSize": [60, 68],
			"iconAnchor": [40, 48],
			"popupAnchor": [0, -25],
			"className": "ship",
			"shipName" : 'myez'
		},
		'a' : { // a = arctic sunrise
			"iconUrl": 'img/icon-as.svg',
			"iconSize": [60, 68],
			"iconAnchor": [40, 48],
			"popupAnchor": [0, -25],
			"className": "ship",
			"shipName" : 'myas'
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
	ships : {
		// used to get access to ships markers
	},
	layers : {
		// used to get access to ship layers
	},
	menu : {
		'open' : true
	},

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

	// Add/Hide a minimap
	toggleMiniMap : function() {
		// add or remove layers
		if (app.minimap !== undefined) {
			$('.leaflet-control-minimap').toggleClass('hidden');
		} else {
			var minitile = new L.mapbox.tileLayer(config.tileLayer);
			app.minimap = new L.Control.MiniMap(minitile, config.minimap)
				.addTo(app.map);
		}
	},

	// Add the line connecting the markers
	// @param l featurelayer (some markers)
	// @param s string ship name
	connectTheDots : function(l, s) {
		var line = [];
		l.eachLayer(function(marker) {
			line.push(marker.getLatLng());
		});
  		L.polyline(line, config.polyline).addTo(app.layers[s]);
	},

	// Style markers with icon images based on their symbol 
	// @param marker layer
	styleMarkers : function(marker) {
		var symbol = marker.feature.properties['marker-symbol'];
		var icon = config.icons[symbol];
		// if the icon is specified in the app config
		// we override the default one
		if (icon !== undefined) {
			marker.setIcon(L.icon(icon));
			if (icon.className === 'ship' ) {
				app.ships[icon.shipName] = marker;
			}
		}
	},

	// load copyright in leaflet reserved space
	loadCopyright : function () {
		$(".leaflet-control-attribution").html(config.copyright);
	},

	// bind UI navigation event to application logic
	bindNavEvents : function () {
		// show/hide menu tigger
		$( ".menu-ctrl" ).click(function(e) {
			e.preventDefault();
			app.onMenuToggle();
		});
		// show/hidde ships buttons trigger
		$( ".toggle" ).click(function(e) {
			e.preventDefault();
			s = this.getAttribute("data-ship");
			app.onShipLayerToggle(s,this);
		});
		// goto ship button click trigger
		$( ".pan" ).click(function(e) {
			e.preventDefault();
			s = this.getAttribute("data-ship");
			app.onPanToShip(s);
		});
	},

	//  what happen when clickin on menu hide/show button
	onMenuToggle : function() {
		app.menu.open = !app.menu.open;
		$('.menu-ctrl').toggleClass('open');
		$('.menu-ctrl-target').toggleClass('hidden');
		app.toggleMiniMap();
	},

	// what happen when clicking hide/show buttons for a given ship
	// @param s string shipname
	// @param a jquery object, the link that was clicked
	onShipLayerToggle : function(s, a) {
		// toggle button icon
		$(a).children('i')
			.toggleClass('fa-eye')
			.toggleClass('fa-eye-slash');

		// add or remove layers
		if (app.map.hasLayer(app.layers[s])) {
			app.map.removeLayer(app.layers[s]);
		} else {
			app.map.addLayer(app.layers[s]);
		}
	},

	// what happen when clicking the goto ship bottons
	// @param s string shipname
	onPanToShip : function(s) {
		ship = app.ships[s];
        app.map.panTo(ship.getLatLng());
        ship.openPopup();
	},

	// what happen when a layer have been loaded via ajax
	// @param l feature layer
	onLayerReady : function(l) {
		var ship = config.featureLayers[l._geojson.id];
		app.createCluster(l, ship);
		app.connectTheDots(l, ship);
	},
	
	// what happen when all layers are loaded and ready
	onAllLayerReady : function() {
		app.bindNavEvents();
		app.toggleMiniMap();
		app.loadCopyright();
	},
	
	// application entry point
	init : function() {
		// Here we avoid loading in markers from the layer. Instead we add just the
		// backing tileLayer, and then use the featureLayers to add data on top of it.
		app.map = L.map('map', config.mapOptions)
			.addLayer(L.mapbox.tileLayer(config.tileLayer));

		// we don't directly use the feature layer used to load the markers
		// instead we break it down into other smaller layers and add it to app.layer
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
				.on('click', function(e) { // done for each click on markers
		    		app.map.panTo(e.layer.getLatLng());
	   			});
		}
	}
}
// haaaaaaaaardi matelot
app.init();

