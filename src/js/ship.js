import THREE from 'three';

const rotationMatrix = new THREE.Matrix4()
  .makeRotationFromEuler( new THREE.Euler( -Math.PI / 2, 0, 0 ) );

export default class Ship {
  constructor() {
    const geometry = new THREE.CylinderGeometry( 0, 0.1, 0.5, 3 );
    geometry.applyMatrix( rotationMatrix );
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    const material = new THREE.MeshPhongMaterial({
      shading: THREE.FlatShading
    });

    this.geometry = geometry;
    this.material = material;
    this.mesh = new THREE.Mesh( geometry, material );
  }
}
