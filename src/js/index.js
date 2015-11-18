import THREE from 'three.js';
import FlyControlsTouch from './touch';
import pointerLock from './pointer-lock';
import Ship from './ship';
import Bullet from './bullet';
import Drone from './drone';
import Radar from './radar';
import { TargetingComputer } from './reticle';
import Skybox from'./skybox';
import Engine from './engine';
import Debris from './debris';
import Explosion, { ExplosionPool } from './explosion';
import createClient from './client';
import update from './update';
import { collide } from './collision';
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

const engine = new Engine( ship );
engine.position.set( 0, 0, 0.3 );
ship.add( engine );

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

const onCollide = (() => {
  const vector = new THREE.Vector3();

  return ( a, b ) => {
    let bullet;
    let object;

    if ( a.type === 'bullet' ) {
      bullet = a;
      object = b;
    } else {
      bullet = b;
      object = a;
    }

    if ( object.type !== 'asteroid' && object.type !== 'drone' ) {
      return;
    }

    object.worldToLocal( bullet.getWorldPosition( vector ) );

    if ( object.geometry.boundingSphere.containsPoint( vector ) ) {
      const explosion = explosionPool.get();
      explosion.position.copy( bullet.position );
      return bullet;
    }
  };
})();

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

    removed.push( ...collide( scene, onCollide ) );

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
