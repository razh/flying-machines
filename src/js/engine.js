import {
  Math as _Math,
  AdditiveBlending,
  Group,
  LatheGeometry,
  Mesh,
  MeshLambertMaterial,
  Vector2,
  Vector3,
} from 'three';

const material = new MeshLambertMaterial({
  blending: AdditiveBlending,
  color: '#fff',
  emissive: '#f43',
  transparent: true,
  opacity: 0.4,
  premultipliedAlpha: true,
})

export class Flame extends Mesh {
  constructor( geometry ) {
    super( geometry, material );
  }
}

export default class Engine extends Group {
  constructor( source, {
    count = 3,
    radius = 0.04,
    height = 0.25,
    spread = new Vector3( 0.005, 0.005, 0.03 ),
  } = {} ) {
    super();

    this.source = source;
    this.spread = spread;

    const points = [
      [ 0, 0 ],
      [ radius, height * 0.2 ],
      [ 0, height ],
    ].map( ([ x, y ]) => new Vector2( x, y ) );

    this.geometry = new LatheGeometry( points, 5 )
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
        _Math.randFloatSpread( this.spread.x ),
        _Math.randFloatSpread( this.spread.y ),
        _Math.randFloatSpread( this.spread.z )
      );

      flame.rotation.z = 2 * Math.PI * Math.random();
      flame.scale.setLength( _Math.randFloat( 0.5, 1 ) );
    })
  }
}
