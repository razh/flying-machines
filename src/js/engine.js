import THREE from 'three.js';

const material = new THREE.MeshLambertMaterial({
  blending: THREE.AdditiveBlending,
  color: '#fff',
  emissive: '#f43',
  transparent: true,
  opacity: 0.4
})

export class Flame extends THREE.Mesh {
  constructor( geometry ) {
    super( geometry, material );
  }
}

export default class Engine extends THREE.Group {
  constructor( source, {
    count = 3,
    radius = 0.04,
    height = 0.25,
    spread = new THREE.Vector3( 0.005, 0.005, 0.03 )
  } = {} ) {
    super();

    this.source = source;
    this.spread = spread;

    const points = [
      [ 0, 0 ],
      [ radius, height * 0.2 ],
      [ 0, height ]
    ].map( ([ x, z ]) => new THREE.Vector3( x, 0, z ) );

    this.geometry = new THREE.LatheGeometry( points, 5 );

    this.geometry.translate( 0, 0, -height / 2 );
    this.geometry.computeFaceNormals();
    this.geometry.computeVertexNormals();

    let i = count;
    while( i-- ) {
      this.add( new Flame( this.geometry ) );
    }
  }

  update() {
    this.children.forEach( flame => {
      flame.position.set(
        THREE.Math.randFloatSpread( this.spread.x ),
        THREE.Math.randFloatSpread( this.spread.y ),
        THREE.Math.randFloatSpread( this.spread.z )
      );

      flame.rotation.z = 2 * Math.PI * Math.random();
      flame.scale.setLength( THREE.Math.randFloat( 0.5, 1 ) );
    })
  }
}
