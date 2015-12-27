import THREE from 'three.js';
import { randomPointOnSphere } from './math';
import { remove } from './utils';
import { defineLazyGetters } from './lazy';

const scale = () => THREE.Math.randFloat( 0.1, 0.5 );

const materials = defineLazyGetters( {}, {
  explosion() {
    const size = 128;

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

    return new THREE.SpriteMaterial({
      blending: THREE.AdditiveBlending,
      map: texture,
      rotation: Math.PI / 4,
      transparent: true,
      opacity: 0.9
    });
  }
});

export class ExplosionSprite extends THREE.Sprite {
  constructor() {
    super( materials.explosion );
    this.reset();
  }

  reset()  {
    this.scale.setLength( scale() );
  }
}

const speed = 2;
const decay = 6;

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
    const drag = Math.exp( -decay * dt );

    this.children.forEach(( sprite, index ) => {
      const velocity = this.velocities[ index ];
      sprite.position.addScaledVector( velocity, dt );
      velocity.multiplyScalar( drag );
      sprite.scale.multiplyScalar( drag );
    });
  }

  reset() {
    this.children.forEach( sprite => {
      randomPointOnSphere( sprite.position )
        .multiplyScalar( THREE.Math.randFloatSpread( this.radius ) );

      sprite.reset();
    });

    this.velocities.forEach( velocity => {
      randomPointOnSphere( velocity ).setLength( speed );
    });
  }

  magnitude() {
    return this.children.reduce(( magnitude, sprite ) => {
      return magnitude + sprite.scale.length();
    }, 0 );
  }
}

export class ExplosionPool extends THREE.Group {
  constructor( ...args ) {
    super( ...args );

    this.pool = [];
    this.limit = 1e-2;
  }

  get() {
    let explosion;

    if ( this.pool.length ) {
      explosion = this.pool.pop();
      explosion.reset();
    } else {
      explosion = new Explosion();
    }

    this.add( explosion );
    return explosion;
  }

  update() {
    const inactive = [];

    this.children.forEach( explosion => {
      if ( explosion.magnitude() < this.limit ) {
        inactive.push( explosion );
      }
    });

    inactive.forEach( remove );
    this.pool.push( ...inactive );
  }
}
