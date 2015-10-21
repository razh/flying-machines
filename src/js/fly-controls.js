/* A heavily modified version of THREE.FlyControls. */
import THREE from 'three.js';

const quaternion = new THREE.Quaternion();

export default class FlyControls {
  constructor( object, domElement = document ) {
    this.object = object;
    this.domElement = domElement;

    this.speed = 1.0;
    this.turnRate = Math.PI / 4;
    this.mouseSensitivity = 0.002;
    this.enabled = false;

    this.state = {
      up: 0,
      down: 0,

      left: 0,
      right: 0,

      forward: 0,
      back: 0,

      pitchUp: 0,
      pitchDown: 0,

      yawLeft: 0,
      yawRight: 0,

      rollLeft: 0,
      rollRight: 0
    };

    this.movementVector = new THREE.Vector3();
    this.rotationVector = new THREE.Vector3();

    this.onMouseMove = this.onMouseMove.bind( this );
    this.onKeyDown = this.onKeyDown.bind( this );
    this.onKeyUp = this.onKeyUp.bind( this );

    document.addEventListener( 'mousemove', this.onMouseMove );
    document.addEventListener( 'keydown', this.onKeyDown );
    document.addEventListener( 'keyup', this.onKeyUp );
  }

  onKeyDown( event ) {
    if ( !this.enabled ) {
      return;
    }

    const { keyCode } = event;
    const { state } = this;

    // W. S.
    if ( keyCode === 87 ) { state.forward = 1; }
    if ( keyCode === 83 ) { state.back = 1; }

    // A. D.
    if ( keyCode === 65 ) { state.left = 1; }
    if ( keyCode === 68 ) { state.right = 1; }

    // R. F.
    if ( keyCode === 82 ) { state.up = 1; }
    if ( keyCode === 70 ) { state.down = 1; }

    // Up. Down.
    if ( keyCode === 38 ) { state.pitchUp = 1; }
    if ( keyCode === 40 ) { state.pitchDown = 1; }

    // Left. Right.
    if ( keyCode === 37 ) { state.yawLeft = 1; }
    if ( keyCode === 39 ) { state.yawRight = 1; }

    // Q. E.
    if ( keyCode === 81 ) { state.rollLeft = 1; }
    if ( keyCode === 69 ) { state.rollRight = 1; }

    this.updateMovementVector();
    this.updateRotationVector();
  }

  onKeyUp( event ) {
    if ( !this.enabled ) {
      return;
    }

    const { keyCode } = event;
    const { state } = this;

    if ( keyCode === 87 ) { state.forward = 0; }
    if ( keyCode === 83 ) { state.back = 0; }

    if ( keyCode === 65 ) { state.left = 0; }
    if ( keyCode === 68 ) { state.right = 0; }

    if ( keyCode === 82 ) { state.up = 0; }
    if ( keyCode === 70 ) { state.down = 0; }

    if ( keyCode === 38 ) { state.pitchUp = 0; }
    if ( keyCode === 40 ) { state.pitchDown = 0; }

    if ( keyCode === 37 ) { state.yawLeft = 0; }
    if ( keyCode === 39 ) { state.yawRight = 0; }

    if ( keyCode === 81 ) { state.rollLeft = 0; }
    if ( keyCode === 69 ) { state.rollRight = 0; }

    this.updateMovementVector();
    this.updateRotationVector();
  }

  onMouseMove( event ) {
    if ( !this.enabled ) {
      return;
    }

    const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    const pitch = -movementY * this.mouseSensitivity;
    const yaw   = -movementX * this.mouseSensitivity;

    const { object } = this;

    quaternion.set( pitch, yaw, 0, 1 ).normalize();
    object.quaternion.multiply( quaternion );
  }

  updateMovementVector() {
    const { state } = this;

    this.movementVector.set(
      state.right - state.left,
      state.up    - state.down,
      state.back  - state.forward
    );
  }

  updateRotationVector() {
    const { state } = this;

    this.rotationVector.set(
      state.pitchUp  - state.pitchDown,
      state.yawLeft  - state.yawRight,
      state.rollLeft - state.rollRight
    );
  }

  update() {
    // Rotate.
    this.object.angularVelocity
      .copy( this.rotationVector )
      .multiplyScalar( this.turnRate );

    // Translate.
    this.object.velocity
      .copy( this.movementVector )
      .multiplyScalar( this.speed )
      .applyQuaternion( this.object.quaternion );
  }

  dispose() {
    document.removeEventListener( 'mousemove', this.onMouseMove );
    document.removeEventListener( 'keydown', this.onKeyDown );
    document.removeEventListener( 'keyup', this.onKeyUp );
  }
}
