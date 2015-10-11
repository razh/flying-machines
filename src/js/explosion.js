import THREE from 'three';
import { randomPointOnSphere } from './math';

const size = 128;
const scale = () => THREE.Math.randFloat( 0.1, 0.5 );

const canvas = document.createElement( 'canvas' );
const ctx = canvas.getContext( '2d' );

canvas.width = size;
canvas.height = size;

/*
      ratio
      |----|
    +--------+
    | +----+ |
    | |    | |
    | +----+ |
    +--------+
 */
function drawShadowRect( ctx, color, ratio, blur ) {
  ctx.shadowColor = color;
  ctx.shadowBlur = blur * size;

  ctx.fillStyle = color;
  ctx.fillRect(
    size * ( 1 - ratio ) / 2,
    size * ( 1 - ratio ) / 2,
    size * ratio,
    size * ratio
  );
}

drawShadowRect( ctx, '#f85', 0.8, 0.2 );
drawShadowRect( ctx, '#fff', 0.4, 0.2 );

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

    this.reset();
  }

  update( dt ) {
    this.children.map(( sprite, index ) => {
      const velocity = this.velocities[ index ];
      sprite.position.addScaledVector( velocity, dt );
      velocity.multiplyScalar( drag );
      sprite.scale.multiplyScalar( drag );
    });
  }

  reset() {
    this.children.map( sprite => {
      randomPointOnSphere( sprite.position )
        .multiplyScalar( THREE.Math.randFloatSpread( this.radius ) );

      sprite.scale.setLength( scale() );
    });

    this.velocities.map( velocity => {
      randomPointOnSphere( velocity ).setLength( speed );
    });
  }
}
