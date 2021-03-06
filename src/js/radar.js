import * as THREE from 'three';
import createPool from './pool';
import { SHIP, BULLET, DRONE, MISSILE } from './types';

const scales = {
  [SHIP]: 1,
  [BULLET]: 1 / 6,
  [DRONE]: 1 / 2,
  [MISSILE]: 1 / 3,
};

const material = new THREE.SpriteMaterial({
  depthTest: false,
  rotation: Math.PI / 4,
});

class RadarPoint extends THREE.Sprite {
  constructor() {
    super( material );
  }
}

export default class Radar extends THREE.Group {
  constructor( target, radius = 256, scale = 1 / 20 ) {
    super();

    this.blips = new THREE.Group();
    this.add( this.blips );

    this.target = target;
    this.radius = radius;
    this.radarScale = scale;

    this.pool = createPool( this, RadarPoint );
  }

  track( scene ) {
    if ( !this.target ) {
      return;
    }

    const radiusSquared = this.radius * this.radius;

    scene.traverse( object => {
      const scale = scales[ object.type ];
      if ( !scale ) {
        return;
      }

      const distanceToSquared = object.position
        .distanceToSquared( this.target.position );

      // Add radar blip if within range.
      if ( distanceToSquared > radiusSquared ) {
        return;
      }

      const point = this.pool.get();
      point.scale.setLength( scale );

      point.position
        .subVectors( object.position, this.target.position )
        .multiplyScalar( this.radarScale );

      this.blips.add( point );
    });
  }

  reset() {
    // Reset blip group and pool.
    while ( this.blips.children.length ) {
      this.blips.remove( this.blips.children[0] );
    }

    this.pool.reset();
  }
}
