import THREE from 'three';

const geometry = new THREE.PlaneBufferGeometry( 1, 1 );
geometry.applyMatrix( new THREE.Matrix4().makeRotationZ( Math.PI / 4 ) );

const material = new THREE.MeshBasicMaterial();

export default class Bullet extends THREE.Mesh {
  constructor() {
    super( geometry, material );
    this.scale.setLength( 1 / 16 );

    this.type = 'Bullet';
    this.velocity = new THREE.Vector3();
  }
}
