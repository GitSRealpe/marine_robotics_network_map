import 'bootstrap/dist/css/bootstrap.min.css';  // Bootstrap CSS
import 'bootstrap';  // Bootstrap JS (optional, needed for modals, dropdowns, etc.)

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import Stats from 'stats.js';
// import ThreeGlobe from 'three-globe';

import { buildGlobe } from './myGlobe.js'

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
scene.add(new THREE.AmbientLight(0xcccccc, 3));
const dirlight = new THREE.DirectionalLight(0xffffff, 3)
dirlight.position.set(1, 1, 1)
scene.add(dirlight);

// Setup camera
const camera = new THREE.PerspectiveCamera();
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();
camera.position.z = 300;

// Orbit Controls
const controls = new OrbitControls(camera, renderers[0].domElement);
controls.enablePan = false
controls.enableDamping = true
controls.autoRotate = true
controls.autoRotateSpeed = 0.1
controls.minDistance = 130
controls.maxDistance = 300

// Fetch JSON data
fetch('markers.json')  // The URL is relative to the "public" folder
    .then(response => response.json())
    .then(data => {
        const gData = [];
        data.markers.forEach(place => {
            gData.push({
                lat: place.lat,
                lng: place.long,
                name: place.name,
                subtitle: place.subtitle,
                location: place.location,
                affiliation: place.affiliation,
                // description: place.description,
                homepage: place.homepage,
                size: 25,
                color: ['red', 'purple', 'blue', 'green'][Math.round(Math.random() * 3)],

            })
        });
        let globe = buildGlobe(gData)
        scene.add(globe)
        // Update pov when camera moves
        globe.setPointOfView(camera);
        controls.addEventListener('change', () => globe.setPointOfView(camera));

    })
    .catch(error => {
        console.error('Error loading JSON file:', error);
    });

const texture = new THREE.TextureLoader().load("https://cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png");
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(1, 1);

const geometry = new THREE.SphereGeometry(500, 32, 16);
// const material = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.BackSide });
const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

var stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

// Kick-off renderers
(function animate() { // IIFE
    stats.begin();
    // Frame cycle
    controls.update();
    renderers.forEach(r => r.render(scene, camera));
    requestAnimationFrame(animate);
    stats.end();
})();