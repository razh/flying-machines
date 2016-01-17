import THREE from 'three';
import Entity from './entity';
import Shield from './shield';
import Engine from './engine';
import { defineLazyGetters } from './lazy';
import { collisionMixin, CollisionShapes, CollisionGroups } from './collision';

const createLathePoint = ([ x, z ]) => new THREE.Vector3( x, 0, z );

const geometries = defineLazyGetters( {}, {
  basic() {
    const geometry = new THREE.CylinderGeometry( 0, 0.1, 0.5, 3 );

    geometry.rotateX( -Math.PI / 2 );
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    return geometry;
  },

  sphere() {
    return new THREE.IcosahedronGeometry( 0.2, 1 );
  },

  diamonds() {
    const points = [
      [ 0, 0 ],
      [ 0.05, 0.1 ],
      [ 0, 0.4 ]
    ].map( createLathePoint );

    const geometry = new THREE.LatheGeometry( points, 3 )
      .rotateZ( Math.PI / 6 );

    const boosterPoints = [
      [ 0, 0 ],
      [ 0.025, 0.04 ],
      [ 0.025, 0.08 ],
      [ 0, 0.2 ]
    ].map( createLathePoint );

    const leftBoosterGeometry = new THREE.LatheGeometry( boosterPoints, 4 );
    const rightBoosterGeometry = new THREE.LatheGeometry( boosterPoints, 4 );

    leftBoosterGeometry.translate( -0.1, 0, 0 );
    rightBoosterGeometry.translate( 0.1, 0, 0 );

    geometry.merge( leftBoosterGeometry );
    geometry.merge( rightBoosterGeometry );

    geometry.rotateX( Math.PI );
    geometry.translate( 0, 0, 0.15 );

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    return geometry;
  }
});

const material = new THREE.MeshPhongMaterial({
  shading: THREE.FlatShading
});

export default class Ship extends Entity {
  constructor() {
    super( geometries.basic, material.clone() );
    collisionMixin( this );

    this.type = 'ship';
    this.shape = CollisionShapes.SPHERE;
    this.collisionFilterGroup = CollisionGroups.SHIP;

    this.shield = new Shield();
    this.shield.visible = false;
    this.add( this.shield );

    this.engine = new Engine( this );
    this.engine.position.set( 0, 0, 0.3 );
    this.add( this.engine );
  }
}
