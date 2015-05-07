import Ship from './ship';

const INTERVAL = 16;

export default function createClient( scene, ship ) {
  const ships = [];

  const socket = new WebSocket( 'ws://' + window.location.hostname + ':8080' );
  socket.binaryType = 'arraybuffer';

  socket.addEventListener( 'open', () => {
    const interval = setInterval(() => {
      const array = new Float32Array( 7 );
      ship.position.toArray( array );
      ship.quaternion.toArray( array, 3 );
      socket.send( array, { binary: true , mask: true } );
    }, INTERVAL );

    socket.addEventListener( 'message', event => {
      if ( !( event.data instanceof ArrayBuffer ) ) {
        console.log( JSON.parse( event.data ));
        return;
      }

      const float32Array = new Float32Array( event.data );
      const uint32Array = new Uint32Array( event.data );
      const state = new Float32Array( 7 );
      for ( let i = 0, il = float32Array.length; i < il; i += 8 ) {
        const id = uint32Array[i];
        for ( let j = 0, jl = state.length; j < jl; j++ ) {
          state[j] = float32Array[ i + j + 1 ];
        }

        let ship = ships[ id ];
        if ( !ship ) {
          ship = new Ship();
          ships[ id ] = ship;
          scene.add( ship );
        }

        ship.position.fromArray( state );
        ship.quaternion.fromArray( state, 3 );
      }
    });

    socket.addEventListener( 'close', () => clearInterval( interval ) );
  });
}
