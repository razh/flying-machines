import * as THREE from 'three';

const material = new THREE.MeshLambertMaterial({
  blending: THREE.AdditiveBlending,
  color: '#fff',
  emissive: '#f43',
  transparent: true,
  opacity: 0.4,
  premultipliedAlpha: true,
})

export class Flame extends THREE.Mesh {
  constructor( geometry ) {
    super( geometry, material );
  }
}

export default class Engine extends THREE.Group {
  constructor( source, {
    count = 3,
    radius = 0.64,
    height = 4,
    spread = new THREE.Vector3( 0.08, 0.08, 0.5 ),
  } = {} ) {
    super();

    this.source = source;
    this.spread = spread;

    const points = [
      [ 0, 0 ],
      [ radius, height * 0.2 ],
      [ 0, height ],
    ].map( ([ x, y ]) => new THREE.Vector2( x, y ) );

    this.geometry = new THREE.LatheGeometry( points, 5 )
      .rotateX( Math.PI / 2 )
      .translate( 0, 0, -height / 2 );

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
