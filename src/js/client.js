import Ship from './ship';
import Bullet from './bullet';
import { encodeClientState, decodeServerMessage } from './encode';
import createPool from './pool';

const INTERVAL = 16;

export function createState( scene ) {
  const shipPool = createPool( scene, Ship );
  const bulletPool = createPool( scene, Bullet );

  return state => {
    shipPool.reset();
    bulletPool.reset();

    state.ships.forEach( data => {
      const ship = shipPool.get();
      ship.position.copy( data.position );
      ship.quaternion.copy( data.quaternion );
    });

    state.bullets.forEach( data => {
      const bullet = bulletPool.get();
      bullet.position.copy( data.position );
      bullet.velocity.copy( data.velocity );
    });
  };
}

export default function createClient( client, server ) {
  const socket = new WebSocket( 'ws://' + window.location.hostname + ':8080' );
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
