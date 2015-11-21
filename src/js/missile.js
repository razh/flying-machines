import THREE from 'three.js';
import Entity from './Entity';
import { collisionMixin, CollisionShapes } from './collision';

const geometry = new THREE.CylinderGeometry( 0, 0.05, 0.2, 3 );

geometry.rotateX( -Math.PI / 2 );
geometry.computeFaceNormals();
geometry.computeVertexNormals();

const material = new THREE.MeshPhongMaterial({
  shading: THREE.FlatShading,
  emissive: '#333'
});

export default class Missile extends Entity {
  constructor() {
    super( geometry, material.clone() );
    collisionMixin( this );

    this.type = 'missile';
    this.shape = CollisionShapes.SPHERE;
  }
}
