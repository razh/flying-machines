import THREE from 'three';
import createPool from './pool';

const geometry = new THREE.PlaneBufferGeometry( 1, 1 );
geometry.applyMatrix( new THREE.Matrix4().makeRotationZ( Math.PI / 4 ) );

const material = new THREE.MeshBasicMaterial();

const vector = new THREE.Vector3();

class RadarPoint extends THREE.Mesh {
  constructor() {
    super( geometry, material );
    this.scale.setLength( 1 / 32 );
  }
}

export default class Radar extends THREE.Group {
  constructor( target ) {
    super();

    this.target = target;
    this.pool = createPool( this, RadarPoint );
    this.distance = 4;
    this.distanceSquared = this.distance * this.distance;
    this.radarScale = 0.25;
  }

  update( scene, camera ) {
    const { target, pool } = this;

    if ( !target ) {
      return;
    }

    const positions = [];

    scene.traverse( object => {
      if ( object.type === 'ship' || object.type === 'bullet' ) {
        const distanceToSquared = object.position
          .distanceToSquared( target.position );

        if ( distanceToSquared <= this.distanceSquared ) {
          positions.push( object.position );
        }
      }
    });

    // Reset group and pool.
    while ( this.children.length ) {
      this.remove( this.children[0] );
    }

    pool.reset();

    this.worldToLocal( vector.copy( camera.position ) );

    positions.forEach( position => {
      const point = pool.get();
      this.add( point );

      point.position
        .subVectors( position, target.position )
        .multiplyScalar( this.radarScale );

      point.lookAt( vector );
    });
  }
}
