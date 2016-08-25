import * as THREE from 'three';
import { randomPointOnSphere } from './math';

const scale = () => THREE.Math.randFloat( 0.01, 0.03 );

const material = new THREE.SpriteMaterial({
  fog: true,
  transparent: true,
  opacity: 0.2,
});

export class DebrisSprite extends THREE.Sprite {
  constructor() {
    super( material );
    this.reset();
  }

  reset() {
    this.scale.setLength( scale() );
  }
}

export default class Debris extends THREE.Group {
  constructor( radius = 6, count = 64 ) {
    super();

    this.radius = radius;

    let i = count;
    while ( i-- ) {
      const sprite = new DebrisSprite();

      // Generate a random point in the sphere.
      randomPointOnSphere( sprite.position )
        .multiplyScalar( Math.random() * radius );

      this.add( sprite );
    }
  }

  track( target ) {
    const radiusSquared = this.radius * this.radius;

    this.children.forEach( sprite => {
      const { position } = sprite;

      const distanceToSquared = position.distanceToSquared( target.position );
      if ( distanceToSquared <= radiusSquared ) {
        return;
      }

      // Generate a random point on the hemisphere along target velocity.
      randomPointOnSphere( position );
      if ( position.dot( target.velocity ) < 0 ) {
        position.negate();
      }

      position
        .multiplyScalar( this.radius )
        .add( target.position );
    });
  }
}
