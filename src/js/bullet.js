import THREE from 'three';
import Entity from './entity';
import { collisionMixin } from './collision';

const geometry = new THREE.PlaneBufferGeometry( 1, 1 );
geometry.applyMatrix( new THREE.Matrix4().makeRotationZ( Math.PI / 4 ) );

const material = new THREE.MeshBasicMaterial();

export default class Bullet extends Entity {
  constructor() {
    super( geometry, material );
    collisionMixin( this );

    this.type = 'bullet';
    this.velocity = new THREE.Vector3();
    this.scale.setLength( 1 / 16 );
  }
}
