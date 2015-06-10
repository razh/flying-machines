import Ship from './ship';
import Bullet from './bullet';
import { encodeClientState, decodeServerMessage } from './client-encode';

const INTERVAL = 16;

function createPool( scene, Constructor ) {
  const pool = [];
  let count = 0;
  let length = 0;

  function get() {
    if ( count === length ) {
      const object = new Constructor();
      scene.add( object );
      pool.push( object );
      length++;
      count++;
      return object;
    }

    return pool[ count++ ];
  }

  function reset() {
    count = 0;
  }

  return { get, reset };
}

export default function createClient( client, server ) {
  const shipPool = createPool( server, Ship );
  const bulletPool = createPool( server, Bullet );

  const socket = new WebSocket( 'ws://' + window.location.hostname + ':8080' );
  socket.binaryType = 'arraybuffer';

  socket.addEventListener( 'open', () => {
    const interval = setInterval(() => {
      socket.send( encodeClientState( client ) );
    }, INTERVAL );

    socket.addEventListener( 'message', event => {
      const state = decodeServerMessage( event.data );
      if ( !state ) {
        return;
      }

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
    });

    socket.addEventListener( 'close', () => clearInterval( interval ) );
  });
}
