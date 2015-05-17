import { Server as WebSocketServer } from 'ws';

const INTERVAL = process.env.INTERVAL || 16;

export default function createServer() {
  const server = new WebSocketServer({ port: 8080 });
  const state = [];
  let count = 0;

  server.on( 'connection', socket => {
    const id = count++;

    // Initial id message.
    socket.send( JSON.stringify({ id }) );

    socket.on( 'message', message => state[ id ] = JSON.parse( message ) );

    const interval = setInterval(() => {
      try {
        socket.send( JSON.stringify( state ) );
       } catch ( error ) {
         console.error( error );
         clearInterval( interval );
       }
    }, INTERVAL );

    socket.on( 'close', () => {
      clearInterval( interval );
      delete state[ id ];
    });
  });

  return server;
}
