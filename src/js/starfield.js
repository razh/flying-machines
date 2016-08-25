import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Vector3,
} from 'three';

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
  '#ffbd6f',
].map( color => new Color( color ) );

const vector = new Vector3();

export default class Starfield extends BufferGeometry {
  constructor( count = 32 ) {
    super();

    const vertices = new Float32Array( count * 3 );
    const vertexColors = new Float32Array( count * 3 );

    let i = count;
    while ( i-- ) {
      randomPointOnSphere( vector ).toArray( vertices, i * 3 );
      colors[ i % colors.length ].toArray( vertexColors, i * 3 );
    }

    this.addAttribute( 'position', new BufferAttribute( vertices, 3 ) );
    this.addAttribute( 'color', new BufferAttribute( vertexColors, 3 ) );
  }
}
