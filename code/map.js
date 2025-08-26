// Import Three.js and PointerLockControls as ES modules
import * as THREE from 'https://unpkg.com/three@0.150.0/build/three.module.js';
import { PointerLockControls } from 'https://threejs.org/examples/jsm/controls/PointerLockControls.js';

console.log("Map.js loaded");

// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  const exploreBtn = document.getElementById("exploreBtn");
  if (exploreBtn) {
    exploreBtn.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("Explore button clicked");
      launchMapView();
    });
  } else {
    console.error("Explore button not found");
  }
});

// Global variables for Three.js objects and movement state
let camera, scene, renderer, controls;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let prevTime = performance.now();

function launchMapView() {
  // Hide the homepage content
  const content = document.getElementById("content");
  if (content) content.style.display = "none";

  // Show the map container
  const container = document.getElementById("mapContainer");
  if (container) {
    container.style.display = "block";
    console.log("Launching map view");
    initMap(container);
    animateMap();
  } else {
    console.error("Map container not found");
  }
}

function initMap(container) {
  // Set up the camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.set(0, 10, 0);

  // Create the scene with a sky-blue background and fog
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB);
  scene.fog = new THREE.Fog(0x87CEEB, 0, 750);

  // Add lighting
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
  hemiLight.position.set(0, 200, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(50, 200, 100);
  scene.add(dirLight);

  // Create a simple floating island (using a box for simplicity)
  const islandGeometry = new THREE.BoxGeometry(30, 5, 30);
  const islandMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
  const island = new THREE.Mesh(islandGeometry, islandMaterial);
  island.position.set(0, -2.5, -50);
  scene.add(island);

  // Create a ground plane
  const groundGeo = new THREE.PlaneGeometry(1000, 1000);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x1E90FF, side: THREE.DoubleSide });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -10;
  scene.add(ground);

  // Set up the renderer and add it to the container
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  // Set up PointerLockControls for first-person view
  controls = new PointerLockControls(camera, document.body);
  scene.add(controls.getObject());

  // Create overlay for pointer lock instructions
  const blocker = document.createElement("div");
  blocker.id = "blocker";
  Object.assign(blocker.style, {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: "1000"
  });
  const instructions = document.createElement("div");
  instructions.id = "instructions";
  instructions.style.color = "#fff";
  instructions.style.fontSize = "24px";
  instructions.style.fontFamily = "sans-serif";
  instructions.innerHTML = "Click to lock pointer and start moving";
  blocker.appendChild(instructions);
  container.appendChild(blocker);

  instructions.addEventListener("click", () => {
    controls.lock();
  });

  controls.addEventListener("lock", () => {
    blocker.style.display = "none";
  });

  controls.addEventListener("unlock", () => {
    blocker.style.display = "flex";
  });

  // Keyboard event listeners for movement
  document.addEventListener("keydown", onKeyDown, false);
  document.addEventListener("keyup", onKeyUp, false);
  window.addEventListener("resize", onWindowResize, false);
}

function onKeyDown(event) {
  switch (event.code) {
    case "KeyW":
    case "ArrowUp":
      moveForward = true;
      break;
    case "KeyA":
    case "ArrowLeft":
      moveLeft = true;
      break;
    case "KeyS":
    case "ArrowDown":
      moveBackward = true;
      break;
    case "KeyD":
    case "ArrowRight":
      moveRight = true;
      break;
  }
}

function onKeyUp(event) {
  switch (event.code) {
    case "KeyW":
    case "ArrowUp":
      moveForward = false;
      break;
    case "KeyA":
    case "ArrowLeft":
      moveLeft = false;
      break;
    case "KeyS":
    case "ArrowDown":
      moveBackward = false;
      break;
    case "KeyD":
    case "ArrowRight":
      moveRight = false;
      break;
  }
}

function onWindowResize() {
  if (camera && renderer) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

function animateMap() {
  requestAnimationFrame(animateMap);
  const time = performance.now();
  const delta = (time - prevTime) / 1000;
  prevTime = time;

  // Apply damping to velocity
  velocity.x -= velocity.x * 10 * delta;
  velocity.z -= velocity.z * 10 * delta;

  // Calculate direction based on key inputs
  direction.z = Number(moveForward) - Number(moveBackward);
  direction.x = Number(moveRight) - Number(moveLeft);
  direction.normalize();

  if (moveForward || moveBackward) velocity.z -= direction.z * 400 * delta;
  if (moveLeft || moveRight) velocity.x -= direction.x * 400 * delta;

  // Move the camera
  controls.moveRight(-velocity.x * delta);
  controls.moveForward(-velocity.z * delta);

  renderer.render(scene, camera);
}
