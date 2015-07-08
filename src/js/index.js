import THREE from 'three';
import FlyControls from './fly-controls';
import pointerLock from './pointer-lock';
import Ship from './ship';
import Bullet from './bullet';
import Radar from './radar';
import createClient from './client';
import update from './update';
import config from './config';
import createMap from './map';

const container = document.createElement( 'div' );
document.body.appendChild( container );

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
container.appendChild( renderer.domElement );

const scene = new THREE.Scene();
createMap( scene, 'minimal' );

const client = new THREE.Group();
scene.add( client );

const server = new THREE.Group();
scene.add( server );

createClient( client, server );

const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1 );
scene.add( camera );

const ship = new Ship();
client.add( ship );

const radar = new Radar( ship );
client.add( radar );

const controls = new FlyControls( ship, renderer.domElement );
controls.speed = config.ship.speed;
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

function animate() {
  const delta = clock.getDelta();
  controls.update( delta );

  update( scene, delta, object => {
    if ( object.type === 'bullet' ) {
      object.lookAt( camera.position );
    }
  });

  updateCamera();
  radar.update( client, camera );

  renderer.render( scene, camera );
  requestAnimationFrame( animate );
}

animate();

const fire = (() => {
  const velocity = new THREE.Vector3();

  return () =>  {
    const bullet = new Bullet();
    bullet.position.copy( ship.position );

    // Calculate local ship velocity.
    velocity.copy( controls.movementVector )
      .setLength( config.ship.speed );

    // Fire in ship direction.
    bullet.velocity.set( 0, 0, -config.bullet.speed )
      .add( velocity )
      .applyQuaternion( ship.quaternion );

    client.add( bullet );
  };
})();

document.addEventListener( 'mousedown', fire );

document.addEventListener( 'keydown', event => {
  // Space.
  if ( event.keyCode === 32 ) {
    fire();
  }
});

window.addEventListener( 'resize', () => {
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
