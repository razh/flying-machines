import _ from 'lodash';
import { Server as WebSocketServer } from 'ws';
import messages from './messages';

const INTERVAL = process.env.INTERVAL || 16;

function encode( state ) {
  return messages.ServerState.encode(
    _( state )
      .filter( Boolean )
      .reduce(
        ( object, value ) => {
          object.ships.push( value.ship );
          object.bullets.push( ...value.bullets );
          return object;
        },
        {
          ships: [],
          bullets: []
        }
      )
  );
}

export default function createServer() {
  const server = new WebSocketServer({ port: 8080 });
  const state = [];

  const uuid = (() => {
    let id = 0;
    return () => id++;
  })();

  server.on( 'connection', socket => {
    const id = uuid();

    socket.on( 'message', message => {
      state[ id ] = messages.ClientState.decode( message );
    });

    const interval = setInterval(() => {
      try {
        socket.send( encode( state ), { binary: true } );
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
