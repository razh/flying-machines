import THREE from 'three';
import SimplexNoise from 'simplex-noise';
import assign from 'lodash/object/assign';

const color = new THREE.Color();
const simplex = new SimplexNoise();

export default class Nebula extends THREE.BufferGeometry {
  constructor( settings, ...args ) {
    super();

    const sphere = new THREE.IcosahedronGeometry( ...args );
    this.fromGeometry( sphere, assign( {}, settings ) );

    const { fromColor, toColor } = settings;

    const positions = this.attributes.position.array;
    const colors = new Float32Array( positions.length );
    this.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );

    for ( let i = 0; i < positions.length; i += 3 ) {
      const x = positions[ i     ];
      const y = positions[ i + 1 ];
      const z = positions[ i + 2 ];

      const alpha = simplex.noise3D( x, y, z ) * 0.5 + 0.5;

      color
        .copy( fromColor )
        .lerp( toColor, alpha );

      colors[ i     ] = color.r;
      colors[ i + 1 ] = color.g;
      colors[ i + 2 ] = color.b;
    }
  }
}
