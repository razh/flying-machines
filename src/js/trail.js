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

    // Offset from target.
    this.offset = new THREE.Vector3();
    // Circular array of previous positions.
    this.positions = times( count, () => new THREE.Vector3() );
    // Current index of position array start.
    this.start = 0;

    this.frustumCulled = false;
  }

  track( target ) {
    const { position } = this.geometry.attributes;
    let index = 0;

    for ( let i = this.start; i < this.positions.length; i++ ) {
      this.positions[i].toArray( position.array, 3 * index );
      index++;
    }

    for ( let i = 0; i < this.start; i++ ) {
      this.positions[i].toArray( position.array, 3 * index );
      index++;
    }

    this.positions[ this.start ].copy( this.offset )
      .applyQuaternion( target.quaternion )
      .add( target.position );

    this.start = ( this.start + 1 ) % this.positions.length;

    position.needsUpdate = true;
  }
}
