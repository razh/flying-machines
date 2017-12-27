import * as THREE from 'three';

export default function pointerLock( controls, element = document.body ) {
  const hasPointerLock = 'pointerLockElement' in document;

  const dispatcher = new THREE.EventDispatcher();

  if ( !hasPointerLock ) {
    controls.enabled = true;
    return dispatcher;
  }

  function onPointerLockChange() {
    controls.enabled = element === document.pointerLockElement;

    dispatcher.dispatchEvent({
      type: 'change',
      enabled: controls.enabled,
    });
  }

  function onPointerLockError() {
    dispatcher.dispatchEvent({ type: 'error' });
  }

  document.addEventListener( 'pointerlockchange', onPointerLockChange );
  document.addEventListener( 'pointerlockerror', onPointerLockError );
  document.addEventListener( 'click', () => element.requestPointerLock() );

  return dispatcher;
}
