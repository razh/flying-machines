import _ from 'lodash';
import messages from './messages';

export function encodeServerState( state ) {
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

export function decodeClientMessage( message ) {
  return messages.ClientState.decode( message );
}
