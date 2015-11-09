import THREE from 'three.js';

const geometry = new THREE.CylinderGeometry( 0, 0.04, 0.25, 5 );

geometry.rotateX( Math.PI / 2 );
geometry.computeFaceNormals();
geometry.computeVertexNormals();

const material = new THREE.MeshLambertMaterial({
  blending: THREE.AdditiveBlending,
  color: '#fff',
  emissive: '#f43',
  transparent: true,
  opacity: 0.4
})

export class Flame extends THREE.Mesh {
  constructor() {
    super( geometry, material );
  }
}

export default class Engine extends THREE.Group {
  constructor( source, count = 3 ) {
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
        THREE.Math.randFloatSpread( 0.005 ),
        THREE.Math.randFloatSpread( 0.005 ),
        THREE.Math.randFloatSpread( 0.03 )
      );

      flame.rotation.z = 2 * Math.PI * Math.random();
      flame.scale.setLength( THREE.Math.randFloat( 0.5, 1 ) );
    })
  }
}
