import THREE from 'three.js';
import Entity from './entity';
import Shield from './shield';
import Engine from './engine';
import { collisionMixin, CollisionShapes } from './collision';

const geometries = {
  basic: (() => {
    const geometry = new THREE.CylinderGeometry( 0, 0.1, 0.5, 3 );

    geometry.rotateX( -Math.PI / 2 );
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    return geometry;
  })(),

  sphere: new THREE.IcosahedronGeometry( 0.2, 2 )
};

const material = new THREE.MeshPhongMaterial({
  shading: THREE.FlatShading
});

export default class Ship extends Entity {
  constructor() {
    super( geometries.basic, material.clone() );
    collisionMixin( this );

    this.type = 'ship';
    this.shape = CollisionShapes.SPHERE;

    this.shield = new Shield();
    this.shield.visible = false;
    this.add( this.shield );

    this.engine = new Engine( this );
    this.engine.position.set( 0, 0, 0.3 );
    this.add( this.engine );
  }
}
