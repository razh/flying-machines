import THREE from 'three';
import Quaternion from './quaternion';

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

    vector.copy( this.angularVelocity ).multiplyScalar( dt / 2 );
    Quaternion.applyVector3( this.quaternion, vector );
  }
}
