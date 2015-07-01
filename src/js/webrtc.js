import Peer from 'simple-peer';

import { createState } from './client';
import {
  encodeClientState,
  encodeServerState,
  decodeClientMessage,
  decodeServerMessage
} from './encode';

const INTERVAL = 16;

function createPeerClient( peer, client, server ) {
  const setState = createState( server );

  const interval = setInterval(() => {
    peer.send( encodeClientState( client ) );
  }, INTERVAL );

  peer.on( 'data', message => {
    const state = decodeServerMessage( message );
    if ( state ) {
      setState( state );
    }
  });

  peer.on( 'close', () => clearInterval( interval ) );
}

function createPeerServer( peer ) {
  const state = [];
  const id = state.length;

  const interval = setInterval(() => {
    try {
      peer.send( encodeServerState( state ) );
    } catch ( error ) {
      console.error( error );
      clearInterval( interval );
    }
  }, INTERVAL );

  peer.on( 'data', message =>
    state[ id ] = decodeClientMessage( message )
  );

  peer.on( 'close', () => {
    clearInterval( interval );
    delete state[ id ];
  });
}

export function createPeer( client, server, options = {} ) {
  const peer = new Peer( options );

  return peer.on( 'connect', () => {
    createPeerClient( peer, client, server );
    if ( options.initiator ) {
      createPeerServer( peer );
    }
  });
}
