import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { renderSky } from './skybox.js'

const map = new maplibregl.Map({
	container: 'map',
	style: 'map_style.json', // reliable free style
	center: [2.8363417576785377, 41.967662037896005],
	zoom: 3,
	// minZoom: 3,
	maxZoom: 18,
});

map.on('style.load', () => {
	map.setProjection({
		type: 'globe', // Set projection to globe
	});
});


map.on('load', async () => {
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

		let div = document.createElement('div');
		div.innerHTML = `<div class="bg-white border border-gray-800 rounded-xl overflow-hidden">
	<div class="px-0 py-0 border-b border-gray-200 flex items-center justify-between">
		<div class="flex items-center gap-3">
			<div>
				<h3 class="px-4 py-2 bg-gray-300 border-b border-gray-200 text-sm font-bold text-gray-500">${properties.location}</h3>
				<div class="px-4 py-3">
					<h3 class="text-2xl font-bold text-shadow-lg/30 text-sky-800">${properties.name}</h3>
					<h6 class="text-lg text-gray-700">${properties.subtitle}</h6>
					<p class="text-base text-gray-500">${properties.affiliation}</p>
				</div>
			</div>
		</div>
		</div>
		<div class="px-5 pb-2 pt-0 flex justify-center">
			<a href="${properties.homepage}" class="text-sm px-3 py-1 rounded-lg border border-blue-400 text-gray-500 hover:bg-gray-300">${properties.homepage}</a>
		</div>
		</div > `;

		new maplibregl.Popup({ maxWidth: 'none' })
			.setLngLat(coordinates)
			.setDOMContent(div)
			.addTo(map);
	});

	renderSky(map);
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