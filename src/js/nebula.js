import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Geometry,
} from 'three';

import SimplexNoise from 'simplex-noise';

const color = new Color();
const simplex = new SimplexNoise();

function fbm3d( {
  octaves = 6,
  period = 4,
  lacunarity = 2,
  gain = 0.5,
} = {} ) {
  return ( x, y, z ) => {
    let frequency = 1 / period;
    let amplitude = gain;

    let sum = 0;
    for ( let i = 0; i < octaves; i++ ) {
      sum += amplitude * simplex.noise3D(
        x * frequency,
        y * frequency,
        z * frequency
      );

      frequency *= lacunarity;
      amplitude *= gain;
    }

    return sum;
  };
}

export default class Nebula extends BufferGeometry {
  constructor( geometry, settings ) {
    super();

    if ( geometry instanceof BufferGeometry ) {
      this.copy( geometry );
    } else if ( geometry instanceof Geometry ) {
      this.fromGeometry( geometry );
    }

    const positions = this.attributes.position.array;
    const colors = new Float32Array( positions.length );
    this.addAttribute( 'color', new BufferAttribute( colors, 3 ) );

    const fbm = fbm3d( settings );
    const { fromColor, toColor } = settings;

    for ( let i = 0; i < positions.length; i += 3 ) {
      const x = positions[ i     ];
      const y = positions[ i + 1 ];
      const z = positions[ i + 2 ];

      const alpha = 0.5 * ( fbm( x, y, z ) + 1 );

      color
        .copy( fromColor )
        .lerp( toColor, alpha )
        .toArray( colors, i );
    }
  }
}
