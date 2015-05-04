import THREE from 'three';
import FlyControls from './fly-controls';
import pointerLock from './pointer-lock';
import Ship from './ship';

const container = document.createElement( 'div' );
document.body.appendChild( container );

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
container.appendChild( renderer.domElement );

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1 );
camera.position.set( 0, 0, 4 );
scene.add( camera );

const geometry = new THREE.IcosahedronGeometry( 1, 2 );
const material = new THREE.MeshPhongMaterial({
  shading: THREE.FlatShading
});

const mesh = new THREE.Mesh( geometry, material );
scene.add( mesh );

const light = new THREE.PointLight();
light.position.set( 8, 8, 8 );
scene.add( light );

scene.add( new THREE.HemisphereLight( '#f43', '#33a', 0.5 ) );

const ship = new Ship();
ship.mesh.position.set( 0, 0, 8 );
scene.add( ship.mesh );

const controls = new FlyControls( ship.mesh, renderer.domElement );
pointerLock( controls );

const clock = new THREE.Clock();

const updateCamera = (() => {
  const offset = new THREE.Vector3( 0, 0.3, 1 );
  const vector = new THREE.Vector3();

  return () => {
    // Camera position.
    vector.copy( offset )
      .applyQuaternion( ship.mesh.quaternion )
      .add( ship.mesh.position );

    camera.position.copy( vector );

    // Camera up.
    vector.set( 0, 1, 0 ).applyQuaternion( ship.mesh.quaternion );
    camera.up.copy( vector );

    // Camera lookAt target.
    vector.set( 0, 0, -1 )
      .applyQuaternion( ship.mesh.quaternion )
      .add( camera.position );

    camera.lookAt( vector );
  };
})();

function animate() {
  const delta = clock.getDelta();
  controls.update( delta );
  updateCamera();

  renderer.render( scene, camera );
  requestAnimationFrame( animate );
}

animate();
