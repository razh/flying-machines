import Ship from './ship';
import Bullet from './bullet';
import messages from './messages';

const INTERVAL = 16;

function encode( scene ) {
  const state = {
    bullets: []
  };

  scene.traverse( object => {
    if ( object.type === 'ship' ) {
      state.ship = object;
    } else if ( object.type === 'bullet' ) {
      state.bullets.push( object );
    }
  });

  return messages.ClientState.encode( state );
}

function toBuffer( arrayBuffer ) {
  const buffer = new Buffer( arrayBuffer.byteLength );
  const view = new Uint8Array( arrayBuffer );
  for ( let i = 0, il = buffer.length; i < il; i++ ) {
    buffer[i] = view[i];
  }

  return buffer;
}

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
      socket.send( encode( client ) );
    }, INTERVAL );

    socket.addEventListener( 'message', event => {
      const state = messages.ServerState.decode( toBuffer( event.data ) );
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
