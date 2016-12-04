import * as THREE from 'three';

const geometry = new THREE.IcosahedronBufferGeometry( 0.2, 1 );
const material = new THREE.MeshPhongMaterial({
  opacity: 0,
  transparent: true,
  wireframe: true,
});

export default class Shield extends THREE.Mesh {
  constructor() {
    super( geometry, material.clone() );
  }
}
