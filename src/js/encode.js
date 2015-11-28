import messages from './messages';

function toBuffer( arrayBuffer ) {
  const buffer = new Buffer( arrayBuffer.byteLength );
  const view = new Uint8Array( arrayBuffer );
  for ( let i = 0, il = buffer.length; i < il; i++ ) {
    buffer[i] = view[i];
  }

  return buffer;
}

export function serializeClientState( scene ) {
  const state = {
    bullets: [],
    missiles: []
  };

  scene.traverse( object => {
    if ( object.type === 'ship' ) {
      state.ship = object;
    } else if ( object.type === 'bullet' ) {
      state.bullets.push( object );
    } else if ( object.type === 'missile' ) {
      state.missiles.push( object );
    }
  });

  return state;
}

export function encodeClientState( scene ) {
  return messages.ClientState.encode( serializeClientState( scene ) );
}

export function decodeClientMessage( message ) {
  return messages.ClientState.decode( message );
}

function createInitalState() {
  return {
    ships: [],
    bullets: [],
    missiles: []
  };
}

export function serializeServerState( state ) {
  return state
    .filter( Boolean )
    .reduce(( object, value ) => {
      object.ships.push( value.ship );
      object.bullets.push( ...value.bullets );
      object.missiles.push( ...value.missiles );
      return object;
    }, createInitalState() );
}

export function encodeServerState( state ) {
  return messages.ServerState.encode( serializeServerState( state ) );
}

export function decodeServerMessage( message ) {
  return messages.ServerState.decode( toBuffer( message ) );
}
