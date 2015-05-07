'use strict';

const INTERVAL = process.env.INTERVAL || 1000;

const WebSocketServer = require( 'ws' ).Server;
const wss = new WebSocketServer({ port: 8080 });

const state = [];

function toArrayBuffer( buffer ) {
  const arrayBuffer = new ArrayBuffer( buffer.length );
  const view = new Uint8Array( arrayBuffer );
  for ( let i = 0, il = buffer.length; i < il; i++ ) {
    view[i] = buffer[i];
  }

  return arrayBuffer;
}

function toBuffer( arrayBuffer ) {
  const buffer = new Buffer( arrayBuffer.byteLength );
  const view = new Uint8Array( arrayBuffer );
  for ( let i = 0, il = buffer.length; i < il; i++ ) {
    view[i] = buffer[i];
  }

  return buffer;
}

let count = 0;
wss.on( 'connection', function( socket ) {
  const id = count++;

  // Initial id message.
  socket.send( JSON.stringify({ id }) );

  socket.on( 'message', function( message ) {
    /*
      message data is a ArrayBuffer of the structure:
        [0, 1, 2] : float32 - position
        [3, 4, 5] : float32 - quaternion
        [6, 7, 8] : float32 - velocity
        [9, 10, 11] : float32 - angular velocity
     */
    state[ id ] = new Float32Array( toArrayBuffer( message ) );
  });

  const interval = setInterval(function() {
    try {
      const float32Array = new Float32Array( 8 * state.length );
      const uint32Array = new Uint32Array( float32Array.buffer );

      state.forEach(function( array, index ) {
        // Set id.
        uint32Array[ 8 * index ]  = index;
        // Set object state.
        float32Array.set( array, 8 * index + 1 );
      });

      socket.send( toBuffer( float32Array.buffer ), { binary: true } );
     } catch ( error ) {
       console.error( error, error.stack );
       clearInterval( interval );
     }
  }, INTERVAL );

  socket.on( 'close', function() {
    clearInterval( interval );
    delete state[ id ];
  });
});
