import THREE from 'three';
import { createPeer } from './webrtc';

export default function createWebRTCInterface() {
  const client = new THREE.Group();
  const server = new THREE.Group();

  const group = document.createElement( 'div' );
  group.className = 'webrtc-group';

  const textarea = document.createElement( 'textarea' );
  textarea.className = 'webrtc-textarea';
  group.appendChild( textarea );

  textarea.addEventListener( 'click', event => event.stopPropagation() );

  const clientButton = document.createElement( 'button' );
  clientButton.textContent = 'Client';
  group.appendChild( clientButton );

  clientButton.addEventListener( 'click', event => {
    event.preventDefault();
    event.stopPropagation();

    createPeer( client, server, { trickle: false } )
      .on( 'signal', answer => textarea.value = JSON.stringify( answer ) )
      .signal( textarea.value );
  });

  const serverButton = document.createElement( 'button' );
  serverButton.textContent = 'Server';
  group.appendChild( serverButton );

  let peer;
  serverButton.addEventListener( 'click', event => {
    event.preventDefault();
    event.stopPropagation();

    if ( !peer ) {
      peer = createPeer( client, server, { initiator: true, trickle: false } )
        .on( 'signal', offer => textarea.value = JSON.stringify( offer ) );
    } else {
      peer.signal( textarea.value );
    }
  });

  document.body.appendChild( group );
}
