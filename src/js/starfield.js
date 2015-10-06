import THREE from 'three';
import { randomPointOnSphere } from './math';

const vector = new THREE.Vector3();

export default class Starfield extends THREE.BufferGeometry {
  constructor( count = 32 ) {
    super();

    const vertices = new Float32Array( count * 3 );
    let i = count;
    while ( i-- ) {
      randomPointOnSphere( vector ).toArray( vertices, i * 3 );
    }

    this.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
  }
}
