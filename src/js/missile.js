import THREE from 'three';
import Entity from './entity';
import Engine from './engine';
import { collisionMixin, CollisionShapes, CollisionGroups } from './collision';
import { defineLazyGetters } from './lazy';

const geometries = defineLazyGetters( {}, {
  basic() {
    const geometry = new THREE.CylinderGeometry( 0, 0.05, 0.2, 3 );

    geometry.rotateX( -Math.PI / 2 );
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    return geometry;
  },

  rpg() {
    const points = [
      [ 0, 0 ],
      [ 0.017, 0 ],
      [ 0.01, 0.02 ],
      [ 0.01, 0.03 ],
      [ 0.027, 0.08 ],
      [ 0.007, 0.19 ],
      [ 0, 0.2 ]
    ].map( ([ x, y ]) => new THREE.Vector2( x, y ) );

    const geometry = new THREE.LatheGeometry( points )
      .rotateX( -Math.PI / 2 )
      .translate( 0, 0, 0.05 );

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    return geometry;
  }
});

const material = new THREE.MeshPhongMaterial({
  shading: THREE.FlatShading,
  emissive: '#333'
});

export default class Missile extends Entity {
  constructor() {
    super( geometries.rpg, material.clone() );
    collisionMixin( this );

    this.type = 'missile';
    this.shape = CollisionShapes.SPHERE;
    this.collisionFilterGroup = CollisionGroups.MISSILE;

    this.engine = new Engine( this, {
      radius: 0.03,
      height: 0.5
    });
    this.engine.position.set( 0, 0, 0.2 );
    this.add( this.engine );
  }
}
