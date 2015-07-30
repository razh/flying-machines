import THREE from 'three';

const material = new THREE.LineBasicMaterial({
  blending: THREE.AdditiveBlending,
  color: '#f43',
  depthTest: false,
  linewidth: 10,
  opacity: 0.5,
  side: THREE.DoubleSide,
  transparent: true
});

export default class Trail extends THREE.Line {
  constructor( count = 32 ) {
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array( count * 3 );
    const attribute = new THREE.BufferAttribute( vertices, 3 );
    geometry.addAttribute( 'position', attribute );

    super( geometry, material );

    this.count = count;
    this.positions = [];
    this.frustumCulled = false;
  }

  track( target ) {
    this.positions.unshift( target.position.clone() );

    while ( this.positions.length > this.count ) {
      this.positions.pop();
    }

    this.positions.forEach( ( position, index ) => {
      position.toArray( this.geometry.attributes.position.array, 3 * index );
    });

    this.geometry.attributes.position.needsUpdate = true;
  }
}
