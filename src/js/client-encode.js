import messages from './messages';

function toBuffer( arrayBuffer ) {
  const buffer = new Buffer( arrayBuffer.byteLength );
  const view = new Uint8Array( arrayBuffer );
  for ( let i = 0, il = buffer.length; i < il; i++ ) {
    buffer[i] = view[i];
  }

  return buffer;
}

export function encodeClientState( scene ) {
  const state = {
    bullets: []
  };

  scene.traverse( object => {
    if ( object.type === 'ship' ) {
      state.ship = object;
    } else if ( object.type === 'bullet' ) {
      state.bullets.push( object );
    }
  });

  return messages.ClientState.encode( state );
}

export function decodeServerMessage( message ) {
  return messages.ServerState.decode( toBuffer( message ) );
}
