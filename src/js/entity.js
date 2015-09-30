import THREE from 'three';

const vector = new THREE.Vector3();
const quaternion = new THREE.Quaternion();

export default class Entity extends THREE.Mesh {
  constructor( ...args ) {
    super( ...args );

    this.velocity = new THREE.Vector3();
    this.angularVelocity = new THREE.Vector3();
  }

  update( dt ) {
    this.position.addScaledVector( this.velocity, dt );

    vector.copy( this.angularVelocity ).multiplyScalar( dt / 2 );
    quaternion.set( vector.x, vector.y, vector.z, 1 ).normalize();
    this.quaternion.multiply( quaternion );
  }
}
