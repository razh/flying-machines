import {
  SpriteMaterial,
  Sprite,
  Group,
} from 'three';

import createPool from './pool';

const scales = {
  ship: 1 / 16,
  bullet: 1 / 96,
  drone: 1 / 32,
  missile: 1 / 48,
};

const material = new SpriteMaterial({
  depthTest: false,
  rotation: Math.PI / 4,
});

class RadarPoint extends Sprite {
  constructor() {
    super( material );
  }
}

export default class Radar extends Group {
  constructor( target, radius = 16, scale = 0.05 ) {
    super();

    this.blips = new Group();
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
