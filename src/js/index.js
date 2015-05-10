import THREE from 'three';
import FlyControls from './fly-controls';
import pointerLock from './pointer-lock';
import Ship from './ship';
import Bullet from './bullet';

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
ship.position.set( 0, 0, 8 );
scene.add( ship );

const controls = new FlyControls( ship, renderer.domElement );
pointerLock( controls );

const clock = new THREE.Clock();

const updateCamera = ( object => {
  const offset = new THREE.Vector3( 0, 0.3, 1 );
  const vector = new THREE.Vector3();

  return () => {
    // Camera position.
    vector.copy( offset )
      .applyQuaternion( object.quaternion )
      .add( object.position );

    camera.position.copy( vector );

    // Camera up.
    vector.set( 0, 1, 0 ).applyQuaternion( object.quaternion );
    camera.up.copy( vector );

    // Camera lookAt target.
    vector.set( 0, 0, -1 )
      .applyQuaternion( object.quaternion )
      .add( camera.position );

    camera.lookAt( vector );
  };
})( ship );

const update = (() => {
  const vector = new THREE.Vector3();

  return dt => {
    scene.traverse( object => {
      if ( object.type === 'Bullet' ) {
        vector.copy( object.velocity ).multiplyScalar( dt );
        object.position.addVectors( object.position, vector );
      }
    });
  };
})();

function animate() {
  const delta = clock.getDelta();
  controls.update( delta );

  update( delta );
  updateCamera();

  renderer.render( scene, camera );
  requestAnimationFrame( animate );
}

animate();

const fire = (() => {
  const vector = new THREE.Vector3();

  return () =>  {
    const bullet = new Bullet();
    bullet.position.copy( ship.position );

    vector.set( 0, 0, -1 ).applyQuaternion( ship.quaternion );
    bullet.velocity.copy( vector );

    scene.add( bullet );
  };
})();

document.addEventListener( 'mousedown', fire );
