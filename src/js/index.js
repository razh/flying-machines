import THREE from 'three';
import FlyControls from './fly-controls';
import pointerLock from './pointer-lock';
import Ship from './ship';
import Bullet from './bullet';
import Radar from './radar';
import Skybox from'./skybox';
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

const skybox = new Skybox( camera );
createMap( skybox.scene, 'minimalSkybox' );

const keys = [];
const controls = new FlyControls( ship, renderer.domElement );
controls.speed = config.ship.speed;
pointerLock( controls );

const clock = new THREE.Clock();
let running = true;

const updateCamera = ( object => {
  const stiffness = 0.1;
  const offset = new THREE.Vector3( 0, 0.3, 1 );
  const vector = new THREE.Vector3();

  return () => {
    // Ideal camera position.
    vector.copy( offset )
      .applyQuaternion( object.quaternion )
      .add( object.position );

    camera.position.lerp( vector, stiffness );
    camera.quaternion.slerp( object.quaternion, stiffness );
  };
})( ship );

const canFire = (() => {
  const period = 1 / config.ship.fireRate;
  let previous = 0;

  return time => {
    if ( time - previous < period ) {
      return false;
    }

    previous = time;
    return true;
  };
})();

function fire() {
  const bullet = new Bullet();
  bullet.position.copy( ship.position );
  bullet.start = bullet.position.clone();

  // Fire in ship direction.
  bullet.velocity.set( 0, 0, -config.bullet.speed )
    .applyQuaternion( ship.quaternion )
    .add( ship.velocity );

  client.add( bullet );
}

function animate() {
  const delta = Math.min( clock.getDelta(), 0.1 );
  controls.update();

  if ( keys[ 32 ] && canFire( clock.getElapsedTime() ) ) {
    fire();
  }

  const removed = [];

  update( scene, delta, object => {
    if ( object.type === 'bullet' ) {
      object.lookAt( camera.position );
      if ( object.start &&
           object.start.distanceTo( object.position ) > config.bullet.range ) {
        removed.push( object );
      }
    }
  });

  removed.forEach( object => object.parent.remove( object ) );

  // Update camera after ship update.
  updateCamera();

  radar.position.set( -1, -1, -2 )
    .applyQuaternion( camera.quaternion )
    .add( camera.position );

  radar.reset();
  radar.track( client, camera );
  radar.track( server, camera );

  renderer.autoClear = false;
  skybox.render( renderer, camera );
  renderer.render( scene, camera );
  renderer.autoClear = true;

  if ( running ) {
    requestAnimationFrame( animate );
  }
}

animate();

// Space bar.
document.addEventListener( 'mousedown', () => keys[ 32 ] = true );
document.addEventListener( 'mouseup', () => keys[ 32 ] = false );
document.addEventListener( 'keydown', event => keys[ event.keyCode ] = true );
document.addEventListener( 'keyup', event => keys[ event.keyCode ] = false );

document.addEventListener( 'keydown', event => {
  // P. Pause/play.
  if ( event.keyCode === 80 ) {
    running = !running;
    if ( running ) {
      animate();
    }
  }
});

window.addEventListener( 'resize', () => {
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  skybox.resize( window.innerWidth, window.innerHeight );
});
