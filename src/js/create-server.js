import { Server as WebSocketServer } from 'ws';
import { encodeServerState, decodeClientMessage } from './server-encode';

const INTERVAL = process.env.INTERVAL || 16;

export default function createServer() {
  const server = new WebSocketServer({ port: 8080 });
  const state = [];

  const uuid = (() => {
    let id = 0;
    return () => id++;
  })();

  server.on( 'connection', socket => {
    const id = uuid();

    socket.on( 'message', message =>
      state[ id ] = decodeClientMessage( message )
    );

    const interval = setInterval(() => {
      try {
        socket.send( encodeServerState( state ), { binary: true } );
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
