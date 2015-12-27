import THREE from 'three.js';
import Entity from './entity';
import Shield from './shield';
import Engine from './engine';
import { defineLazyGetters } from './lazy';
import { collisionMixin, CollisionShapes, CollisionGroups } from './collision';

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
