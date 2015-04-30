/* A heavily modified version of THREE.FlyControls. */
import THREE from 'three';

const vector = new THREE.Vector3();
const quaternion = new THREE.Quaternion();

export default class FlyControls {
  constructor( object, domElement = document ) {
    this.object = object;
    this.domElement = domElement;

    if ( domElement ) {
      this.domElement.setAttribute( 'tabindex', -1 );
    }

    this.speed = 1.0;
    this.turnRate = Math.PI / 4;

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

    document.addEventListener( 'keydown', this.onKeyDown.bind( this ) );
    document.addEventListener( 'keyup', this.onKeyUp.bind( this ) );

    this.updateMovementVector();
    this.updateRotationVector();
  }

  onKeyDown( event ) {
    const { keyCode } = event;

    // W.
    if ( keyCode === 87 ) { this.state.forward = 1; }
    // S.
    if ( keyCode === 83 ) { this.state.back = 1; }

    // A.
    if ( keyCode === 65 ) { this.state.left = 1; }
    // D.
    if ( keyCode === 68 ) { this.state.right = 1; }

    // R.
    if ( keyCode === 82 ) { this.state.up = 1; }
    // F.
    if ( keyCode === 70 ) { this.state.down = 1; }

    // Up.
    if ( keyCode === 38 ) { this.state.pitchUp = 1; }
    // Down.
    if ( keyCode === 40 ) { this.state.pitchDown = 1; }

    // Left.
    if ( keyCode === 37 ) { this.state.yawLeft = 1; }
    // Right.
    if ( keyCode === 39 ) { this.state.yawRight = 1; }

    // Q.
    if ( keyCode === 81 ) { this.state.rollLeft = 1; }
    // E.
    if ( keyCode === 69 ) { this.state.rollRight = 1; }

    this.updateMovementVector();
    this.updateRotationVector();
  }

  onKeyUp( event ) {
    const { keyCode } = event;

    if ( keyCode === 87 ) { this.state.forward = 0; }
    if ( keyCode === 83 ) { this.state.back = 0; }

    if ( keyCode === 65 ) { this.state.left = 0; }
    if ( keyCode === 68 ) { this.state.right = 0; }

    if ( keyCode === 82 ) { this.state.up = 0; }
    if ( keyCode === 70 ) { this.state.down = 0; }

    if ( keyCode === 38 ) { this.state.pitchUp = 0; }
    if ( keyCode === 40 ) { this.state.pitchDown = 0; }

    if ( keyCode === 37 ) { this.state.yawLeft = 0; }
    if ( keyCode === 39 ) { this.state.yawRight = 0; }

    if ( keyCode === 81 ) { this.state.rollLeft = 0; }
    if ( keyCode === 69 ) { this.state.rollRight = 0; }

    this.updateMovementVector();
    this.updateRotationVector();
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

  update( dt ) {
    const dv = this.speed * dt;
    const dr = this.turnRate * dt;

    // Translate.
    vector.copy( this.movementVector ).multiplyScalar( dv );
    this.object.position.add( vector );

    // Rotate.
    vector.copy( this.rotationVector ).multiplyScalar( dr );
    quaternion.set( vector.x, vector.y, vector.z, 1 ).normalize();
    this.object.quaternion.multiply( quaternion );
  }
}
