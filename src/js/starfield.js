import THREE from 'three';
import { randomPointOnSphere } from './math';

// https://en.wikipedia.org/wiki/Stellar_classification
// http://www.vendian.org/mncharity/dir3/starcolor/
const colors = [
  '#9bb0ff',
  '#aabfff',
  '#cad8ff',
  '#fbf8ff',
  '#fff4e8',
  '#ffddb4',
  '#ffbd6f'
];

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
