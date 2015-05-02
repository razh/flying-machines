import THREE from 'three';

export default function pointerLock( controls ) {
  const hasPointerLock = 'pointerLockElement' in document ||
    'mozPointerLockElement' in document ||
    'webkitPointerLockElement' in document;

  if ( !hasPointerLock ) {
    return;
  }

  const element = document.body;
  const dispatcher = new THREE.EventDispatcher();

  function onPointerLockChange() {
    if ( document.pointerLockElement === element ||
         document.mozPointerLockElement === element ||
         document.webkitPointerLockElement === element ) {
      controls.enabled = true;
    } else {
      controls.enabled = false;
    }

    dispatcher.dispatchEvent({
      type: 'change',
      enabled: controls.enabled
    });
  }

  function onPointerLockError() {
    dispatcher.dispatchEvent({ type: 'error' });
  }

  document.addEventListener( 'pointerlockchange', onPointerLockChange );
  document.addEventListener( 'mozpointerlockchange', onPointerLockChange );
  document.addEventListener( 'webkitpointerlockchange', onPointerLockChange );

  document.addEventListener( 'pointerlockerror', onPointerLockError );
  document.addEventListener( 'mozpointerlockerror', onPointerLockError );
  document.addEventListener( 'webkitpointerlockerror', onPointerLockError );

  element.requestPointerLock = element.requestPointerLock ||
    element.mozRequestPointerLock ||
    element.webkitRequestPointerLock;

  document.addEventListener( 'click', () => element.requestPointerLock() );

  return dispatcher;
}
