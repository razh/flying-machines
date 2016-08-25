import {
  Mesh,
  Quaternion,
  Vector3,
} from 'three';

const vector = new Vector3();
const quaternion = new Quaternion();

export default class Entity extends Mesh {
  constructor( ...args ) {
    super( ...args );

    this.velocity = new Vector3();
    this.acceleration = new Vector3();
    this.angularVelocity = new Vector3();
  }

  update( dt ) {
    this.velocity.addScaledVector( this.acceleration, dt );
    this.position.addScaledVector( this.velocity, dt );

    vector.copy( this.angularVelocity ).multiplyScalar( dt / 2 );
    quaternion.set( vector.x, vector.y, vector.z, 1 ).normalize();
    this.quaternion.multiply( quaternion );
  }
}
