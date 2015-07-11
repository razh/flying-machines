import THREE from 'three';
import createPool from './pool';

const geometry = new THREE.PlaneBufferGeometry( 1, 1 );
geometry.applyMatrix( new THREE.Matrix4().makeRotationZ( Math.PI / 4 ) );

const material = new THREE.MeshBasicMaterial();

const vector = new THREE.Vector3();

const scales = {
  ship: 1 / 16,
  bullet: 1 / 64
};

class RadarPoint extends THREE.Mesh {
  constructor() {
    super( geometry, material );
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

  update( scene, camera ) {
    const { target } = this;

    if ( !target ) {
      return;
    }

    this.worldToLocal( vector.copy( camera.position ) );

    scene.traverse( object => {
      if ( object.type === 'ship' || object.type === 'bullet' ) {
        const distanceToSquared = object.position
          .distanceToSquared( target.position );

        // Add radar blip if within range.
        if ( distanceToSquared <= this.radiusSquared ) {
          const point = this.pool.get();
          point.scale.setLength( scales[ object.type ] );

          this.blips.add( point );

          point.position
            .subVectors( object.position, target.position )
            .multiplyScalar( this.radarScale );

          point.lookAt( vector );
        }
      }
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
