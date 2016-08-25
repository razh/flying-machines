import {
  PerspectiveCamera,
  Vector3,
} from 'three';

const vector = new Vector3();

export default class Camera extends PerspectiveCamera {
  constructor( ...args ) {
    super( ...args );

    this.target = null;

    this.stiffness = 6;
    this.offset = new Vector3();
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
