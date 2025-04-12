import * as THREE from 'three';
import ThreeGlobe from 'three-globe';

const markerSvg = `<svg viewBox="-4 0 36 36">
      <path fill="currentColor" d="M14,0 C21.732,0 28,5.641 28,12.6 C28,23.963 14,36 14,36 C14,36 0,24.064 0,12.6 C0,5.641 6.268,0 14,0 Z"></path>
      <circle fill="black" cx="14" cy="14" r="7"></circle>
    </svg>`;

export function buildGlobe(gData) {
    const Globe = new ThreeGlobe()
        .globeImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg')
        .bumpImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png')
        .showGraticules(true)
        .htmlElementsData(gData)
        .htmlElement(d => {
            const el = document.createElement('div');
            // el.innerHTML = "<button type='button' class='mb-0'>" + d.name + "</button>" + markerSvg
            el.innerHTML = "<p class='mb-0' style='color: white'>" + d.name + "</p>" + markerSvg;
            // el.innerHTML = markerSvg;
            el.style.color = d.color;
            el.style.width = `${d.size}px`;
            el.style.transition = 'opacity 250ms';
            el.style['pointer-events'] = 'auto';
            el.style.cursor = 'pointer';
            el.onclick = () => onclickCb(el, d);
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

    const CLOUDS_IMG_URL = 'clouds.png'; // from https://github.com/turban/webgl-earth
    const CLOUDS_ALT = 0.004;
    const CLOUDS_ROTATION_SPEED = -0.006; // deg/frame

    const Clouds = new THREE.Mesh(new THREE.SphereGeometry(Globe.getGlobeRadius() * (1 + CLOUDS_ALT), 75, 75));
    new THREE.TextureLoader().load(CLOUDS_IMG_URL, cloudsTexture => {
        Clouds.material = new THREE.MeshPhongMaterial({ map: cloudsTexture, transparent: true });
    });

    Globe.add(Clouds);

    (function rotateClouds() {
        Clouds.rotation.y += CLOUDS_ROTATION_SPEED * Math.PI / 180;
        requestAnimationFrame(rotateClouds);
    })();

    return Globe
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
      <p>${d.affiliation}</p>
      <div class="text-center">
            <a href="${d.homepage}" class="btn btn-outline-primary" target="_blank">${d.homepage}</a>
        </div>
    </div>
  `;
}

function hoverOutCb(el, d) {
    el.innerHTML = "<p class='mb-0' style='color: white'>" + d.name + "</p>" + markerSvg;
    el.className = "";
    el.style.width = `${d.size}px`;
    el.style.cursor = 'pointer';
};