export default function createWebRTCInterface() {
  const group = document.createElement( 'div' );
  group.className = 'webrtc-group';

  const textarea = document.createElement( 'textarea' );
  textarea.className = 'webrtc-textarea';
  group.appendChild( textarea );

  const clientButton = document.createElement( 'button' );
  clientButton.textContent = 'Client';
  group.appendChild( clientButton );

  const serverButton = document.createElement( 'button' );
  serverButton.textContent = 'Server';
  group.appendChild( serverButton );

  document.body.appendChild( group );
}
