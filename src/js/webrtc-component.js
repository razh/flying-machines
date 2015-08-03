import Peer from 'simple-peer';
import { createPeer } from './webrtc';

export default function createWebRTCInterface( client, server ) {
  if ( !Peer.WEBRTC_SUPPORT ) {
    return;
  }

  const group = document.createElement( 'div' );
  group.className = 'webrtc-group';

  const textarea = document.createElement( 'textarea' );
  textarea.className = 'webrtc-textarea';
  textarea.spellcheck = false;
  group.appendChild( textarea );

  textarea.addEventListener( 'click', event => event.stopPropagation() );

  const serverButton = document.createElement( 'button' );
  serverButton.className = 'webrtc-button';
  serverButton.textContent = 'Create Server';
  group.appendChild( serverButton );

  let peer;

  function createOffer() {
    peer = createPeer( client, server, { initiator: true, trickle: false } )
      .on( 'signal', offer => textarea.value = JSON.stringify( offer ) );
    }

  function createAnswer() {
    createPeer( client, server, { trickle: false } )
      .on( 'signal', answer => textarea.value = JSON.stringify( answer ) )
      .signal( textarea.value );
  }

  function connect() {
    peer.signal( textarea.value );
  }

  serverButton.addEventListener( 'click', event => {
    event.preventDefault();
    event.stopPropagation();

    if ( !peer ) {
      createOffer();
    } else {
      connect();
    }
  });

  textarea.addEventListener( 'input', () => {
    const message = JSON.parse( textarea.value );
    if ( !message ) {
      return;
    }

    if ( message.type === 'offer' ) {
      createAnswer();
    } else if ( message.type === 'answer' ) {
      connect();
    } else {
      return;
    }

    textarea.value = '';
  });

  document.body.appendChild( group );
}
