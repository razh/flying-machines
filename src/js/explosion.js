import THREE from 'three';
import times from 'lodash/utility/times';

const size = 64;
const border = 0.2;
const scale = () => THREE.Math.randFloat( 0.1, 0.5 );

const canvas = document.createElement( 'canvas' );
const ctx = canvas.getContext( '2d' );

canvas.width = size;
canvas.height = size;

ctx.fillStyle = '#f85';
ctx.fillRect( 0, 0, size, size );

ctx.fillStyle = '#fff';
ctx.fillRect(
  border * size,
  border * size,
  ( 1 - 2 * border ) * size,
  ( 1 - 2 * border ) * size
);

const texture = new THREE.Texture( canvas );
texture.needsUpdate = true;

const material = new THREE.SpriteMaterial({
  blending: THREE.AdditiveBlending,
  map: texture,
  rotation: Math.PI / 4,
  transparent: true,
  opacity: 0.9
});

export class ExplosionSprite extends THREE.Sprite {
  constructor() {
    super( material );

    this.scale.setLength( scale() );
  }
}

const speed = 2;
const drag = 0.95;

export default class Explosion extends THREE.Group {
  constructor( radius = 0.2, count = 24 ) {
    super();

    this.radius = radius;
    this.velocities = [];

    let i = count;
    while ( i-- ) {
      this.add( new ExplosionSprite() );
      this.velocities.push( new THREE.Vector3() );
    }

    this.reset( radius );

    setInterval( () => this.reset( radius ), 1000 );
  }

  update( dt ) {
    this.children.map(( sprite, index ) => {
      const velocity = this.velocities[ index ];
      sprite.position.addScaledVector( velocity, dt );
      velocity.multiplyScalar( drag );
      sprite.scale.multiplyScalar( drag );
    });
  }

  reset( radius ) {
    this.children.map( sprite => {
      sprite.position.set(
        THREE.Math.randFloatSpread( radius ),
        THREE.Math.randFloatSpread( radius ),
        THREE.Math.randFloatSpread( radius )
      );

      sprite.scale.setLength( scale() );
    });

    this.velocities.forEach( velocity => {
      velocity.set(
        THREE.Math.randFloatSpread( 1 ),
        THREE.Math.randFloatSpread( 1 ),
        THREE.Math.randFloatSpread( 1 )
      ).setLength( speed );
    });
  }
}
