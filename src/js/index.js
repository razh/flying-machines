import THREE from 'three';
import FlyControlsTouch from './touch';
import pointerLock from './pointer-lock';
import Ship from './ship';
import Bullet from './bullet';
import Drone from './drone';
import Radar from './radar';
import Reticle, { Prediction } from './reticle';
import Skybox from'./skybox';
import Trail, { ScreenSpaceTrail } from './trail';
import Debris from './debris';
import Explosion from './explosion';
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

const trail = new Trail();
trail.offset.set( 0, 0, 0.3 );
client.add( trail );

const reticle = new Reticle( ship );
scene.add( reticle );

const drone = new Drone();
client.add( drone );

const prediction = new Prediction( drone );
scene.add( prediction );

const debris = new Debris();
scene.add( debris );

const explosion = new Explosion();
explosion.position.set( 0, -1, -4 );
scene.add( explosion );

setInterval( () => explosion.reset(), 1000 );

const skybox = new Skybox( camera );
createMap( skybox.scene, 'minimalSkybox' );

const keys = [];
const controls = new FlyControlsTouch( ship, renderer.domElement );
controls.speed = config.ship.speed;
pointerLock( controls );

const clock = new THREE.Clock();
let running = true;

const updateCamera = ( target => {
  const stiffness = 6;
  const offset = new THREE.Vector3( 0, 0.3, 1 );
  const vector = new THREE.Vector3();

  return dt => {
    // Ideal camera position.
    vector.copy( offset )
      .applyQuaternion( target.quaternion )
      .add( target.position );

    camera.position.lerp( vector, stiffness * dt );
    camera.quaternion.slerp( target.quaternion, stiffness * dt );
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
  updateCamera( delta );

  radar.position.set( -1, -1, -2 )
    .applyQuaternion( camera.quaternion )
    .add( camera.position );

  radar.reset();
  radar.track( client, camera );
  radar.track( server, camera );
  trail.track( ship );
  debris.track( ship );

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

  if ( event.keyCode === 16 ) {
    controls.speed = 4 * config.ship.speed;
  }
});

document.addEventListener( 'keyup', event => {
  if ( event.keyCode === 16 ) {
    controls.speed = config.ship.speed;
  }
});

window.addEventListener( 'resize', () => {
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  skybox.resize( window.innerWidth, window.innerHeight );
});

require( './webrtc-component' )( client, server );
