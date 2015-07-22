import THREE from 'three';

export default class Skybox {
  constructor( camera ) {
    this.scene = new THREE.Scene();
    this.camera = camera.clone();
  }

  render( renderer, camera ) {
    this.camera.rotation.copy( camera.rotation );
    renderer.render( this.scene, this.camera );
  }
}
