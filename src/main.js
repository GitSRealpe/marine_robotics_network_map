import 'bootstrap/dist/css/bootstrap.min.css';  // Bootstrap CSS
import 'bootstrap';  // Bootstrap JS (optional, needed for modals, dropdowns, etc.)

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import ThreeGlobe from 'three-globe';

// Setup renderers
const renderers = [new THREE.WebGLRenderer(), new CSS2DRenderer()];
renderers.forEach((r, idx) => {
    r.setSize(window.innerWidth, window.innerHeight);
    if (idx > 0) {
        // overlay additional on top of main renderer
        r.domElement.style.position = 'absolute';
        r.domElement.style.top = '0px';
        r.domElement.style.pointerEvents = 'none';
    }
    document.getElementById('globeViz').appendChild(r.domElement);
});

// Setup scene
const scene = new THREE.Scene();
scene.add(new THREE.AmbientLight(0xcccccc, Math.PI));
const dirlight = new THREE.DirectionalLight(0xffffff, 3)
dirlight.position.set(1, 1, 1)
scene.add(dirlight);

// Setup camera
const camera = new THREE.PerspectiveCamera();
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();
camera.position.z = 500;

// Orbit Controls
const controls = new OrbitControls(camera, renderers[0].domElement);
controls.enablePan = false
controls.enableDamping = true
controls.autoRotate = true
controls.autoRotateSpeed = 0.1
controls.minDistance = 130
controls.maxDistance = 300

const markerSvg = `<svg viewBox="-4 0 36 36">
      <path fill="currentColor" d="M14,0 C21.732,0 28,5.641 28,12.6 C28,23.963 14,36 14,36 C14,36 0,24.064 0,12.6 C0,5.641 6.268,0 14,0 Z"></path>
      <circle fill="black" cx="14" cy="14" r="7"></circle>
    </svg>`;
const gData = [];

function buildGlobe() {
    const Globe = new ThreeGlobe()
        .globeImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg')
        .bumpImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png')
        .showGraticules(true)
        .htmlElementsData(gData)
        .htmlElement(d => {
            const el = document.createElement('div');
            el.innerHTML = markerSvg;
            el.style.color = d.color;
            el.style.width = `${d.size}px`;
            el.style.transition = 'opacity 250ms';
            el.style['pointer-events'] = 'auto';
            el.style.cursor = 'pointer';
            // el.onclick = () => console.info(d);
            el.onclick = () => onclickCb(el, d);
            // el.onmouseover = () => hoverInCb(el, d);
            el.onmouseleave = () => hoverOutCb(el, d);
            return el;
        })
        .htmlElementVisibilityModifier((el, isVisible) => el.style.opacity = isVisible ? 1 : 0);

    // custom globe material
    const globeMaterial = Globe.globeMaterial();
    globeMaterial.bumpScale = 10;
    new THREE.TextureLoader().load('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-water.png', texture => {
        globeMaterial.specularMap = texture;
        globeMaterial.specular = new THREE.Color('grey');
        globeMaterial.shininess = 15;
    });
    scene.add(Globe);
    // Update pov when camera moves
    Globe.setPointOfView(camera);
    controls.addEventListener('change', () => Globe.setPointOfView(camera));

    // Globe.htmlElementsData().push()
}

function onclickCb(el, d) {
    // el.style['pointer-events'] = 'none';
    el.style.cursor = 'auto';
    el.className = "card z-3"; // Bootstrap card class
    el.style.width = "18rem"; // Optional: Set width
    // Set the inner HTML of the card
    el.innerHTML = `
    <div class="card-header">${d.location}</div>
    <div class="card-body">
      <h5 class="card-title">${d.name}</h5>
      <h6 class="card-subtitle mb-2 text-muted">${d.subtitle}</h6>
      <div class="text-center">
            <a href="${d.homepage}" class="btn btn-outline-primary" target="_blank">${d.homepage}</a>
        </div>
    </div>
  `;
}

function hoverOutCb(el, d) {
    el.innerHTML = markerSvg;
    el.className = "";
    el.style.width = `${d.size}px`;
    el.style.cursor = 'pointer';
};

// Fetch JSON data
fetch('markers.json')  // The URL is relative to the "public" folder
    .then(response => response.json())
    .then(data => {
        data.markers.forEach(place => {
            gData.push({
                lat: place.lat,
                lng: place.long,
                name: place.name,
                subtitle: place.subtitle,
                location: place.location,
                // description: place.description,
                homepage: place.homepage,
                size: 25,
                color: ['red', 'purple', 'blue', 'green'][Math.round(Math.random() * 3)],

            })
        });
        buildGlobe()
    })
    .catch(error => {
        console.error('Error loading JSON file:', error);
    });

// Kick-off renderers
(function animate() { // IIFE
    // Frame cycle
    controls.update();
    renderers.forEach(r => r.render(scene, camera));
    requestAnimationFrame(animate);
})();