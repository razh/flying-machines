import THREE from 'three';
import times from 'lodash/utility/times';

const material = new THREE.LineBasicMaterial({
  blending: THREE.AdditiveBlending,
  color: '#f43',
  linewidth: 16,
  opacity: 0.25,
  side: THREE.DoubleSide,
  transparent: true
});

export default class Trail extends THREE.Line {
  constructor( count = 64 ) {
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array( 3 * count );
    const attribute = new THREE.BufferAttribute( vertices, 3 );
    geometry.addAttribute( 'position', attribute );

    super( geometry, material );

    this.positions = times( count, () => new THREE.Vector3() );
    this.offset = 0;

    this.frustumCulled = false;
  }

  track( target ) {
    let index = 0;

    for ( let i = this.offset; i < this.positions.length; i++ ) {
      this.positions[i].toArray(
        this.geometry.attributes.position.array,
        3 * index
      );

      index++;
    }

    for ( let i = 0; i < this.offset; i++ ) {
      this.positions[i].toArray(
        this.geometry.attributes.position.array,
        3 * index
      );

      index++;
    }

    this.positions[ this.offset ].copy( target.position );
    this.offset = ( this.offset + 1 ) % this.positions.length;

    this.geometry.attributes.position.needsUpdate = true;
  }
}
