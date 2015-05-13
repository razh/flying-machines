'use strict';

const INTERVAL = process.env.INTERVAL || 16;

const WebSocketServer = require( 'ws' ).Server;
const wss = new WebSocketServer({ port: 8080 });

const state = [];

let count = 0;
wss.on( 'connection', function( socket ) {
  const id = count++;

  // Initial id message.
  socket.send( JSON.stringify({ id }) );

  socket.on( 'message', function( message ) {
    state[ id ] = JSON.parse( message );
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
