import * as THREE from 'three';

window.THREE = THREE;

require('three/examples/js/postprocessing/EffectComposer.js');
require('three/examples/js/postprocessing/RenderPass.js');
require('three/examples/js/postprocessing/MaskPass.js');
require('three/examples/js/postprocessing/ShaderPass.js');
require('three/examples/js/shaders/CopyShader.js');
require('three/examples/js/shaders/FXAAShader.js');
require('three/examples/js/shaders/ConvolutionShader.js');
require('three/examples/js/shaders/LuminosityHighPassShader.js');
require('three/examples/js/postprocessing/UnrealBloomPass.js');

export default class Bloom {
  constructor( renderer, scene, camera ) {
    this.scene = scene;
    this.camera = camera;

    this.renderPass = new THREE.RenderPass( scene, camera );

    this.fxaa = new THREE.ShaderPass( THREE.FXAAShader );
    this.fxaa.uniforms.resolution.value.set(
      1 / window.innerWidth,
      1 / window.innerHeight
    );

    this.copy = new THREE.ShaderPass( THREE.CopyShader );
    this.copy.renderToScreen = true;

    this.bloom = new THREE.UnrealBloomPass(
      new THREE.Vector2(
        window.innerWidth,
        window.innerHeight
      ),
      1.5,
      0.4,
      0.85
    );

    this.composer = new THREE.EffectComposer( renderer );
    this.composer.setSize(window.innerWidth, window.innerHeight);
    this.composer.addPass( this.renderPass );
    this.composer.addPass( this.fxaa );
    this.composer.addPass( this.bloom );
    this.composer.addPass( this.copy );
  }

  render() {
    this.composer.render();
  }
}
