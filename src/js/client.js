import Ship from './ship';

const INTERVAL = 16;

export default function createClient( scene, ship ) {
  const ships = [];

  const socket = new WebSocket( 'ws://' + window.location.hostname + ':8080' );
  socket.binaryType = 'arraybuffer';

  socket.addEventListener( 'open', () => {
    setInterval(() => {
      const array = new Float32Array( 7 );
      ship.position.toArray( array );
      ship.quaternion.toArray( array, 3 );
      socket.send( array, { binary: true , mask: true } );
    }, INTERVAL );

    socket.addEventListener( 'message', event => {
      const data = JSON.parse( event.data );
      // Handle id message.
      if ( data.id ) {
        return;
      }

      Object.keys( data ).forEach( key => {
        const datum = new Float32Array( data[ key ] );
        let ship = ships[ key ];
        if ( !ship ) {
          ship = new Ship();
          ships[ key ] = ship;
          scene.add( ship );
        }

        ship.position.fromArray( datum );
        ship.quaternion.fromArray( datum, 3 );
      });
    });
  });
}
