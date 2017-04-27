import * as THREE from 'three';
import Entity from './entity';
import { DRONE } from './types';
import { collisionMixin, CollisionShapes, CollisionGroups } from './collision';

class TorusKnot extends THREE.Curve {
  constructor( scale = 160 ) {
    super();

    this.scale = scale;
  }

  getPoint( t ) {
    const p = 3;
    const q = 4;

    t *= 2 * Math.PI;

    const tx = ( 2 + Math.cos( q * t ) ) * Math.cos( p * t );
    const ty = ( 2 + Math.cos( q * t ) ) * Math.sin( p * t );
    const tz = Math.sin( q * t );

    return new THREE.Vector3( tx, ty, tz )
      .multiplyScalar( this.scale );
  }
}

const geometry = new THREE.IcosahedronBufferGeometry( 3.2 );
const material = new THREE.MeshPhongMaterial({
  shading: THREE.FlatShading,
});

export default class Drone extends Entity {
  constructor() {
    super( geometry, material.clone() );
    this.geometry.computeBoundingSphere();
    collisionMixin( this );

    this.type = DRONE;
    this.shape = CollisionShapes.SPHERE;
    this.collisionFilterGroup = CollisionGroups.SHIP;

    this.time = 0;
    this.path = new TorusKnot( 128 );
    this.length = this.path.getLength();
    this.speed = 128;
    this.duration = this.length / this.speed;
  }

  update( dt ) {
    this.time += dt;
    const t = ( this.time / this.duration ) % 1;
    const point = this.path.getPointAt( t );

    this.velocity
      .subVectors( point, this.position )
      .divideScalar( dt );

    this.position.copy( point );
  }
}
