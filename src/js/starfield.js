import THREE from 'three';

export default class Starfield extends THREE.BufferGeometry {
  constructor( count = 32 ) {
    super();

    // Generate random point on sphere.
    const vertices = new Float32Array( count * 3 );
    let i = count;
    while ( i-- ) {
      const theta = 2 * Math.PI * Math.random();
      const u = 2 * Math.random() - 1;
      const v = Math.sqrt( 1 - u * u );

      vertices[ 3 * i     ] = v * Math.cos( theta );
      vertices[ 3 * i + 1 ] = v * Math.sin( theta );
      vertices[ 3 * i + 2 ] = u;
    }

    this.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
  }
}
