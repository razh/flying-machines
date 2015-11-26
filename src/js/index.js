import THREE from 'three.js';
import FlyControlsTouch from './touch';
import pointerLock from './pointer-lock';
import Ship from './ship';
import Bullet from './bullet';
import Drone from './drone';
import Radar from './radar';
import { TargetingComputer } from './reticle';
import Skybox from'./skybox';
import Debris from './debris';
import { ExplosionPool } from './explosion';
import createClient from './client';
import update from './update';
import { collide, collisions } from './collision';
import config from './config';
import createMap from './map';
import { remove } from './utils';

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

const drone = new Drone();
client.add( drone );

const targetingComputer = new TargetingComputer( ship, drone );
scene.add( targetingComputer );

const debris = new Debris();
scene.add( debris );

const explosionPool = new ExplosionPool();
scene.add( explosionPool );

const skybox = new Skybox( camera );
createMap( skybox.scene, 'minimalSkybox' );

const keys = [];
const controls = new FlyControlsTouch( ship, renderer.domElement );
controls.speed = config.ship.speed;
pointerLock( controls );

const clock = new THREE.Clock();
let running = true;

const dt = 1 / 60;
let accumulatedTime = 0;

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
  const period = 1 / config.bullet.rate;
  let previous = 0;

  return time => {
    if ( time - previous < period ) {
      return false;
    }

    previous = time;
    return true;
  };
})();

const fire = (() => {
  const offset = new THREE.Vector3( 0, 0, -0.25 );

  return () => {
    const bullet = new Bullet();

    bullet.position.copy( offset )
      .applyQuaternion( ship.quaternion )
      .add( ship.position );

    bullet.start = bullet.position.clone();

    // Fire in ship direction.
    bullet.velocity.set( 0, 0, -config.bullet.speed )
      .applyQuaternion( ship.quaternion )
      .add( ship.velocity );

    client.add( bullet );
  }
})();

let collided = [];

function onCollide( a, b ) {
  if ( a.type !== 'bullet' && b.type !== 'bullet' ) {
    return;
  }

  const handler = collisions[ a.shape | b.shape ];

  let collision;
  let bullet;

  if ( a.shape < b.shape ) {
    collision = handler( a, b );
    bullet = a;
  } else {
    collision = handler( b, a );
    bullet = b;
  }

  if ( collision ) {
    const explosion = explosionPool.get();
    explosion.position.copy( collision );
    collided.push( bullet );
  }
}

function animate() {
  const delta = Math.min( clock.getDelta(), 0.1 );
  controls.update();

  accumulatedTime += delta;

  while ( accumulatedTime >= dt ) {
    if ( keys[ 32 ] && canFire( clock.getElapsedTime() ) ) {
      fire();
    }

    const removed = [];

    update( scene, dt, object => {
      if ( object.type === 'bullet' ) {
        object.lookAt( camera.position );
        if ( object.start &&
             object.start.distanceTo( object.position ) > config.bullet.range ) {
          removed.push( object );
        }
      }
    });

    collided = [];
    collide( scene, onCollide );
    collided.forEach( remove );

    removed.forEach( remove );

    // Update camera after ship update.
    updateCamera( dt );

    accumulatedTime -= dt;
  }

  radar.position.set( -1, -1, -2 )
    .applyQuaternion( camera.quaternion )
    .add( camera.position );

  radar.reset();
  radar.track( client, camera );
  radar.track( server, camera );
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
const startFiring = () => keys[ 32 ] = true;
const stopFiring = () => keys[ 32 ] = false;

document.addEventListener( 'mousedown', startFiring );
document.addEventListener( 'mouseup', stopFiring );
document.addEventListener( 'touchstart', startFiring );
document.addEventListener( 'touchend', stopFiring );
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

  // Shift key.
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

if ( /rtc/.test( window.location.href ) ) {
  require( './webrtc-component' )( client, server );
}
