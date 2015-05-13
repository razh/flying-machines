import Ship from './ship';
import Bullet from './bullet';

const INTERVAL = 16;

function serialize( scene ) {
  const jsonObject = {
    bullets: []
  };

  scene.traverse( object => {
    if ( object.type === 'ship' ) {
      jsonObject.ship = {
        position: object.position.toArray(),
        quaternion: object.quaternion.toArray()
      };
    } else if ( object.type === 'bullet' ) {
      jsonObject.bullets.push({
        position: object.position.toArray(),
        velocity: object.velocity.toArray()
      });
    }
  });

  return jsonObject;
}

export default function createClient( client, server ) {

  const bulletPool = (() => {
    const pool = [];
    let count = 0;
    let length = 0;

    function get() {
      if ( count === length ) {
        const bullet = new Bullet();
        server.add( bullet );
        pool.push( bullet );
        length++;
        count++;
        return bullet;
      }

      return pool[ count++ ];
    }

    function reset() {
      count = 0;
    }

    return { get, reset };
  })();

  const ships = {};

  const socket = new WebSocket( 'ws://' + window.location.hostname + ':8080' );
  socket.binaryType = 'arraybuffer';

  socket.addEventListener( 'open', () => {
    const interval = setInterval(() => {
      socket.send( JSON.stringify( serialize( client ) ) );
    }, INTERVAL );

    socket.addEventListener( 'message', event => {
      const data = JSON.parse( event.data );
      // Handle id message.
      if ( !data || isFinite( data.id ) ) {
        return;
      }

      bulletPool.reset();

      Object.keys( data ).forEach( key => {
        const world = data[ key ];
        if ( !world ) {
          return;
        }

        if ( world.ship ) {
          let ship = ships[ key ];
          if ( !ship ) {
            ship = new Ship();
            ships[ key ] = ship;
            server.add( ship );
          }

          ship.position.fromArray( world.ship.position );
          ship.quaternion.fromArray( world.ship.quaternion );
        }

        world.bullets.forEach( data => {
          const bullet = bulletPool.get();
          bullet.position.fromArray( data.position );
          bullet.velocity.fromArray( data.velocity );
        });
      });
    });

    socket.addEventListener( 'close', () => clearInterval( interval ) );
  });
}
