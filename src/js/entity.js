import THREE from 'three';

const vector = new THREE.Vector3();

export default class Entity extends THREE.Mesh {
  constructor( ...args ) {
    super( ...args );

    this.velocity = new THREE.Vector3();
    this.angularVelocity = new THREE.Vector3();
  }

  update( dt ) {
    vector.copy( this.velocity ).multiplyScalar( dt );
    this.position.add( vector );
  }
}
