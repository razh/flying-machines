import * as THREE from 'three';
import Entity from './entity';
import { MISSILE } from './types';
import Engine from './engine';
import { collisionMixin, CollisionShapes, CollisionGroups } from './collision';
import { defineLazyGetters } from './lazy';

const geometries = defineLazyGetters( {}, {
  basic() {
    const geometry = new THREE.CylinderGeometry( 0, 0.8, 3.2, 3 );

    geometry.rotateX( -Math.PI / 2 );
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    return geometry;
  },

  rpg() {
    const points = [
      [ 0, 0 ],
      [ 0.272, 0 ],
      [ 0.16, 0.32 ],
      [ 0.16, 0.48 ],
      [ 0.432, 1.28 ],
      [ 0.112, 3.04 ],
      [ 0, 3.2 ],
    ].map( ([ x, y ]) => new THREE.Vector2( x, y ) );

    const geometry = new THREE.LatheGeometry( points )
      .rotateX( -Math.PI / 2 )
      .translate( 0, 0, 0.8 );

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    return geometry;
  },
});

const material = new THREE.MeshPhongMaterial({
  shading: THREE.FlatShading,
  emissive: '#333',
});

export default class Missile extends Entity {
  constructor() {
    super( geometries.rpg, material.clone() );
    collisionMixin( this );

    this.type = MISSILE;
    this.shape = CollisionShapes.SPHERE;
    this.collisionFilterGroup = CollisionGroups.MISSILE;

    this.engine = new Engine( this, {
      radius: 0.48,
      height: 8,
    });
    this.engine.position.set( 0, 0, 3.2 );
    this.add( this.engine );
  }
}
