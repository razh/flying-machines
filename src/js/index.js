// eslint-disable-next-line no-console
console.time('test');

import * as THREE from 'three';
import FlyControlsTouch from './touch';
import pointerLock from './pointer-lock';
import Ship from './ship';
import Bullet from './bullet';
import Missile from './missile';
import { LineTrail, SpriteTrail, ScreenSpaceTrail } from './trail';
import Drone from './drone';
import Radar from './radar';
import { TargetingComputer } from './reticle';
import Offscreen from './offscreen';
import Skybox from'./skybox';
import Debris from './debris';
import { ExplosionPool } from './explosion';
import createClient from './client';
import traverse from './traverse';
import update from './update';
import { collide, collisions } from './collision';
import config from './config';
import createMap from './map';
import { remove } from './utils';
import createWebRTCComponent from './webrtc-component';
import createGraph from './graph';
import Bloom from './bloom';

const container = document.createElement( 'div' );
document.body.appendChild( container );

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
container.appendChild( renderer.domElement );

const scene = new THREE.Scene();
createMap( scene, 'minimal' );
createMap( scene, 'artifacts' );

const client = new THREE.Group();
scene.add( client );

const server = new THREE.Group();
scene.add( server );

createClient( client, server );

const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1 );
scene.add( camera );

const ship = new Ship();
ship.geometry.computeBoundingSphere();
client.add( ship );

const radar = new Radar( ship );
client.add( radar );

const lineTrail = new LineTrail();
lineTrail.offset.set( 0, 0, 0.4 );
// client.add( lineTrail );

const spriteTrail = new SpriteTrail();
spriteTrail.offset.set( 0, 0, 0.4 );
// client.add( spriteTrail );

const screenSpaceTrail = new ScreenSpaceTrail();
screenSpaceTrail.offset.set( 0, 0, 0.4 );
scene.add( screenSpaceTrail );

const droneA = new Drone();
client.add( droneA );

const droneB = new Drone();
droneB.time = droneB.duration / 2;
client.add( droneB );

const targetingComputer = new TargetingComputer( ship, droneA );
scene.add( targetingComputer );

const offscreen = new Offscreen( camera );
offscreen.target = droneA;
scene.add( offscreen );

const debris = new Debris();
scene.add( debris );

const missile = new Missile();
missile.position.set( 0, 0, -3 );
missile.velocity.set( 0, 0, -1 );
client.add( missile );

const explosionPool = new ExplosionPool();
scene.add( explosionPool );

const skybox = new Skybox( camera );
createMap( skybox.scene, 'minimalSkybox' );

const keys = [];
const controls = new FlyControlsTouch( ship, renderer.domElement );
controls.speed = config.ship.speed;
pointerLock( controls );

const graph = createGraph();
window.graph = graph;
document.body.appendChild( graph.canvas );
graph.canvas.style.position = 'absolute';
graph.canvas.style.bottom = 0;
graph.add( 'px' );

graph.add('ox', '#fff');
graph.add('oy', '#f00');
graph.add('oz', '#ddf');

scene.add( skybox.scene )
const bloom = new Bloom(renderer, scene, camera);

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
  const offset = new THREE.Vector3( 0, 0, -ship.geometry.boundingSphere.radius );

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

function render() {
  // renderer.autoClear = false;
  // skybox.render( renderer, camera );
  // renderer.render( scene, camera );
  // renderer.autoClear = true;
  bloom.render();
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

    spriteTrail.track( ship );

    // Update camera after ship update.
    updateCamera( dt );

    accumulatedTime -= dt;
  }

  graph.update('ox', offscreen.position.x);
  graph.update('oy', offscreen.position.y);
  graph.update('oz', offscreen.position.z);

  radar.position.set( -1, -1, -2 )
    .applyQuaternion( camera.quaternion )
    .add( camera.position );

  // graph.update( 'px', ship.position.x );
  graph.draw();

  radar.reset();
  radar.track( client );
  radar.track( server );
  lineTrail.track( ship );
  lineTrail.generate();
  screenSpaceTrail.track( ship );
  screenSpaceTrail.generate( camera );
  debris.track( ship );

  render();

  if ( running ) {
    requestAnimationFrame( animate );
  }
}

// eslint-disable-next-line no-console
console.timeEnd('test');

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

function switchTarget( direction = 1 ) {
  const radius = config.bullet.range;
  const radiusSquared = radius * radius;
  const targets = [];

  traverse( client, object => {
    if ( object.type === 'drone' || object.type === 'missile' ) {
      const distanceToSquared = ship.position
        .distanceToSquared( object.position );

      if ( distanceToSquared <= radiusSquared ) {
        targets.push( object );
      }
    }
  });

  const index = targets.indexOf( targetingComputer.target );
  const newIndex = THREE.Math.euclideanModulo( index + direction, targets.length );
  const newTarget = targets[ newIndex ];

  if ( newTarget ) {
    targetingComputer.target = newTarget;
  }
}

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

  // T. Switch targets. Shift for reverse direction.
  if ( event.keyCode === 84 ) {
    switchTarget( event.shiftKey ? -1 : 1 );
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

  render();
});

if ( /rtc/.test( window.location.href ) ) {
  createWebRTCComponent( client, server );
}
