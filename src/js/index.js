import THREE from 'three';
import OrbitControls from './../vendor/controls/OrbitControls.js';

const container = document.createElement( 'div' );
document.body.appendChild( container );

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
container.appendChild( renderer.domElement );

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight );
camera.position.set( 0, 0, 4 );
scene.add( camera );

const controls = new THREE.OrbitControls( camera, renderer.domElement );

const geometry = new THREE.IcosahedronGeometry( 1, 2 );
const material = new THREE.MeshPhongMaterial({
  shading: THREE.FlatShading
});

const mesh = new THREE.Mesh( geometry, material );
scene.add( mesh );

const light = new THREE.PointLight();
light.position.set( 8, 8, 8 );
scene.add( light );

function animate() {
  renderer.render( scene, camera );
  requestAnimationFrame( animate );
}

animate();
