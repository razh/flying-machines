import Peer from 'simple-peer';

import { createState } from './client';
import {
  serializeClientState,
  serializeServerState,
} from './encode';
import messages from './messages';

const INTERVAL = 16;

export const createPeer = (() => {
  const state = [ null ];

  return ( client, server, options = {} ) => {
    const peer = new Peer( options );
    const setState = createState( server );

    peer.on( 'connect', () => {
      const id = state.length;

      const interval = setInterval(() => {
        try {
          const clientState = serializeClientState( client );
          state[ 0 ] = clientState;
          peer.send( messages.RTCMessage.encode({
            clientState,
            serverState: serializeServerState( state ),
          }));
        } catch ( error ) {
          /* eslint-disable no-console */
          console.error( error );
          clearInterval( interval );
        }
      }, INTERVAL );

      peer.on( 'data', data => {
        const {
          clientState,
          serverState,
        } = messages.RTCMessage.decode( data );

        state[ id ] = clientState;
        if ( serverState ) {
          setState( serverState );
        }
      });

      peer.on( 'close', () => {
        clearInterval( interval );
        delete state[ id ];
      });
    });

    return peer;
  };
})();
