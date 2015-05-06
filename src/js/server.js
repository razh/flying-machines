'use strict';

const INTERVAL = process.env.INTERVAL || 16;

const _ = require( 'lodash' );
const WebSocketServer = require( 'ws' ).Server;
const wss = new WebSocketServer({ port: 8080 });

const state = {};

function toArrayBuffer( buffer ) {
  const arrayBuffer = new ArrayBuffer( buffer.length );
  const view = new Uint8Array( arrayBuffer );
  for ( let i = 0, il = buffer.length; i < il; i++ ) {
    view[i] = buffer[i];
  }

  return arrayBuffer;
}

wss.on( 'connection', function( socket ) {
  const id = _.uniqueId();

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
    state[ id ] = [].slice.call( new Float32Array( toArrayBuffer( message ) ) );
  });

  const interval = setInterval(function() {
    try {
      socket.send( JSON.stringify( state ) );
     } catch ( error ) {
       console.error( error );
       clearInterval( interval );
     }
  }, INTERVAL );

  socket.on( 'close', function() {
    clearInterval( interval );
    delete state[ id ];
  });
});
