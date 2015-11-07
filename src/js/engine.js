import THREE from 'three.js';

const geometry = new THREE.CylinderGeometry( 0, 0.05, 0.3, 3 );

geometry.rotateX( Math.PI / 2 );
geometry.computeFaceNormals();
geometry.computeVertexNormals();

const material = new THREE.MeshBasicMaterial({
  blending: THREE.AdditiveBlending,
  color: '#aaf',
  transparent: true,
  opacity: 0.4
})

export class Flame extends THREE.Mesh {
  constructor() {
    super( geometry, material );

    this.scale.setLength( THREE.Math.randFloat( 0.5, 1 ) );
    this.rotation.z = 2 * Math.PI * Math.random();
  }
}

export default class Engine extends THREE.Group {
  constructor( source, count = 12 ) {
    super();

    this.source = source;

    let i = count;
    while( i-- ) {
      this.add( new Flame() );
    }
  }

  update() {
    this.children.forEach( flame => {
      flame.position.set(
        THREE.Math.randFloatSpread( 0.03 ),
        THREE.Math.randFloatSpread( 0.03 ),
        THREE.Math.randFloatSpread( 0.03 )
      );
    })
  }
}
