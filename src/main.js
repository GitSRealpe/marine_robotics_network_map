import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import 'bootstrap/dist/css/bootstrap.min.css';  // Bootstrap CSS
import 'bootstrap';  // Bootstrap JS (optional, needed for modals, dropdowns, etc.)

const map = new maplibregl.Map({
	container: 'map',
	style: 'map_style.json', // reliable free style
	center: [2.8363417576785377, 41.967662037896005],
	zoom: 3
});

map.on('style.load', () => {
	map.setProjection({
		type: 'globe', // Set projection to globe
	});
});


map.on('load', async () => {
	const image = await map.loadImage('https://maplibre.org/maplibre-gl-js/docs/assets/custom_marker.png');
	// Add an image to use as a custom marker
	map.addImage('custom-marker', image.data);

	// add marker list
	map.addSource('places', { type: 'geojson', data: 'markers.json' });

	// Add a layer showing the places.
	map.addLayer({
		id: 'places',
		type: 'symbol',
		source: 'places',
		layout: {
			'icon-image': '{icon}',
			'icon-overlap': 'always',
			'icon-size': 2,
			'text-field': ['get', 'name'],
			'text-offset': [0, 1.25],
			'text-anchor': 'top'
		},
		paint: {
			'text-color': '#000000',
			'text-halo-color': '#ffffff',
			'text-halo-width': 2
		},
	});

	// When a click event occurs on a feature in the places layer, open a popup at the
	// location of the feature, with description HTML from its properties.
	map.on('click', 'places', (e) => {
		const coordinates = e.features[0].geometry.coordinates.slice();
		const description = e.features[0].properties.description;
		const properties = e.features[0].properties;

		// Ensure that if the map is zoomed out such that multiple
		// copies of the feature are visible, the popup appears
		// over the copy being pointed to.
		while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
			coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
		}

		new maplibregl.Popup()
			.setLngLat(coordinates)
			.setHTML(`<div class="card-header">${properties.location}</div>
    						<div class="card-body">
      					<h5 class="card-title">${properties.name}</h5>
      					<h6 class="card-subtitle mb-2 text-muted">${properties.subtitle}</h6>
					      <p>${properties.affiliation}</p>
      					<div class="text-center">
            		<a href="${properties.homepage}" class="btn btn-outline-primary" target="_blank">${properties.homepage}</a>
        				</div>
						    </div>`)
			.addTo(map);
	});


});

// Change the cursor to a pointer when the mouse is over the places layer.
map.on('mouseenter', 'places', () => {
	map.getCanvas().style.cursor = 'pointer';
});

// Change it back to a pointer when it leaves.
map.on('mouseleave', 'places', () => {
	map.getCanvas().style.cursor = '';
});


map.addControl(new maplibregl.FullscreenControl());