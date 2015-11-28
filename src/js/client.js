import Ship from './ship';
import Bullet from './bullet';
import Missile from './missile';
import { encodeClientState, decodeServerMessage } from './encode';
import createPool from './pool';

const INTERVAL = 16;

export function createState( scene ) {
  const shipPool = createPool( scene, Ship );
  const bulletPool = createPool( scene, Bullet );
  const missilePool = createPool( scene, Missile );

  return state => {
    shipPool.reset();
    bulletPool.reset();
    missilePool.reset();

    state.ships.forEach( data => {
      const ship = shipPool.get();
      ship.position.copy( data.position );
      ship.velocity.copy( data.velocity );
      ship.quaternion.copy( data.quaternion );
    });

    state.bullets.forEach( data => {
      const bullet = bulletPool.get();
      bullet.position.copy( data.position );
      bullet.velocity.copy( data.velocity );
    });

    state.missiles.forEach( data => {
      const missile = missilePool.get();
      missile.position.copy( data.position );
      missile.velocity.copy( data.velocity );
      missile.quaternion.copy( data.quaternion );
    });
  };
}

function createSocket() {
  // Check for WebSocket binary support.
  if ( !( 'WebSocket' in window ) ) {
    return;
  }

  const socket = new WebSocket( 'ws://' + window.location.hostname + ':8080' );
  if ( !socket.binaryType ) {
    socket.close();
    return;
  }

  return socket;
}

export default function createClient( client, server ) {
  const socket = createSocket();
  socket.binaryType = 'arraybuffer';

  socket.addEventListener( 'open', () => {
    const setState = createState( server );

    const interval = setInterval(() => {
      socket.send( encodeClientState( client ) );
    }, INTERVAL );

    socket.addEventListener( 'message', event => {
      const state = decodeServerMessage( event.data );
      if ( state ) {
        setState( state );
      }
    });

    socket.addEventListener( 'close', () => clearInterval( interval ) );
  });
}
