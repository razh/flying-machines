import { Server as WebSocketServer } from 'ws';
import { encodeServerState, decodeClientMessage } from './encode';

const INTERVAL = process.env.INTERVAL || 16;

export default function createServer() {
  const server = new WebSocketServer({ port: 8080 });
  const state = [];

  server.on( 'connection', socket => {
    const id = state.length;
    state[ id ] = null;

    const interval = setInterval(() => {
      try {
        socket.send( encodeServerState( state ), { binary: true } );
      } catch ( error ) {
        // eslint-disable-next-line no-console
        console.error( error );
        clearInterval( interval );
      }
    }, INTERVAL );

    socket.on( 'message', message =>
      state[ id ] = decodeClientMessage( message )
    );

    socket.on( 'close', () => {
      clearInterval( interval );
      delete state[ id ];
    });
  });

  return server;
}
