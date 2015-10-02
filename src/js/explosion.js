import THREE from 'three';
import times from 'lodash/utility/times';

const diameter = 64;

const canvas = document.createElement( 'canvas' );
const ctx = canvas.getContext( '2d' );

canvas.width = diameter;
canvas.height = diameter;

ctx.fillStyle = 'rgba(240, 128, 80, 0.5)';
ctx.fillRect( 0, 0, diameter, diameter );

ctx.fillStyle = '#fff';
ctx.fillRect( 0.2 * diameter, 0.2 * diameter, 0.6 * diameter, 0.6 * diameter );

const texture = new THREE.Texture( canvas );
texture.needsUpdate = true;

const material = new THREE.SpriteMaterial({
  blending: THREE.AdditiveBlending,
  map: texture,
  rotation: Math.PI / 4,
  transparent: true
});

export class ExplosionSprite extends THREE.Sprite {
  constructor() {
    super( material );

    this.scale.setLength( 1 / 16 );
  }
}

export default class Explosion extends THREE.Group {
  constructor( count = 32 ) {
    super();

    let i = count;
    while ( i-- ) {
      const sprite = new ExplosionSprite();
      sprite.position.set(
        THREE.Math.randFloatSpread( 0.5 ),
        THREE.Math.randFloatSpread( 0.5 ),
        THREE.Math.randFloatSpread( 0.5 )
      );
      this.add( sprite );
    }
  }
}
