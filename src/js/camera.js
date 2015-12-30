import THREE from 'three.js';

const vector = new THREE.Vector3();

export default class Camera extends THREE.PerspectiveCamera {
  constructor( ...args ) {
    super( ...args );

    this.target = null;

    this.stiffness = 6;
    this.offset = new THREE.Vector3();
  }

  update( dt ) {
    if ( !this.target ) {
      return;
    }

    // Ideal camera position.
    vector.copy( this.offset )
      .applyQuaternion( this.target.quaternion )
      .add( this.target.position );

    this.position.lerp( vector, this.stiffness * dt );
    this.quaternion.slerp( this.target.quaternion, this.stiffness * dt );
  }
}
