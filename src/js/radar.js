import THREE from 'three';
import createPool from './pool';

const vector = new THREE.Vector3();

const scales = {
  ship: 1 / 16,
  bullet: 1 / 64,
  drone: 1 / 32
};

const material = new THREE.SpriteMaterial({
  depthTest: false,
  rotation: Math.PI / 4
});

class RadarPoint extends THREE.Sprite {
  constructor() {
    super( material );
  }
}

export default class Radar extends THREE.Group {
  constructor( target, radius = 4, scale = 0.25 ) {
    super();

    this.blips = new THREE.Group();
    this.add( this.blips );

    this.target = target;
    this.radius = radius;
    this.radiusSquared = this.radius * this.radius;
    this.radarScale = scale;

    this.pool = createPool( this, RadarPoint );
  }

  track( scene, camera ) {
    const { target } = this;

    if ( !target ) {
      return;
    }

    this.worldToLocal( vector.copy( camera.position ) );

    scene.traverse( object => {
      const scale = scales[ object.type ];
      if ( !scale ) {
        return;
      }

      const distanceToSquared = object.position
        .distanceToSquared( target.position );

      // Add radar blip if within range.
      if ( distanceToSquared > this.radiusSquared ) {
        return;
      }

      const point = this.pool.get();
      point.scale.setLength( scale );

      point.position
        .subVectors( object.position, target.position )
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
