import THREE from 'three';

export default function pointerLock( controls, element = document.body ) {
  const hasPointerLock = (
    'pointerLockElement' in document ||
    'mozPointerLockElement' in document ||
    'webkitPointerLockElement' in document
  );

  if ( !hasPointerLock ) {
    return;
  }

  const dispatcher = new THREE.EventDispatcher();

  function onPointerLockChange() {
    controls.enabled = (
      element === document.pointerLockElement ||
      element === document.mozPointerLockElement ||
      element === document.webkitPointerLockElement
    );

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

  element.requestPointerLock = (
    element.requestPointerLock ||
    element.mozRequestPointerLock ||
    element.webkitRequestPointerLock
  );

  document.addEventListener( 'click', () => element.requestPointerLock() );

  return dispatcher;
}
