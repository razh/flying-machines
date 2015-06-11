import Ship from './ship';
import Bullet from './bullet';
import { encodeClientState, decodeServerMessage } from './encode';
import createPool from './pool';

const INTERVAL = 16;

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
