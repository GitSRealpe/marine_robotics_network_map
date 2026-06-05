import * as THREE from "three";

// Create a star canvas BEHIND the map canvas
const starCanvas = document.createElement('canvas');
starCanvas.style.position = 'absolute';
starCanvas.style.top = '0';
starCanvas.style.left = '0';
starCanvas.style.width = '100%';
starCanvas.style.height = '100%';
starCanvas.style.zIndex = '0'; // behind map
document.getElementById('map').parentElement.insertBefore(starCanvas, document.getElementById('map'));

document.getElementById('map').style.background = 'transparent';

// Three.js starfield on the separate canvas
const renderer = new THREE.WebGLRenderer({ canvas: starCanvas, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const skyScene = new THREE.Scene();
const skyCamera = new THREE.PerspectiveCamera(
    36,
    window.innerWidth / window.innerHeight, // aspect ratio
    0.1,
    10
);
skyCamera.position.set(0, 0, 0.001); // tiny offset so it's inside the sphere

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    skyCamera.aspect = window.innerWidth / window.innerHeight;
    skyCamera.updateProjectionMatrix();
});

const texture = new THREE.TextureLoader().load("https://cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png");
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(1, 1);

const geometry = new THREE.SphereGeometry(1, 32, 16);
// const material = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.BackSide });
const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
const sphere = new THREE.Mesh(geometry, material);
skyScene.add(sphere);

// Sync rotation with map bearing/pitch
export function renderSky(map) {
    const center = map.getCenter();
    const zoom = map.getZoom();

    const euler = new THREE.Euler(
        THREE.MathUtils.degToRad(center.lat),  // latitude → X rotation
        THREE.MathUtils.degToRad(-center.lng),  // longitude → Y rotation
        THREE.MathUtils.degToRad(map.getBearing()), // bearing → Z rotation
        'YXZ'
    );
    sphere.rotation.copy(euler);

    renderer.render(skyScene, skyCamera);
    requestAnimationFrame(() => renderSky(map)); // ← arrow function keeps map in scope
}